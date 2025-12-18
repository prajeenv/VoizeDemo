/**
 * Utilities for parsing voice transcripts and extracting structured data
 */

// Blood pressure patterns
export const parseBloodPressure = (transcript: string): { systolic?: number; diastolic?: number; bp?: string } => {
  // Patterns: "120/80", "120 over 80", "BP 120/80", "blood pressure 120 over 80"
  const patterns = [
    /(?:BP|blood pressure)[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})/i,
    /(?:BP|blood pressure)[:\s]*(\d{2,3})\s+over\s+(\d{2,3})/i,
    /\b(\d{2,3})\s*\/\s*(\d{2,3})\b/,
    /\b(\d{2,3})\s+over\s+(\d{2,3})\b/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const systolic = parseInt(match[1]);
      const diastolic = parseInt(match[2]);
      // Validate ranges (systolic: 70-250, diastolic: 40-150)
      if (systolic >= 70 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
        return {
          systolic,
          diastolic,
          bp: `${systolic}/${diastolic}`,
        };
      }
    }
  }

  return {};
};

// Heart rate patterns
export const parseHeartRate = (transcript: string): number | undefined => {
  const patterns = [
    /(?:heart rate|HR|pulse)[:\s]*(\d{2,3})\s*(?:bpm|beats)?/i,
    /pulse[:\s]*(\d{2,3})/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const hr = parseInt(match[1]);
      // Validate range (30-250 bpm)
      if (hr >= 30 && hr <= 250) {
        return hr;
      }
    }
  }

  return undefined;
};

// Temperature patterns
export const parseTemperature = (transcript: string): number | undefined => {
  const patterns = [
    /(?:temp|temperature)[:\s]*(\d{2,3}\.?\d*)\s*(?:degrees?|°)?(?:\s*F)?/i,
    /(\d{2}\.?\d*)\s*degrees?\s*(?:F|Fahrenheit)?/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const temp = parseFloat(match[1]);
      // Validate range (95-107°F for human temperature)
      if (temp >= 95 && temp <= 107) {
        return temp;
      }
    }
  }

  return undefined;
};

// Respiratory rate patterns
export const parseRespiratoryRate = (transcript: string): number | undefined => {
  const patterns = [
    /(?:respiratory rate|RR|respiration)[:\s]*(\d{1,2})/i,
    /(\d{1,2})\s*(?:breaths|respirations)\s*per\s*minute/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const rr = parseInt(match[1]);
      // Validate range (8-60 breaths/min)
      if (rr >= 8 && rr <= 60) {
        return rr;
      }
    }
  }

  return undefined;
};

// Oxygen saturation patterns
export const parseOxygenSaturation = (transcript: string): number | undefined => {
  const patterns = [
    /(?:O2 sat|oxygen saturation|SpO2|O2)[:\s]*(\d{2,3})\s*%?/i,
    /sat[:\s]*(\d{2,3})\s*%/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const o2 = parseInt(match[1]);
      // Validate range (70-100%)
      if (o2 >= 70 && o2 <= 100) {
        return o2;
      }
    }
  }

  return undefined;
};

// Pain level patterns
export const parsePainLevel = (transcript: string): number | undefined => {
  const patterns = [
    /pain[:\s]*(\d{1,2})\s*(?:out of|\/)\s*10/i,
    /pain level[:\s]*(\d{1,2})/i,
    /(\d{1,2})\s*out of\s*10\s*pain/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const pain = parseInt(match[1]);
      // Validate range (0-10)
      if (pain >= 0 && pain <= 10) {
        return pain;
      }
    }
  }

  return undefined;
};

// Patient ID patterns
export const parsePatientId = (transcript: string): string | undefined => {
  const patterns = [
    /(?:patient|pt)(?:\s+ID)?[:\s]*([A-Z0-9]{3,10})/i,
    /(?:MRN|medical record number)[:\s]*([A-Z0-9]{3,10})/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return undefined;
};

// Room number patterns
export const parseRoomNumber = (transcript: string): string | undefined => {
  const patterns = [
    /room[:\s]*(\d{3,4}[A-Z]?)/i,
    /(?:in|at)\s+(?:room\s+)?(\d{3,4}[A-Z]?)/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return undefined;
};

// Medication name patterns
export const parseMedicationName = (transcript: string): string[] => {
  // Common medication keywords
  const medKeywords = [
    'administered',
    'given',
    'gave',
    'medication',
    'med',
    'drug',
  ];

  const medications: string[] = [];

  // Look for medication names after keywords
  medKeywords.forEach((keyword) => {
    const regex = new RegExp(`${keyword}[:\\s]+([A-Za-z]+(?:\\s+[A-Za-z]+)?)`, 'gi');
    const matches = transcript.matchAll(regex);
    for (const match of matches) {
      if (match[1]) {
        medications.push(match[1].trim());
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

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return `${match[1]} ${match[2].toLowerCase()}`;
    }
  }

  return undefined;
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

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      return {
        length: parseFloat(match[1]),
        width: parseFloat(match[2]),
        depth: match[3] ? parseFloat(match[3]) : undefined,
      };
    }
  }

  return undefined;
};

// Extract timestamp or time from transcript
export const parseTime = (transcript: string): string | undefined => {
  // Pattern: "at 14:30", "at 2:30 PM", "14:30", "2:30 PM"
  const patterns = [
    /(?:at\s+)?(\d{1,2}):(\d{2})\s*(AM|PM)?/i,
  ];

  for (const pattern of patterns) {
    const match = transcript.match(pattern);
    if (match) {
      let hours = parseInt(match[1]);
      const minutes = match[2];
      const meridiem = match[3]?.toUpperCase();

      if (meridiem === 'PM' && hours < 12) {
        hours += 12;
      } else if (meridiem === 'AM' && hours === 12) {
        hours = 0;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }
  }

  return undefined;
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
