/**
 * Parse Service - Intelligent Voice Transcript Parser
 * Converts raw voice transcripts into structured nursing documentation data
 *
 * Capabilities:
 * - Extract vital signs from natural language
 * - Parse medication administration records
 * - Structure patient assessments
 * - Handle medical terminology and abbreviations
 * - Provide confidence scores for extracted data
 */

import type {
  WorkflowType,
  StructuredData,
  VitalSigns,
  Medication,
  MedicationRoute,
  Assessment,
  WoundDetails,
  WoundType,
  WoundStage,
  LevelOfConsciousness,
} from '../../../shared/types';

// ============================================================================
// TYPES
// ============================================================================

export interface ParseResult {
  structuredData: StructuredData;
  confidence: { [field: string]: number };
  needsReview: string[];
}

export interface FieldExtraction {
  value: any;
  confidence: number;
  rawText?: string;
}

// ============================================================================
// MEDICAL TERMINOLOGY DICTIONARY
// ============================================================================

/**
 * Common medical abbreviations and their meanings
 */
const MEDICAL_ABBREVIATIONS: Record<string, string> = {
  // Routes
  'po': 'PO',
  'by mouth': 'PO',
  'oral': 'PO',
  'orally': 'PO',
  'iv': 'IV',
  'intravenous': 'IV',
  'intravenously': 'IV',
  'im': 'IM',
  'intramuscular': 'IM',
  'sq': 'SQ',
  'subq': 'SQ',
  'subcutaneous': 'SQ',
  'sl': 'SL',
  'sublingual': 'SL',
  'pr': 'PR',
  'rectal': 'PR',
  'top': 'TOP',
  'topical': 'TOP',
  'inh': 'INH',
  'inhaled': 'INH',
  'inhalation': 'INH',
  'oph': 'OPH',
  'ophthalmic': 'OPH',
  'ot': 'OT',
  'otic': 'OT',
  'ng': 'NG',
  'nasogastric': 'NG',
  'gt': 'GT',
  'gastrostomy': 'GT',

  // Frequencies
  'prn': 'PRN',
  'as needed': 'PRN',
  'bid': 'BID',
  'twice daily': 'BID',
  'twice a day': 'BID',
  'tid': 'TID',
  'three times daily': 'TID',
  'three times a day': 'TID',
  'qid': 'QID',
  'four times daily': 'QID',
  'four times a day': 'QID',
  'qd': 'QD',
  'daily': 'QD',
  'once a day': 'QD',
  'q4h': 'Q4H',
  'every four hours': 'Q4H',
  'q6h': 'Q6H',
  'every six hours': 'Q6H',
  'q8h': 'Q8H',
  'every eight hours': 'Q8H',
  'q12h': 'Q12H',
  'every twelve hours': 'Q12H',

  // Vital signs
  'bp': 'blood pressure',
  'hr': 'heart rate',
  'pulse': 'heart rate',
  'temp': 'temperature',
  'rr': 'respiratory rate',
  'respiration': 'respiratory rate',
  'spo2': 'oxygen saturation',
  'o2 sat': 'oxygen saturation',
  'oxygen sat': 'oxygen saturation',

  // Assessment
  'a&o': 'alert and oriented',
  'aox': 'alert and oriented',
  'loc': 'level of consciousness',
  'rom': 'range of motion',
  'adl': 'activities of daily living',
};

/**
 * Number word to digit conversion
 */
const NUMBER_WORDS: Record<string, number> = {
  'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
  'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
  'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
  'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
  'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
  'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
  'hundred': 100, 'thousand': 1000,
};

/**
 * Common medication names and their standard forms
 */
const MEDICATION_NAMES: Record<string, string> = {
  'morphine': 'Morphine',
  'tylenol': 'Acetaminophen',
  'acetaminophen': 'Acetaminophen',
  'advil': 'Ibuprofen',
  'ibuprofen': 'Ibuprofen',
  'lasix': 'Furosemide',
  'furosemide': 'Furosemide',
  'insulin': 'Insulin',
  'heparin': 'Heparin',
  'warfarin': 'Warfarin',
  'coumadin': 'Warfarin',
  'metoprolol': 'Metoprolol',
  'lopressor': 'Metoprolol',
  'lisinopril': 'Lisinopril',
  'zestril': 'Lisinopril',
  'atorvastatin': 'Atorvastatin',
  'lipitor': 'Atorvastatin',
  'metformin': 'Metformin',
  'glucophage': 'Metformin',
  'levothyroxine': 'Levothyroxine',
  'synthroid': 'Levothyroxine',
  'omeprazole': 'Omeprazole',
  'prilosec': 'Omeprazole',
  'albuterol': 'Albuterol',
  'proventil': 'Albuterol',
  'ventolin': 'Albuterol',
  'aspirin': 'Aspirin',
  'vancomycin': 'Vancomycin',
  'zofran': 'Ondansetron',
  'ondansetron': 'Ondansetron',
  'dilaudid': 'Hydromorphone',
  'hydromorphone': 'Hydromorphone',
  'ativan': 'Lorazepam',
  'lorazepam': 'Lorazepam',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert text numbers to digits (e.g., "one twenty" -> 120, "ninety eight point six" -> 98.6)
 */
function convertTextToNumber(text: string): number | null {
  const normalized = text.toLowerCase().trim();

  // Check if already a number
  const directNumber = parseFloat(normalized);
  if (!isNaN(directNumber)) {
    return directNumber;
  }

  // Handle decimal numbers spoken as "point"
  // e.g., "ninety eight point six" -> 98.6
  if (normalized.includes(' point ')) {
    const [wholePart, decimalPart] = normalized.split(' point ');
    const whole = convertTextToNumber(wholePart);
    const decimal = convertTextToNumber(decimalPart);
    if (whole !== null && decimal !== null) {
      // Handle decimal part properly (e.g., "six" -> 0.6)
      const decimalPlaces = decimalPart.trim().split(/\s+/).length;
      return whole + (decimal / Math.pow(10, decimalPlaces));
    }
  }

  // Handle compound numbers like "one twenty" (120) or "ninety eight" (98)
  const words = normalized.split(/\s+/);
  let result = 0;
  let current = 0;

  for (const word of words) {
    const num = NUMBER_WORDS[word];
    if (num !== undefined) {
      if (num === 100 || num === 1000) {
        current = (current || 1) * num;
      } else if (num >= 20) {
        current += num;
      } else {
        current += num;
      }
    }
  }

  result += current;
  return result > 0 ? result : null;
}

/**
 * Normalize medical terminology
 */
function normalizeMedicalTerm(text: string): string {
  const normalized = text.toLowerCase().trim();
  return MEDICAL_ABBREVIATIONS[normalized] || text;
}

/**
 * Extract medication route from text
 */
function extractRoute(text: string): MedicationRoute | null {
  const normalized = text.toLowerCase();
  const routeMap: Record<string, MedicationRoute> = {
    'po': 'PO', 'oral': 'PO', 'by mouth': 'PO', 'orally': 'PO',
    'iv': 'IV', 'intravenous': 'IV', 'intravenously': 'IV',
    'im': 'IM', 'intramuscular': 'IM',
    'sq': 'SQ', 'subq': 'SQ', 'subcutaneous': 'SQ',
    'sl': 'SL', 'sublingual': 'SL',
    'pr': 'PR', 'rectal': 'PR', 'rectally': 'PR',
    'top': 'TOP', 'topical': 'TOP', 'topically': 'TOP',
    'inh': 'INH', 'inhaled': 'INH', 'inhalation': 'INH',
    'oph': 'OPH', 'ophthalmic': 'OPH',
    'ot': 'OT', 'otic': 'OT',
    'ng': 'NG', 'nasogastric': 'NG',
    'gt': 'GT', 'gastrostomy': 'GT',
  };

  for (const [key, route] of Object.entries(routeMap)) {
    if (normalized.includes(key)) {
      return route;
    }
  }

  return null;
}

/**
 * Extract time from text (handles various formats)
 */
function extractTime(text: string): string | null {
  // 24-hour format: 14:30, 1430
  const time24Match = text.match(/\b([01]?\d|2[0-3]):?([0-5]\d)\b/);
  if (time24Match) {
    return `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
  }

  // Spoken time: "at two thirty PM", "fourteen thirty"
  const spokenMatch = text.match(/\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty-one|twenty-two|twenty-three)\s+(hundred|thirty|forty-five|fifteen)?\s*(am|pm|hundred)?\b/i);
  if (spokenMatch) {
    const hour = convertTextToNumber(spokenMatch[1]);
    const minute = spokenMatch[2] ? convertTextToNumber(spokenMatch[2]) : 0;
    if (hour !== null && minute !== null) {
      const isPM = spokenMatch[3]?.toLowerCase() === 'pm';
      const adjustedHour = isPM && hour < 12 ? hour + 12 : hour;
      return `${adjustedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
  }

  // Current time if mentioned but not specified
  if (text.match(/\b(now|just now|current time)\b/i)) {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  }

  return null;
}

/**
 * Standardize medication name
 */
function standardizeMedicationName(name: string): string {
  const normalized = name.toLowerCase().trim();
  return MEDICATION_NAMES[normalized] || name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

// ============================================================================
// VITAL SIGNS PARSER
// ============================================================================

/**
 * Parse vital signs from transcript
 */
function parseVitalSigns(transcript: string): { data: Partial<VitalSigns>; confidence: Record<string, number> } {
  const data: Partial<VitalSigns> = {};
  const confidence: Record<string, number> = {};
  const text = transcript.toLowerCase();

  // Blood Pressure patterns
  // "BP one twenty over eighty" -> 120/80
  // "blood pressure 120 over 80" -> 120/80
  // "BP 120/80" -> 120/80
  const bpPatterns = [
    /\b(?:bp|blood pressure)\s+(\d{2,3})\s*[\/over]\s*(\d{2,3})\b/i,
    /\b(?:bp|blood pressure)\s+(one|two)?\s*(ten|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred)?\s*(\d+)?\s+(?:over|\/)\s+(\d{2,3}|\w+)\b/i,
    /\b(systolic|sys)\s+(\d{2,3}|\w+)\s+(?:diastolic|dias)\s+(\d{2,3}|\w+)\b/i,
  ];

  for (const pattern of bpPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      let systolic: number | null = null;
      let diastolic: number | null = null;

      if (pattern === bpPatterns[0]) {
        // Direct number format: "120/80"
        systolic = parseInt(match[1]);
        diastolic = parseInt(match[2]);
      } else if (pattern === bpPatterns[1]) {
        // Spoken format: "one twenty over eighty"
        const systolicText = [match[1], match[2], match[3]].filter(Boolean).join(' ');
        systolic = convertTextToNumber(systolicText);
        diastolic = convertTextToNumber(match[4]);
      } else if (pattern === bpPatterns[2]) {
        // Systolic/Diastolic format
        systolic = convertTextToNumber(match[2]);
        diastolic = convertTextToNumber(match[3]);
      }

      if (systolic && diastolic && systolic >= 60 && systolic <= 250 && diastolic >= 40 && diastolic <= 150) {
        data.systolic = systolic;
        data.diastolic = diastolic;
        data.bloodPressure = `${systolic}/${diastolic}`;
        confidence.systolic = 0.9;
        confidence.diastolic = 0.9;
        confidence.bloodPressure = 0.9;
        break;
      }
    }
  }

  // Temperature patterns
  // "temp ninety eight point six" -> 98.6
  // "temperature 98.6" -> 98.6
  // "temp is 37.2 degrees celsius" -> 37.2
  const tempPatterns = [
    /\b(?:temp|temperature)\s+(?:is\s+)?(\d+\.?\d*)\s*(?:degrees?)?\s*(f|fahrenheit|c|celsius)?\b/i,
    /\b(?:temp|temperature)\s+(?:is\s+)?(ninety|eighty|seventy|sixty|one hundred)[\s-]*(one|two|three|four|five|six|seven|eight|nine)?\s*(?:point\s+(\w+))?\s*(?:degrees?)?\s*(f|fahrenheit)?\b/i,
  ];

  for (const pattern of tempPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      let temp: number | null = null;

      if (pattern === tempPatterns[0]) {
        temp = parseFloat(match[1]);
      } else if (pattern === tempPatterns[1]) {
        const wholePart = [match[1], match[2]].filter(Boolean).join(' ');
        const whole = convertTextToNumber(wholePart);
        const decimal = match[3] ? convertTextToNumber(match[3]) : 0;
        temp = whole !== null && decimal !== null ? whole + (decimal / 10) : null;
      }

      if (temp && temp >= 95 && temp <= 106) {
        data.temperature = temp;
        confidence.temperature = 0.85;
        break;
      }
    }
  }

  // Heart Rate / Pulse patterns
  // "pulse seventy two" -> 72
  // "heart rate 72" -> 72
  const hrPatterns = [
    /\b(?:pulse|heart rate|hr)\s+(?:is\s+)?(\d{2,3})\s*(?:bpm|beats)?\b/i,
    /\b(?:pulse|heart rate|hr)\s+(?:is\s+)?(\w+)\s*(?:bpm|beats)?\b/i,
  ];

  for (const pattern of hrPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const hr = pattern === hrPatterns[0] ? parseInt(match[1]) : convertTextToNumber(match[1]);
      if (hr && hr >= 40 && hr <= 200) {
        data.heartRate = hr;
        confidence.heartRate = 0.9;
        break;
      }
    }
  }

  // Oxygen Saturation patterns
  // "oxygen sat ninety eight percent" -> 98
  // "SpO2 98%" -> 98
  const o2Patterns = [
    /\b(?:oxygen sat|o2 sat|spo2|pulse ox)\s+(?:is\s+)?(\d{2,3})\s*(?:percent|%)?\b/i,
    /\b(?:oxygen sat|o2 sat|spo2|pulse ox)\s+(?:is\s+)?(\w+)\s*(?:percent|%)?\b/i,
  ];

  for (const pattern of o2Patterns) {
    const match = transcript.match(pattern);
    if (match) {
      const o2 = pattern === o2Patterns[0] ? parseInt(match[1]) : convertTextToNumber(match[1]);
      if (o2 && o2 >= 70 && o2 <= 100) {
        data.oxygenSaturation = o2;
        confidence.oxygenSaturation = 0.9;
        break;
      }
    }
  }

  // Respiratory Rate patterns
  // "respiratory rate 16" -> 16
  // "respiration sixteen" -> 16
  const rrPatterns = [
    /\b(?:respiratory rate|respiration|rr)\s+(?:is\s+)?(\d{1,2})\b/i,
    /\b(?:respiratory rate|respiration|rr)\s+(?:is\s+)?(\w+)\b/i,
  ];

  for (const pattern of rrPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const rr = pattern === rrPatterns[0] ? parseInt(match[1]) : convertTextToNumber(match[1]);
      if (rr && rr >= 8 && rr <= 40) {
        data.respiratoryRate = rr;
        confidence.respiratoryRate = 0.85;
        break;
      }
    }
  }

  // Pain Level patterns
  // "pain level five out of ten" -> 5
  // "pain 5/10" -> 5
  const painPatterns = [
    /\b(?:pain|pain level|pain score)\s+(?:is\s+)?(\d{1,2})\s*(?:out of ten|\/10)?\b/i,
    /\b(?:pain|pain level|pain score)\s+(?:is\s+)?(\w+)\s+(?:out of ten|\/10)\b/i,
  ];

  for (const pattern of painPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const pain = pattern === painPatterns[0] ? parseInt(match[1]) : convertTextToNumber(match[1]);
      if (pain !== null && pain >= 0 && pain <= 10) {
        data.painLevel = pain;
        confidence.painLevel = 0.9;
        break;
      }
    }
  }

  return { data, confidence };
}

// ============================================================================
// MEDICATION PARSER
// ============================================================================

/**
 * Parse medication administration from transcript
 */
function parseMedication(transcript: string): { data: Partial<Medication>[]; confidence: Record<string, number> } {
  const medications: Partial<Medication>[] = [];
  const confidence: Record<string, number> = {};

  // Pattern: "gave patient Smith ten milligrams of morphine IV at fourteen thirty"
  // Pattern: "administered 500mg of Tylenol PO"
  // Pattern: "patient received 10 units of insulin subcutaneous"

  const medPatterns = [
    /(?:gave|administered|given)\s+(?:patient\s+)?(\w+)?\s*(\d+\.?\d*)\s*(mg|milligrams|ml|milliliters|mcg|micrograms|units?|cc)\s+(?:of\s+)?(\w+)\s+(\w+)\s*(?:at\s+)?(\d{1,2}:?\d{2}|\w+\s+\w+)?/i,
    /(?:patient\s+)?(?:received|took|given)\s+(\d+\.?\d*)\s*(mg|milligrams|ml|milliliters|mcg|micrograms|units?)\s+(?:of\s+)?(\w+)\s+(\w+)/i,
  ];

  for (const pattern of medPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const med: Partial<Medication> = {};

      if (pattern === medPatterns[0]) {
        // Full pattern with patient name
        const patientName = match[1];
        const dose = match[2];
        const unit = match[3];
        const medName = match[4];
        const route = match[5];
        const time = match[6];

        med.name = standardizeMedicationName(medName);
        med.dose = `${dose}${unit.replace(/milligrams?/i, 'mg').replace(/milliliters?/i, 'ml').replace(/micrograms?/i, 'mcg').replace(/unit(s)?/i, 'units')}`;

        const extractedRoute = extractRoute(route);
        if (extractedRoute) {
          med.route = extractedRoute;
        }

        const extractedTime = time ? extractTime(time) : null;
        med.timeAdministered = extractedTime || new Date().toISOString();

        confidence['medication_name'] = 0.85;
        confidence['medication_dose'] = 0.9;
        confidence['medication_route'] = extractedRoute ? 0.85 : 0.5;
        confidence['medication_time'] = extractedTime ? 0.8 : 0.5;
      } else if (pattern === medPatterns[1]) {
        // Simplified pattern
        const dose = match[1];
        const unit = match[2];
        const medName = match[3];
        const route = match[4];

        med.name = standardizeMedicationName(medName);
        med.dose = `${dose}${unit.replace(/milligrams?/i, 'mg').replace(/milliliters?/i, 'ml').replace(/micrograms?/i, 'mcg').replace(/unit(s)?/i, 'units')}`;

        const extractedRoute = extractRoute(route);
        if (extractedRoute) {
          med.route = extractedRoute;
        }

        med.timeAdministered = new Date().toISOString();

        confidence['medication_name'] = 0.85;
        confidence['medication_dose'] = 0.9;
        confidence['medication_route'] = extractedRoute ? 0.85 : 0.5;
      }

      if (med.name && med.dose) {
        medications.push(med);
      }
    }
  }

  return { data: medications, confidence };
}

// ============================================================================
// PATIENT ASSESSMENT PARSER
// ============================================================================

/**
 * Parse patient assessment from transcript
 */
function parseAssessment(transcript: string): { data: Partial<Assessment>; confidence: Record<string, number> } {
  const data: Partial<Assessment> = {};
  const confidence: Record<string, number> = {};
  const text = transcript.toLowerCase();

  // Level of Consciousness
  // "patient alert and oriented times three" -> alert, oriented x3
  // "patient confused" -> confused
  const locPatterns = [
    /\bpatient\s+(alert|confused|drowsy|lethargic|stuporous|comatose)\b/i,
    /\b(alert|confused|drowsy|lethargic|stuporous|comatose)\s+and\s+oriented/i,
  ];

  for (const pattern of locPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const loc = match[1].toLowerCase() as LevelOfConsciousness;
      data.levelOfConsciousness = loc;
      confidence.levelOfConsciousness = 0.9;
      break;
    }
  }

  // Orientation
  // "oriented times three" -> x3
  // "oriented to person, place, and time" -> x3
  const orientationPatterns = [
    /\boriented\s+(?:times\s+)?(\w+|x?\d)\b/i,
    /\boriented\s+to\s+(person|place|time|situation)(?:\s+and\s+(person|place|time|situation))*\b/i,
  ];

  for (const pattern of orientationPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      if (pattern === orientationPatterns[0]) {
        const num = convertTextToNumber(match[1]) || parseInt(match[1].replace('x', ''));
        data.orientation = `x${num}`;
        confidence.orientation = 0.85;
      } else {
        // Count how many orientation factors mentioned
        const factors = transcript.match(/\b(person|place|time|situation)\b/gi);
        data.orientation = factors ? `x${factors.length}` : 'oriented';
        confidence.orientation = 0.8;
      }
      break;
    }
  }

  // Mobility/Activity
  // "patient ambulatory with assistance" -> assisted
  // "patient bedbound" -> bedbound
  const mobilityPatterns = [
    /\bpatient\s+(ambulatory|bedbound|wheelchair|immobile)\b/i,
    /\b(ambulatory|walking)\s+with\s+(assistance|walker|cane)\b/i,
  ];

  for (const pattern of mobilityPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      if (!data.musculoskeletal) {
        data.musculoskeletal = {};
      }
      data.musculoskeletal.mobility = pattern === mobilityPatterns[0] ? match[1] : `${match[1]} with ${match[2]}`;
      confidence.mobility = 0.85;
      break;
    }
  }

  // Pain assessment was handled in vital signs

  return { data, confidence };
}

// ============================================================================
// MAIN PARSE FUNCTION
// ============================================================================

/**
 * Parse voice transcript into structured data based on workflow type
 */
export function parseTranscript(
  transcript: string,
  workflowType: WorkflowType
): ParseResult {
  const structuredData: StructuredData = {};
  const confidence: Record<string, number> = {};
  const needsReview: string[] = [];

  if (!transcript || transcript.trim().length === 0) {
    return { structuredData, confidence, needsReview };
  }

  // Parse based on workflow type
  switch (workflowType) {
    case 'vital-signs': {
      const vitalSigns = parseVitalSigns(transcript);
      structuredData.vitalSigns = vitalSigns.data;
      Object.assign(confidence, vitalSigns.confidence);

      // Flag fields with low confidence for review
      Object.entries(vitalSigns.confidence).forEach(([field, conf]) => {
        if (conf < 0.7) {
          needsReview.push(`vitalSigns.${field}`);
        }
      });
      break;
    }

    case 'medication-administration': {
      const medications = parseMedication(transcript);
      structuredData.medications = medications.data;
      Object.assign(confidence, medications.confidence);

      // Flag if route or time couldn't be extracted with high confidence
      Object.entries(medications.confidence).forEach(([field, conf]) => {
        if (conf < 0.7) {
          needsReview.push(`medications.${field}`);
        }
      });

      // Always flag medication for review if route is missing
      medications.data.forEach((med, index) => {
        if (!med.route) {
          needsReview.push(`medications[${index}].route`);
        }
      });
      break;
    }

    case 'patient-assessment': {
      const assessment = parseAssessment(transcript);
      structuredData.assessment = assessment.data;
      Object.assign(confidence, assessment.confidence);

      // Also try to extract vitals from assessment
      const vitalSigns = parseVitalSigns(transcript);
      if (Object.keys(vitalSigns.data).length > 0) {
        structuredData.vitalSigns = vitalSigns.data;
        Object.assign(confidence, vitalSigns.confidence);
      }

      // Flag low confidence fields
      Object.entries(assessment.confidence).forEach(([field, conf]) => {
        if (conf < 0.7) {
          needsReview.push(`assessment.${field}`);
        }
      });
      break;
    }

    default: {
      // For other workflow types, try to extract what we can
      const vitalSigns = parseVitalSigns(transcript);
      if (Object.keys(vitalSigns.data).length > 0) {
        structuredData.vitalSigns = vitalSigns.data;
        Object.assign(confidence, vitalSigns.confidence);
      }

      const medications = parseMedication(transcript);
      if (medications.data.length > 0) {
        structuredData.medications = medications.data;
        Object.assign(confidence, medications.confidence);
      }

      const assessment = parseAssessment(transcript);
      if (Object.keys(assessment.data).length > 0) {
        structuredData.assessment = assessment.data;
        Object.assign(confidence, assessment.confidence);
      }
    }
  }

  // Store original transcript in additional notes if we couldn't extract much
  const totalFields = Object.keys(structuredData).reduce((sum, key) => {
    const value = structuredData[key as keyof StructuredData];
    return sum + (value ? Object.keys(value).length : 0);
  }, 0);

  if (totalFields < 2) {
    structuredData.additionalNotes = transcript;
  }

  return { structuredData, confidence, needsReview };
}

// Export utility functions for testing
export {
  convertTextToNumber,
  normalizeMedicalTerm,
  extractRoute,
  extractTime,
  standardizeMedicationName,
  parseVitalSigns,
  parseMedication,
  parseAssessment,
};
