/**
 * STEP 9: Realistic Sample Data and Demo Content
 *
 * This module provides comprehensive mock data for demonstrating the
 * voice-to-text nursing documentation system.
 */

import type {
  Patient,
  NurseNote,
  WorkflowType,
  VitalSigns,
  MedicationAdministration,
  WoundAssessment
} from './types';

// ============================================================================
// SAMPLE PATIENTS
// ============================================================================

export const SAMPLE_PATIENTS: Patient[] = [
  {
    patientId: "MRN-2024-001",
    name: "Smith, John",
    room: "204",
    age: 67,
    admitDate: "2024-01-10",
    diagnosis: "Pneumonia, CHF exacerbation"
  },
  {
    patientId: "MRN-2024-002",
    name: "Davis, Mary",
    room: "206",
    age: 47,
    admitDate: "2024-01-15",
    diagnosis: "Post-op hip replacement"
  },
  {
    patientId: "MRN-2024-003",
    name: "Johnson, Bob",
    room: "208",
    age: 72,
    admitDate: "2024-01-12",
    diagnosis: "Diabetic ketoacidosis"
  },
  {
    patientId: "MRN-2024-004",
    name: "Williams, Sarah",
    room: "210",
    age: 36,
    admitDate: "2024-01-08",
    diagnosis: "Sepsis, UTI"
  },
  {
    patientId: "MRN-2024-005",
    name: "Brown, Michael",
    room: "212",
    age: 54,
    admitDate: "2024-01-16",
    diagnosis: "COPD exacerbation"
  },
  {
    patientId: "MRN-2024-006",
    name: "Martinez, Elena",
    room: "214",
    age: 79,
    admitDate: "2024-01-14",
    diagnosis: "Stroke (CVA), left hemisphere"
  }
];

// ============================================================================
// SAMPLE NURSING PHRASES FOR VOICE TESTING
// ============================================================================

export const SAMPLE_PHRASES = {
  vitalSigns: [
    "BP one twenty over eighty, pulse seventy two, temp ninety eight point six, patient is comfortable",
    "Blood pressure one thirty five over eighty five, heart rate eighty eight, temperature ninety nine point one, respiratory rate eighteen, oxygen saturation ninety seven percent on room air",
    "Vitals stable, BP one ten over seventy, pulse sixty four regular, afebrile at ninety eight point four, respirations sixteen, SpO2 ninety eight percent",
    "Patient febrile, temp one hundred point two, BP one forty over ninety, pulse one hundred and two, respirations twenty two, appears diaphoretic"
  ],

  medication: [
    "Administered ten milligrams morphine IV push at fourteen thirty, patient reports pain decreased to level three",
    "Given five milligrams oxycodone PO at oh eight hundred for pain level seven, patient tolerated well, no adverse effects noted",
    "Administered furosemide forty milligrams IV at oh six hundred, patient voided three hundred milliliters clear yellow urine within one hour",
    "Gave insulin lispro eight units subcutaneous before breakfast, blood glucose one hundred eighty five",
    "Administered acetaminophen one gram IV for fever, temperature decreased from one hundred point four to ninety nine point one within two hours"
  ],

  assessment: [
    "Patient Smith in room two oh four, alert and oriented times three, ambulatory with walker, denies pain, skin warm and dry, wound dressing clean dry intact",
    "Patient resting comfortably in bed, alert and conversant, breath sounds clear bilaterally, heart rate regular, abdomen soft and non-tender, bowel sounds present in all four quadrants",
    "Neuro assessment intact, pupils equal round reactive to light, moves all extremities with good strength, follows commands appropriately, speech clear",
    "Patient alert but appears anxious, reports difficulty sleeping, requesting something for anxiety, vital signs stable, no acute distress noted"
  ],

  woundCare: [
    "Stage two pressure ulcer on right heel, measures three centimeters by two centimeters, minimal serous drainage, cleaned with normal saline, dressed with foam dressing",
    "Surgical incision to right hip, approximately fifteen centimeters, staples intact, no redness or drainage, edges well approximated, covered with dry sterile dressing",
    "Stage three sacral pressure ulcer, five by four centimeters, moderate amount of yellow slough, undermining two centimeters at three o'clock position, irrigated with normal saline, packed with calcium alginate, covered with foam dressing",
    "Left lower leg venous ulcer, four by three centimeters, pink granulation tissue visible, minimal serous drainage, wound bed clean, dressed with hydrocolloid"
  ],

  handoff: [
    "Patient Davis is post-op day two from appendectomy, vitals stable, pain controlled on oral medications, taking clear liquids, awaiting surgery clearance for discharge tomorrow",
    "Mister Johnson, pneumonia patient in room one fifty six, currently on IV antibiotics day three of five, oxygen requirements decreasing, able to ambulate short distances with assistance, appetite improving",
    "Misses Williams admitted with CHF exacerbation, received furosemide this morning with good urine output, weight down two pounds from yesterday, lungs sound clearer, still has trace pedal edema",
    "Mister Brown, diabetic ketoacidosis, blood sugars trending down, currently on insulin drip at four units per hour, last glucose one hundred sixty, gap closed, awaiting transition to subcutaneous insulin"
  ],

  intake: [
    "Patient intake for shift, oral fluids six hundred milliliters, IV normal saline at one hundred milliliters per hour equals eight hundred milliliters, total intake fourteen hundred milliliters",
    "Breakfast eaten seventy five percent, lunch eaten fifty percent, drinking water well throughout shift, IV lactated ringers at seventy five milliliters per hour"
  ],

  output: [
    "Voided three times this shift, total urine output nine hundred fifty milliliters, urine clear yellow, continent, no difficulty voiding",
    "Foley catheter draining clear yellow urine, output this shift seven hundred milliliters, catheter patent and secure"
  ]
};

// ============================================================================
// NURSING TERMINOLOGY DICTIONARY
// ============================================================================

export const NURSING_TERMINOLOGY = {
  abbreviations: {
    "A&O": "Alert and Oriented",
    "A&Ox3": "Alert and Oriented to person, place, and time",
    "A&Ox4": "Alert and Oriented to person, place, time, and situation",
    "BP": "Blood Pressure",
    "HR": "Heart Rate",
    "RR": "Respiratory Rate",
    "SpO2": "Oxygen Saturation",
    "T": "Temperature",
    "BM": "Bowel Movement",
    "BS": "Bowel Sounds",
    "CHF": "Congestive Heart Failure",
    "CVA": "Cerebrovascular Accident (Stroke)",
    "DKA": "Diabetic Ketoacidosis",
    "DNR": "Do Not Resuscitate",
    "DVT": "Deep Vein Thrombosis",
    "ER": "Emergency Room",
    "GI": "Gastrointestinal",
    "IM": "Intramuscular",
    "IV": "Intravenous",
    "NPO": "Nothing by mouth",
    "PO": "By mouth",
    "PRN": "As needed",
    "SOB": "Shortness of Breath",
    "SubQ": "Subcutaneous",
    "WNL": "Within Normal Limits"
  },

  vitalSignsTerms: {
    bloodPressure: ["BP", "blood pressure", "systolic", "diastolic"],
    heartRate: ["HR", "pulse", "heart rate", "beats per minute", "BPM"],
    temperature: ["temp", "temperature", "febrile", "afebrile"],
    respiratoryRate: ["RR", "respirations", "respiratory rate", "breaths per minute"],
    oxygenSaturation: ["SpO2", "O2 sat", "oxygen saturation", "pulse ox"],
    pain: ["pain level", "pain scale", "discomfort"]
  },

  medicationRoutes: [
    "PO", "oral", "by mouth",
    "IV", "intravenous", "IV push", "IV drip",
    "IM", "intramuscular",
    "SubQ", "subcutaneous",
    "topical", "transdermal",
    "sublingual", "buccal",
    "rectal", "vaginal",
    "ophthalmic", "otic",
    "inhaled", "nebulized"
  ],

  commonMedications: {
    pain: ["morphine", "oxycodone", "hydrocodone", "acetaminophen", "ibuprofen", "fentanyl"],
    cardiac: ["metoprolol", "lisinopril", "furosemide", "digoxin", "amiodarone"],
    antibiotics: ["ceftriaxone", "vancomycin", "ciprofloxacin", "azithromycin", "penicillin"],
    diabetes: ["insulin", "metformin", "glipizide", "lantus", "humalog", "lispro"],
    anticoagulation: ["heparin", "warfarin", "enoxaparin", "apixaban"],
    respiratory: ["albuterol", "ipratropium", "budesonide", "prednisone"]
  }
};

// ============================================================================
// LOINC CODES FOR VITAL SIGNS
// ============================================================================

export const LOINC_CODES = {
  bloodPressureSystolic: "8480-6",
  bloodPressureDiastolic: "8462-4",
  heartRate: "8867-4",
  respiratoryRate: "9279-1",
  bodyTemperature: "8310-5",
  oxygenSaturation: "59408-5",
  painSeverity: "72514-3",
  height: "8302-2",
  weight: "29463-7",
  bmi: "39156-5",
  bloodGlucose: "2339-0"
};

// ============================================================================
// HISTORICAL DATA GENERATION
// ============================================================================

function generateTimestamp(daysAgo: number, hour: number, minute: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function generateVitalSigns(variation: number = 0): VitalSigns {
  return {
    bloodPressure: {
      systolic: 120 + variation * 10,
      diastolic: 80 + variation * 5
    },
    heartRate: 72 + variation * 8,
    temperature: 98.6 + variation * 0.5,
    respiratoryRate: 16 + variation * 2,
    oxygenSaturation: 98 - variation,
    painLevel: Math.max(0, Math.min(10, 2 + variation))
  };
}

// ============================================================================
// SAMPLE HISTORICAL NOTES
// ============================================================================

export function generateHistoricalNotes(): NurseNote[] {
  const notes: NurseNote[] = [];

  // Patient MRN-2024-001 - John Smith (Pneumonia, CHF)
  notes.push({
    id: "note_001",
    patientId: "MRN-2024-001",
    nurseName: "Anderson, Sarah RN",
    timestamp: generateTimestamp(0, 6, 0),
    workflowType: "vital-signs",
    rawTranscript: "Morning vitals for Mister Smith",
    structuredData: {
      vitalSigns: generateVitalSigns(0)
    },
    confidence: 0.95,
    status: "completed",
    createdAt: generateTimestamp(0, 6, 0),
    updatedAt: generateTimestamp(0, 6, 0)
  });

  notes.push({
    id: "note_002",
    patientId: "MRN-2024-001",
    nurseName: "Anderson, Sarah RN",
    timestamp: generateTimestamp(0, 8, 30),
    workflowType: "medication",
    rawTranscript: "Administered pain medication",
    structuredData: {
      medication: {
        name: "Oxycodone",
        dose: "5 mg",
        route: "PO",
        time: generateTimestamp(0, 8, 30),
        reason: "Post-op pain",
        patientResponse: "Pain decreased to level 2"
      }
    },
    confidence: 0.92,
    status: "completed",
    createdAt: generateTimestamp(0, 8, 30),
    updatedAt: generateTimestamp(0, 8, 30)
  });

  notes.push({
    id: "note_003",
    patientId: "MRN-2024-001",
    nurseName: "Johnson, Mike RN",
    timestamp: generateTimestamp(0, 14, 0),
    workflowType: "assessment",
    rawTranscript: "Afternoon assessment",
    structuredData: {
      assessment: {
        neurological: "Alert and oriented x3",
        cardiovascular: "Heart rate regular, no edema",
        respiratory: "Breath sounds clear bilaterally",
        gastrointestinal: "Bowel sounds present, tolerating diet",
        genitourinary: "Voiding without difficulty",
        musculoskeletal: "Ambulating with walker, good progress",
        integumentary: "Surgical site clean, dry, intact",
        pain: "Reports pain level 3/10, well controlled"
      }
    },
    confidence: 0.89,
    status: "completed",
    createdAt: generateTimestamp(0, 14, 0),
    updatedAt: generateTimestamp(0, 14, 0)
  });

  // Patient MRN-2024-002 - Mary Davis (Hip Replacement)
  notes.push({
    id: "note_004",
    patientId: "MRN-2024-002",
    nurseName: "Chen, Lisa RN",
    timestamp: generateTimestamp(0, 7, 0),
    workflowType: "vital-signs",
    rawTranscript: "Post-op day 2 vitals",
    structuredData: {
      vitalSigns: {
        bloodPressure: { systolic: 118, diastolic: 76 },
        heartRate: 68,
        temperature: 98.4,
        respiratoryRate: 14,
        oxygenSaturation: 99,
        painLevel: 3
      }
    },
    confidence: 0.96,
    status: "completed",
    createdAt: generateTimestamp(0, 7, 0),
    updatedAt: generateTimestamp(0, 7, 0)
  });

  notes.push({
    id: "note_005",
    patientId: "MRN-2024-002",
    nurseName: "Chen, Lisa RN",
    timestamp: generateTimestamp(0, 10, 15),
    workflowType: "intake-output",
    rawTranscript: "Morning intake and output",
    structuredData: {
      intakeOutput: {
        intake: {
          oral: 450,
          iv: 500,
          total: 950
        },
        output: {
          urine: 650,
          other: 0,
          total: 650
        }
      }
    },
    confidence: 0.91,
    status: "completed",
    createdAt: generateTimestamp(0, 10, 15),
    updatedAt: generateTimestamp(0, 10, 15)
  });

  // Patient MRN-2024-003 - Bob Johnson (DKA)
  notes.push({
    id: "note_006",
    patientId: "MRN-2024-003",
    nurseName: "Martinez, Carlos RN",
    timestamp: generateTimestamp(0, 6, 30),
    workflowType: "medication",
    rawTranscript: "Antibiotic administration",
    structuredData: {
      medication: {
        name: "Ceftriaxone",
        dose: "1 g",
        route: "IV",
        time: generateTimestamp(0, 6, 30),
        reason: "Pneumonia treatment",
        patientResponse: "Tolerated well, no adverse effects"
      }
    },
    confidence: 0.94,
    status: "completed",
    createdAt: generateTimestamp(0, 6, 30),
    updatedAt: generateTimestamp(0, 6, 30)
  });

  notes.push({
    id: "note_007",
    patientId: "MRN-2024-003",
    nurseName: "Martinez, Carlos RN",
    timestamp: generateTimestamp(0, 12, 0),
    workflowType: "vital-signs",
    rawTranscript: "Midday vitals check",
    structuredData: {
      vitalSigns: {
        bloodPressure: { systolic: 128, diastolic: 82 },
        heartRate: 76,
        temperature: 99.2,
        respiratoryRate: 18,
        oxygenSaturation: 96,
        painLevel: 1
      }
    },
    confidence: 0.93,
    status: "completed",
    createdAt: generateTimestamp(0, 12, 0),
    updatedAt: generateTimestamp(0, 12, 0)
  });

  // Patient MRN-2024-004 - Sarah Williams (Sepsis, UTI)
  notes.push({
    id: "note_008",
    patientId: "MRN-2024-004",
    nurseName: "Thompson, Rebecca RN",
    timestamp: generateTimestamp(0, 6, 0),
    workflowType: "medication",
    rawTranscript: "Morning diuretic",
    structuredData: {
      medication: {
        name: "Furosemide",
        dose: "40 mg",
        route: "IV",
        time: generateTimestamp(0, 6, 0),
        reason: "CHF management",
        patientResponse: "Good urine output, 450mL within 2 hours"
      }
    },
    confidence: 0.97,
    status: "completed",
    createdAt: generateTimestamp(0, 6, 0),
    updatedAt: generateTimestamp(0, 6, 0)
  });

  notes.push({
    id: "note_009",
    patientId: "MRN-2024-004",
    nurseName: "Thompson, Rebecca RN",
    timestamp: generateTimestamp(0, 9, 0),
    workflowType: "assessment",
    rawTranscript: "Respiratory assessment",
    structuredData: {
      assessment: {
        neurological: "Alert and oriented x3",
        cardiovascular: "Regular rate, trace pedal edema",
        respiratory: "Lungs clearer than yesterday, no SOB at rest",
        gastrointestinal: "Appetite improving",
        genitourinary: "Increased urine output after diuretic",
        musculoskeletal: "Weakness improved, able to ambulate to bathroom",
        integumentary: "Skin warm and dry",
        pain: "Denies pain"
      }
    },
    confidence: 0.88,
    status: "completed",
    createdAt: generateTimestamp(0, 9, 0),
    updatedAt: generateTimestamp(0, 9, 0)
  });

  // Patient MRN-2024-005 - Michael Brown (COPD)
  notes.push({
    id: "note_010",
    patientId: "MRN-2024-005",
    nurseName: "Kim, Jennifer RN",
    timestamp: generateTimestamp(0, 8, 0),
    workflowType: "vital-signs",
    rawTranscript: "Morning vitals with glucose check",
    structuredData: {
      vitalSigns: {
        bloodPressure: { systolic: 125, diastolic: 78 },
        heartRate: 82,
        temperature: 98.7,
        respiratoryRate: 16,
        oxygenSaturation: 98,
        painLevel: 0
      }
    },
    confidence: 0.95,
    status: "completed",
    createdAt: generateTimestamp(0, 8, 0),
    updatedAt: generateTimestamp(0, 8, 0)
  });

  notes.push({
    id: "note_011",
    patientId: "MRN-2024-005",
    nurseName: "Kim, Jennifer RN",
    timestamp: generateTimestamp(0, 11, 30),
    workflowType: "medication",
    rawTranscript: "Insulin administration",
    structuredData: {
      medication: {
        name: "Insulin Lispro",
        dose: "6 units",
        route: "SubQ",
        time: generateTimestamp(0, 11, 30),
        reason: "Blood glucose 165",
        patientResponse: "Tolerating transition to SubQ insulin well"
      }
    },
    confidence: 0.93,
    status: "completed",
    createdAt: generateTimestamp(0, 11, 30),
    updatedAt: generateTimestamp(0, 11, 30)
  });

  // Patient MRN-2024-006 - Elena Martinez (Stroke)
  notes.push({
    id: "note_012",
    patientId: "MRN-2024-006",
    nurseName: "Wilson, David RN",
    timestamp: generateTimestamp(0, 7, 30),
    workflowType: "assessment",
    rawTranscript: "Neurological assessment",
    structuredData: {
      assessment: {
        neurological: "Alert, oriented x3, PERRLA, left-sided weakness improving, speech clear",
        cardiovascular: "Regular rate and rhythm",
        respiratory: "Breath sounds clear",
        gastrointestinal: "Tolerating soft diet",
        genitourinary: "Continent, adequate output",
        musculoskeletal: "Left arm strength 3/5, left leg strength 4/5, participating in PT",
        integumentary: "No pressure areas noted",
        pain: "Denies pain or headache"
      }
    },
    confidence: 0.90,
    status: "completed",
    createdAt: generateTimestamp(0, 7, 30),
    updatedAt: generateTimestamp(0, 7, 30)
  });

  notes.push({
    id: "note_013",
    patientId: "MRN-2024-006",
    nurseName: "Wilson, David RN",
    timestamp: generateTimestamp(0, 13, 0),
    workflowType: "vital-signs",
    rawTranscript: "Afternoon vitals",
    structuredData: {
      vitalSigns: {
        bloodPressure: { systolic: 132, diastolic: 84 },
        heartRate: 70,
        temperature: 98.5,
        respiratoryRate: 16,
        oxygenSaturation: 97,
        painLevel: 0
      }
    },
    confidence: 0.96,
    status: "completed",
    createdAt: generateTimestamp(0, 13, 0),
    updatedAt: generateTimestamp(0, 13, 0)
  });

  // Add wound care example
  notes.push({
    id: "note_014",
    patientId: "MRN-2024-004",
    nurseName: "Thompson, Rebecca RN",
    timestamp: generateTimestamp(0, 15, 0),
    workflowType: "wound-care",
    rawTranscript: "Heel pressure ulcer care",
    structuredData: {
      woundAssessment: {
        location: "Right heel",
        type: "Pressure ulcer",
        stage: "Stage 2",
        length: 2.5,
        width: 2.0,
        depth: 0.3,
        drainageAmount: "Minimal",
        drainageType: "Serous",
        tissue: "Pink, granulation tissue",
        treatment: "Cleaned with normal saline, foam dressing applied",
        painDuringCare: 2
      }
    },
    confidence: 0.91,
    status: "completed",
    createdAt: generateTimestamp(0, 15, 0),
    updatedAt: generateTimestamp(0, 15, 0)
  });

  return notes;
}

// ============================================================================
// AUTO-FILL DEMO DATA BY WORKFLOW TYPE
// ============================================================================

export function getAutoFillData(workflowType: WorkflowType, patientId?: string): Partial<NurseNote> {
  const patient = patientId
    ? SAMPLE_PATIENTS.find(p => p.patientId === patientId)
    : SAMPLE_PATIENTS[0];

  const baseData = {
    patientId: patient?.patientId || SAMPLE_PATIENTS[0].patientId,
    nurseName: "Demo Nurse, RN",
    timestamp: new Date().toISOString()
  };

  switch (workflowType) {
    case "vital-signs":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.vitalSigns[0],
        structuredData: {
          vitalSigns: generateVitalSigns(0)
        }
      };

    case "medication":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.medication[0],
        structuredData: {
          medication: {
            name: "Morphine",
            dose: "10 mg",
            route: "IV push",
            time: new Date().toISOString(),
            reason: "Pain management",
            patientResponse: "Pain decreased to level 3/10"
          }
        }
      };

    case "assessment":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.assessment[0],
        structuredData: {
          assessment: {
            neurological: "Alert and oriented x3",
            cardiovascular: "Regular rate and rhythm, no edema",
            respiratory: "Breath sounds clear bilaterally",
            gastrointestinal: "Bowel sounds present all quadrants",
            genitourinary: "Voiding without difficulty",
            musculoskeletal: "Ambulatory with walker",
            integumentary: "Skin warm and dry, wound dressing CDI",
            pain: "Denies pain"
          }
        }
      };

    case "wound-care":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.woundCare[0],
        structuredData: {
          woundAssessment: {
            location: "Right heel",
            type: "Pressure ulcer",
            stage: "Stage 2",
            length: 3.0,
            width: 2.0,
            depth: 0.5,
            drainageAmount: "Minimal",
            drainageType: "Serous",
            tissue: "Pink granulation tissue",
            treatment: "Cleaned with NS, foam dressing applied",
            painDuringCare: 2
          }
        }
      };

    case "intake-output":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.intake[0],
        structuredData: {
          intakeOutput: {
            intake: {
              oral: 600,
              iv: 800,
              total: 1400
            },
            output: {
              urine: 950,
              other: 0,
              total: 950
            }
          }
        }
      };

    case "handoff":
      return {
        ...baseData,
        workflowType,
        rawTranscript: SAMPLE_PHRASES.handoff[0],
        structuredData: {
          handoff: {
            patientCondition: "Stable, post-op day 2",
            pendingTasks: ["Surgery clearance for discharge"],
            concerns: ["Monitor pain levels"],
            recommendations: ["Continue current medications"]
          }
        }
      };

    default:
      return baseData;
  }
}

// ============================================================================
// DEMO MODE UTILITIES
// ============================================================================

export interface DemoDataBundle {
  patients: Patient[];
  historicalNotes: NurseNote[];
  samplePhrases: typeof SAMPLE_PHRASES;
  terminology: typeof NURSING_TERMINOLOGY;
}

export function getCompleteDemoData(): DemoDataBundle {
  return {
    patients: SAMPLE_PATIENTS,
    historicalNotes: generateHistoricalNotes(),
    samplePhrases: SAMPLE_PHRASES,
    terminology: NURSING_TERMINOLOGY
  };
}

export function getRandomSamplePhrase(workflowType: WorkflowType): string {
  const phrases = SAMPLE_PHRASES[workflowType as keyof typeof SAMPLE_PHRASES];
  if (Array.isArray(phrases)) {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }
  return "";
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SAMPLE_PATIENTS,
  SAMPLE_PHRASES,
  NURSING_TERMINOLOGY,
  LOINC_CODES,
  generateHistoricalNotes,
  getAutoFillData,
  getCompleteDemoData,
  getRandomSamplePhrase
};
