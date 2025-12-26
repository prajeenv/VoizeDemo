/**
 * Utilities for parsing voice transcripts and extracting structured data
 */

/**
 * Find the LAST match of a pattern in the transcript.
 * When a value is mentioned multiple times, the last mention is treated as a correction.
 */
function findLastMatch(transcript: string, pattern: RegExp): RegExpMatchArray | null {
  // Make sure we have a global regex to find all matches
  const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
  const matches = Array.from(transcript.matchAll(globalPattern));
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

/**
 * All possible field labels that users might speak across all workflows.
 * These are used to detect field boundaries when parsing transcripts.
 * When extracting content for one field, we stop at the next field label.
 */
const ALL_FIELD_LABELS = [
  // Medication Administration fields
  'patient id', 'medication name', 'dosage', 'dose', 'route', 'route of administration',
  'time administered', 'patient response', 'patient reaction', 'adverse reaction',
  'adverse effects', 'side effects',
  // Vital Signs fields
  'blood pressure', 'bp', 'heart rate', 'pulse', 'temperature', 'temp',
  'respiratory rate', 'respiration', 'oxygen saturation', 'o2 sat', 'spo2',
  'pain level', 'pain score',
  // Patient Assessment fields
  'level of consciousness', 'consciousness', 'mobility', 'mobility status',
  'skin condition', 'skin', 'observations', 'general observations', 'notes',
  // Wound Care fields
  'wound location', 'wound type', 'wound size', 'length', 'width', 'depth',
  'drainage amount', 'drainage type', 'treatment', 'treatment provided',
  // Shift Handoff fields (SBAR)
  'situation', 'background', 'assessment', 'recommendation', 'pending tasks',
  'critical alerts', 'outgoing nurse', 'incoming nurse',
  // Intake/Output fields
  'intake', 'output', 'fluid intake', 'urine output'
];

/**
 * Build a regex pattern that matches any field label (case insensitive)
 * Sorted by length descending so longer labels match first
 */
function buildFieldLabelRegex(): RegExp {
  const sortedLabels = [...ALL_FIELD_LABELS].sort((a, b) => b.length - a.length);
  const escaped = sortedLabels.map(label => label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  return new RegExp(`\\b(?:${escaped.join('|')})\\b`, 'gi');
}

const FIELD_LABEL_REGEX = buildFieldLabelRegex();

/**
 * Extract content for a specific field, stopping at the next field label.
 * This ensures we don't accidentally include content meant for other fields.
 *
 * @param transcript The full transcript
 * @param fieldLabelPattern Pattern matching the start of this field (e.g., /medication\s+name/i)
 * @returns The content after the field label, up to the next field label, or null if not found
 */
function extractContentUntilNextField(transcript: string, fieldLabelPattern: RegExp): string | null {
  const match = transcript.match(fieldLabelPattern);
  if (!match || match.index === undefined) return null;

  // Get text after the matched field label
  const startPos = match.index + match[0].length;
  const remainingText = transcript.substring(startPos);

  // Find the next field label (use non-global regex to get index)
  const nonGlobalRegex = new RegExp(FIELD_LABEL_REGEX.source, 'i');
  const nextFieldMatch = remainingText.match(nonGlobalRegex);

  let content: string;
  if (nextFieldMatch && nextFieldMatch.index !== undefined) {
    // Extract only up to the next field label
    content = remainingText.substring(0, nextFieldMatch.index);
  } else {
    // No more field labels, take the rest
    content = remainingText;
  }

  // Clean up: remove leading/trailing whitespace and common punctuation
  content = content.replace(/^[\s.,;:!?]+/, '').replace(/[\s.,;:!?]+$/, '').trim();

  return content.length > 0 ? content : null;
}

// Blood pressure patterns
export const parseBloodPressure = (transcript: string): { systolic?: number; diastolic?: number; bp?: string } => {
  // Patterns: "120/80", "120 over 80", "BP 120/80", "blood pressure 120 over 80"
  const patterns = [
    /(?:BP|blood pressure)[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})/i,
    /(?:BP|blood pressure)[:\s]*(\d{2,3})\s+over\s+(\d{2,3})/i,
    /\b(\d{2,3})\s*\/\s*(\d{2,3})\b/,
    /\b(\d{2,3})\s+over\s+(\d{2,3})\b/i,
  ];

  // Find all valid matches and return the LAST one (correction behavior)
  let lastValidMatch: { systolic: number; diastolic: number; bp: string } | null = null;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      // Validate ranges (systolic: 70-250, diastolic: 40-150)
      if (systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
        lastValidMatch = {
          systolic,
          diastolic,
          bp: `${systolic}/${diastolic}`,
        };
      }
    }
  }

  return lastValidMatch || {};
};

// Heart rate patterns
export const parseHeartRate = (transcript: string): number | undefined => {
  const patterns = [
    /(?:heart rate|HR|pulse)[:\s]*(\d{2,3})\s*(?:bpm|beats)?/i,
    /pulse[:\s]*(\d{2,3})/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidHr: number | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const hr = parseInt(match[1]);
      // Validate range (30-250 bpm)
      if (hr >= 30 && hr <= 250) {
        lastValidHr = hr;
      }
    }
  }

  return lastValidHr;
};

// Temperature patterns
export const parseTemperature = (transcript: string): number | undefined => {
  const patterns = [
    /(?:temp|temperature)[:\s]*(\d{2,3}\.?\d*)\s*(?:degrees?|°)?(?:\s*F)?/i,
    /(\d{2}\.?\d*)\s*degrees?\s*(?:F|Fahrenheit)?/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidTemp: number | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const temp = parseFloat(match[1]);
      // Validate range (95-107°F for human temperature)
      if (temp >= 95 && temp <= 107) {
        lastValidTemp = temp;
      }
    }
  }

  return lastValidTemp;
};

// Respiratory rate patterns
export const parseRespiratoryRate = (transcript: string): number | undefined => {
  const patterns = [
    /(?:respiratory rate|RR|respiration)[:\s]*(\d{1,2})/i,
    /(\d{1,2})\s*(?:breaths|respirations)\s*per\s*minute/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidRr: number | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const rr = parseInt(match[1]);
      // Validate range (8-60 breaths/min)
      if (rr >= 8 && rr <= 60) {
        lastValidRr = rr;
      }
    }
  }

  return lastValidRr;
};

// Oxygen saturation patterns
export const parseOxygenSaturation = (transcript: string): number | undefined => {
  const patterns = [
    /(?:O2 sat|oxygen saturation|SpO2|O2)[:\s]*(\d{2,3})\s*%?/i,
    /sat[:\s]*(\d{2,3})\s*%/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidO2: number | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const o2 = parseInt(match[1]);
      // Validate range (70-100%)
      if (o2 >= 70 && o2 <= 100) {
        lastValidO2 = o2;
      }
    }
  }

  return lastValidO2;
};

// Pain level patterns
export const parsePainLevel = (transcript: string): number | undefined => {
  const patterns = [
    /pain[:\s]*(\d{1,2})\s*(?:out of|\/)\s*10/i,
    /pain level[:\s]*(\d{1,2})/i,
    /(\d{1,2})\s*out of\s*10\s*pain/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidPain: number | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      const pain = parseInt(match[1]);
      // Validate range (0-10)
      if (pain >= 0 && pain <= 10) {
        lastValidPain = pain;
      }
    }
  }

  return lastValidPain;
};

// Patient ID patterns
export const parsePatientId = (transcript: string): string | undefined => {
  const patterns = [
    /(?:patient|pt)(?:\s+ID)?[:\s]*([A-Z0-9]{3,10})/i,
    /(?:MRN|medical record number)[:\s]*([A-Z0-9]{3,10})/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidId: string | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      lastValidId = match[1].toUpperCase();
    }
  }

  return lastValidId;
};

// Room number patterns
export const parseRoomNumber = (transcript: string): string | undefined => {
  const patterns = [
    /room[:\s]*(\d{3,4}[A-Z]?)/i,
    /(?:in|at)\s+(?:room\s+)?(\d{3,4}[A-Z]?)/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidRoom: string | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      lastValidRoom = match[1].toUpperCase();
    }
  }

  return lastValidRoom;
};

// Medication name patterns
export const parseMedicationName = (transcript: string): string[] => {
  const medications: string[] = [];

  // Pattern 1: "medication name [actual name]" - handles voice input saying the field label
  // Use field-aware extraction to stop at the next field label
  const medNameContent = extractContentUntilNextField(transcript, /medication\s+name\b/i);
  if (medNameContent) {
    // Extract just the medication name (first word or two, alphabetic only)
    const nameMatch = medNameContent.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)/);
    if (nameMatch) {
      medications.push(nameMatch[1].trim());
    }
  }

  // Pattern 2: Common medication keywords followed by name
  const medKeywords = [
    'administered',
    'given',
    'gave',
    'med',
    'drug',
  ];

  // Look for medication names after keywords (also field-aware)
  medKeywords.forEach((keyword) => {
    const keywordPattern = new RegExp(`\\b${keyword}\\b`, 'i');
    const content = extractContentUntilNextField(transcript, keywordPattern);
    if (content) {
      const nameMatch = content.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?)/);
      if (nameMatch) {
        medications.push(nameMatch[1].trim());
      }
    }
  });

  return [...new Set(medications)]; // Remove duplicates
};

// Dosage patterns
export const parseDosage = (transcript: string): string | undefined => {
  const patterns = [
    /(\d+\.?\d*)\s*(mg|milligrams?|mcg|micrograms?|units?|ml|cc|grams?|g)/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidDosage: string | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      lastValidDosage = `${match[1]} ${match[2].toLowerCase()}`;
    }
  }

  return lastValidDosage;
};

// Route patterns
export const parseMedicationRoute = (transcript: string): string | undefined => {
  const routes: Record<string, string> = {
    'by mouth': 'PO',
    'oral': 'PO',
    'orally': 'PO',
    'PO': 'PO',
    'IV': 'IV',
    'intravenous': 'IV',
    'IM': 'IM',
    'intramuscular': 'IM',
    'subcutaneous': 'SQ',
    'subq': 'SQ',
    'SQ': 'SQ',
    'sublingual': 'SL',
    'topical': 'TOP',
    'inhalation': 'INH',
    'rectal': 'PR',
  };

  const lowerTranscript = transcript.toLowerCase();

  for (const [key, value] of Object.entries(routes)) {
    if (lowerTranscript.includes(key.toLowerCase())) {
      return value;
    }
  }

  return undefined;
};

// Level of consciousness patterns
export const parseLevelOfConsciousness = (transcript: string): string | undefined => {
  const levels = [
    'alert',
    'confused',
    'drowsy',
    'lethargic',
    'stuporous',
    'comatose',
    'responsive',
    'unresponsive',
  ];

  const lowerTranscript = transcript.toLowerCase();

  for (const level of levels) {
    if (lowerTranscript.includes(level)) {
      return level;
    }
  }

  return undefined;
};

// Mobility status patterns
export const parseMobilityStatus = (transcript: string): string | undefined => {
  const statuses = [
    'ambulatory',
    'ambulating',
    'walking',
    'bedbound',
    'bed bound',
    'wheelchair',
    'assisted',
    'assistance',
  ];

  const lowerTranscript = transcript.toLowerCase();

  for (const status of statuses) {
    if (lowerTranscript.includes(status)) {
      if (status.includes('ambul') || status === 'walking') return 'ambulatory';
      if (status.includes('bed')) return 'bedbound';
      if (status.includes('assist')) return 'assisted';
      if (status.includes('wheelchair')) return 'wheelchair';
    }
  }

  return undefined;
};

// Wound location patterns
export const parseWoundLocation = (transcript: string): string | undefined => {
  const bodyParts = [
    'sacrum',
    'heel',
    'elbow',
    'hip',
    'ankle',
    'shoulder',
    'coccyx',
    'back',
    'buttock',
    'leg',
    'arm',
    'foot',
    'hand',
  ];

  const lowerTranscript = transcript.toLowerCase();

  for (const part of bodyParts) {
    if (lowerTranscript.includes(part)) {
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  return undefined;
};

// Wound size patterns (length x width x depth)
export const parseWoundSize = (transcript: string): { length?: number; width?: number; depth?: number } | undefined => {
  // Pattern: "2 by 3 by 1 cm" or "2x3x1" or "2 cm by 3 cm"
  const patterns = [
    /(\d+\.?\d*)\s*(?:cm|centimeters?)?\s*(?:by|x)\s*(\d+\.?\d*)\s*(?:cm|centimeters?)?\s*(?:by|x)?\s*(\d+\.?\d*)?\s*(?:cm|centimeters?)?/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidSize: { length?: number; width?: number; depth?: number } | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      lastValidSize = {
        length: parseFloat(match[1]),
        width: parseFloat(match[2]),
        depth: match[3] ? parseFloat(match[3]) : undefined,
      };
    }
  }

  return lastValidSize;
};

// Extract timestamp or time from transcript
export const parseTime = (transcript: string): string | undefined => {
  // Pattern: "at 14:30", "at 2:30 PM", "14:30", "2:30 PM"
  const patterns = [
    /(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
  ];

  // Find the LAST valid match (correction behavior)
  let lastValidTime: string | undefined;

  for (const pattern of patterns) {
    const match = findLastMatch(transcript, pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }

      lastValidTime = `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  return lastValidTime;
};

/**
 * Extract all vital signs from transcript
 */
export const extractVitalSigns = (transcript: string) => {
  const bp = parseBloodPressure(transcript);

  return {
    bloodPressure: bp.bp,
    systolic: bp.systolic,
    diastolic: bp.diastolic,
    heartRate: parseHeartRate(transcript),
    temperature: parseTemperature(transcript),
    respiratoryRate: parseRespiratoryRate(transcript),
    oxygenSaturation: parseOxygenSaturation(transcript),
    painLevel: parsePainLevel(transcript),
  };
};

/**
 * Extract patient information from transcript
 */
export const extractPatientInfo = (transcript: string) => {
  return {
    patientId: parsePatientId(transcript),
    roomNumber: parseRoomNumber(transcript),
  };
};

/**
 * Extract medication information from transcript
 */
export const extractMedicationInfo = (transcript: string) => {
  return {
    medications: parseMedicationName(transcript),
    dosage: parseDosage(transcript),
    route: parseMedicationRoute(transcript),
    timeAdministered: parseTime(transcript),
  };
};

/**
 * Extract assessment information from transcript
 */
export const extractAssessmentInfo = (transcript: string) => {
  return {
    levelOfConsciousness: parseLevelOfConsciousness(transcript),
    mobilityStatus: parseMobilityStatus(transcript),
    painLevel: parsePainLevel(transcript),
  };
};

/**
 * Extract wound care information from transcript
 */
export const extractWoundInfo = (transcript: string) => {
  const size = parseWoundSize(transcript);

  return {
    location: parseWoundLocation(transcript),
    length: size?.length,
    width: size?.width,
    depth: size?.depth,
  };
};
