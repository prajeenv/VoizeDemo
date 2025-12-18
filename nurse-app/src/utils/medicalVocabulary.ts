/**
 * Medical Vocabulary and Grammar Hints
 * Provides grammar rules and vocabulary hints for better medical transcription
 */

/**
 * Common medical terms and phrases to improve recognition
 */
export const medicalVocabulary = {
  vitalSigns: [
    'blood pressure', 'BP', 'systolic', 'diastolic',
    'heart rate', 'pulse', 'bpm', 'beats per minute',
    'temperature', 'temp', 'degrees', 'fahrenheit', 'celsius',
    'respiratory rate', 'respiration', 'breaths per minute',
    'oxygen saturation', 'SpO2', 'O2 sat', 'pulse ox',
    'pain scale', 'pain level'
  ],

  measurements: [
    'mg', 'milligrams', 'mcg', 'micrograms',
    'ml', 'milliliters', 'cc', 'cubic centimeters',
    'units', 'IU', 'international units',
    'over', 'slash', // for BP readings like "120 over 80"
  ],

  common: [
    'patient', 'assessment', 'vital signs',
    'administered', 'medication', 'dose', 'dosage',
    'IV', 'intravenous', 'oral', 'sublingual',
    'nurse', 'doctor', 'physician',
    'alert', 'oriented', 'responsive',
    'pain', 'discomfort', 'nausea', 'vomiting'
  ]
};

/**
 * Create JSGF grammar string for medical vocabulary
 * Note: SpeechGrammarList is not widely supported, but we provide this for future use
 */
export function createMedicalGrammar(): string {
  const allTerms = [
    ...medicalVocabulary.vitalSigns,
    ...medicalVocabulary.measurements,
    ...medicalVocabulary.common
  ];

  // JSGF (JSpeech Grammar Format) grammar
  const grammar = `#JSGF V1.0;
grammar medical;
public <medical> = ${allTerms.join(' | ')};
`;

  return grammar;
}

/**
 * Attempt to create a SpeechGrammarList with medical vocabulary
 * Returns null if not supported
 */
export function createMedicalGrammarList(): SpeechGrammarList | null {
  try {
    const SpeechGrammarListConstructor =
      (window as any).SpeechGrammarList ||
      (window as any).webkitSpeechGrammarList;

    if (!SpeechGrammarListConstructor) {
      console.log('SpeechGrammarList not supported in this browser');
      return null;
    }

    const grammarList = new SpeechGrammarListConstructor();
    const grammar = createMedicalGrammar();

    // Weight of 1 = same priority as default recognition
    // Higher weight = higher priority
    grammarList.addFromString(grammar, 1);

    return grammarList;
  } catch (error) {
    console.warn('Could not create SpeechGrammarList:', error);
    return null;
  }
}

/**
 * Post-process transcript to fix common medical transcription errors
 */
export function fixMedicalTranscript(transcript: string): string {
  let fixed = transcript;

  // Fix common number mis-transcriptions for blood pressure
  // "BP 2018" -> "BP 120/80" or "BP 120 80"
  fixed = fixed.replace(/\bBP\s*(\d)0(\d)(\d)\b/gi, 'BP $1$2 $3');

  // Fix "twenty eighteen" style to numbers
  fixed = fixed.replace(/twenty[\s-]?(\w+)/gi, (match, second) => {
    const tens: Record<string, string> = {
      'ten': '20', 'eleven': '21', 'twelve': '22', 'thirteen': '23',
      'fourteen': '24', 'fifteen': '25', 'sixteen': '26', 'seventeen': '27',
      'eighteen': '28', 'nineteen': '29'
    };
    return tens[second.toLowerCase()] || match;
  });

  // Normalize "over" to "/" for blood pressure
  fixed = fixed.replace(/(\d{2,3})\s+over\s+(\d{2,3})/gi, '$1/$2');

  // Normalize common abbreviations
  const abbreviations: Record<string, string> = {
    'beats per minute': 'bpm',
    'oxygen saturation': 'SpO2',
    'intravenous': 'IV',
    'by mouth': 'PO',
    'twice daily': 'BID',
    'three times daily': 'TID',
    'four times daily': 'QID',
  };

  Object.entries(abbreviations).forEach(([long, short]) => {
    const regex = new RegExp(long, 'gi');
    fixed = fixed.replace(regex, short);
  });

  return fixed;
}

/**
 * Extract vital signs from transcript
 */
export function extractVitalSigns(transcript: string): {
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  respiratoryRate?: string;
} {
  const vitals: any = {};

  // Blood pressure: 120/80 or 120 80
  const bpMatch = transcript.match(/(?:BP|blood pressure)[:\s]*(\d{2,3})\s*[\/\s]\s*(\d{2,3})/i);
  if (bpMatch) {
    vitals.bloodPressure = `${bpMatch[1]}/${bpMatch[2]}`;
  }

  // Heart rate: 72 bpm or pulse 72
  const hrMatch = transcript.match(/(?:heart rate|pulse|HR)[:\s]*(\d{2,3})\s*(?:bpm)?/i);
  if (hrMatch) {
    vitals.heartRate = hrMatch[1];
  }

  // Temperature: 98.6 degrees
  const tempMatch = transcript.match(/(?:temp|temperature)[:\s]*(\d{2,3}\.?\d*)\s*(?:degrees)?/i);
  if (tempMatch) {
    vitals.temperature = tempMatch[1];
  }

  // Oxygen saturation: SpO2 98% or O2 sat 98
  const o2Match = transcript.match(/(?:SpO2|O2\s+sat|oxygen)[:\s]*(\d{2,3})\s*%?/i);
  if (o2Match) {
    vitals.oxygenSaturation = o2Match[1];
  }

  // Respiratory rate: RR 16 or respirations 16
  const rrMatch = transcript.match(/(?:RR|respiratory rate|respirations?)[:\s]*(\d{1,2})/i);
  if (rrMatch) {
    vitals.respiratoryRate = rrMatch[1];
  }

  return vitals;
}
