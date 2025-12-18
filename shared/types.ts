// Shared TypeScript types for the Voize Demo application
// Comprehensive type system for voice-to-text nursing documentation

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

/**
 * Supported nursing documentation workflow types
 */
export type WorkflowType =
  | 'patient-assessment'
  | 'medication-administration'
  | 'wound-care'
  | 'vital-signs'
  | 'shift-handoff'
  | 'admission'
  | 'discharge'
  | 'general-note';

/**
 * Status of a documentation entry
 */
export type DocumentationStatus = 'draft' | 'completed' | 'sent_to_ehr';

// ============================================================================
// PATIENT INFORMATION
// ============================================================================

/**
 * Patient demographic and identification information
 */
export interface Patient {
  /** Unique patient identifier */
  id: string;

  /** Patient full name */
  name: string;

  /** Medical Record Number - unique hospital identifier */
  mrn: string;

  /** Date of birth in ISO format (YYYY-MM-DD) */
  dateOfBirth: string;

  /** Hospital room number or location */
  room?: string;

  /** Patient gender */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /** Admission date in ISO format */
  admissionDate?: string;

  /** Primary diagnosis */
  primaryDiagnosis?: string;

  /** Known allergies */
  allergies?: string[];

  /** Code status (Full Code, DNR, etc.) */
  codeStatus?: string;
}

// ============================================================================
// VITAL SIGNS
// ============================================================================

/**
 * Patient vital signs with LOINC codes for standardization
 * LOINC (Logical Observation Identifiers Names and Codes) is a standard for lab and clinical observations
 */
export interface VitalSigns {
  /** Timestamp when vitals were taken */
  timestamp?: string;

  /** Blood Pressure (e.g., "120/80") - LOINC: 85354-9 */
  bloodPressure?: string;

  /** Systolic Blood Pressure in mmHg - LOINC: 8480-6 */
  systolic?: number;

  /** Diastolic Blood Pressure in mmHg - LOINC: 8462-4 */
  diastolic?: number;

  /** Heart Rate in beats per minute - LOINC: 8867-4 */
  heartRate?: number;

  /** Body Temperature in Fahrenheit - LOINC: 8310-5 */
  temperature?: number;

  /** Temperature method (oral, rectal, tympanic, axillary) */
  temperatureMethod?: 'oral' | 'rectal' | 'tympanic' | 'axillary' | 'temporal';

  /** Respiratory Rate in breaths per minute - LOINC: 9279-1 */
  respiratoryRate?: number;

  /** Oxygen Saturation (SpO2) as percentage - LOINC: 59408-5 */
  oxygenSaturation?: number;

  /** Pain level on 0-10 scale - LOINC: 72514-3 */
  painLevel?: number;

  /** Weight in pounds - LOINC: 29463-7 */
  weight?: number;

  /** Height in inches - LOINC: 8302-2 */
  height?: number;

  /** Blood glucose level in mg/dL - LOINC: 2339-0 */
  bloodGlucose?: number;
}

// ============================================================================
// MEDICATION ADMINISTRATION
// ============================================================================

/**
 * Route of medication administration
 */
export type MedicationRoute =
  | 'PO' // By mouth (oral)
  | 'IV' // Intravenous
  | 'IM' // Intramuscular
  | 'SQ' // Subcutaneous
  | 'SL' // Sublingual
  | 'PR' // Per rectum
  | 'TOP' // Topical
  | 'INH' // Inhalation
  | 'OPH' // Ophthalmic
  | 'OT' // Otic
  | 'NG' // Nasogastric tube
  | 'GT'; // Gastrostomy tube

/**
 * Single medication entry
 */
export interface Medication {
  /** Medication name (generic or brand) */
  name: string;

  /** Dosage amount and unit (e.g., "500mg", "10units") */
  dose: string;

  /** Route of administration */
  route: MedicationRoute;

  /** Frequency (e.g., "BID", "TID", "Q4H", "PRN") */
  frequency?: string;

  /** Time administered in ISO format */
  timeAdministered: string;

  /** Reason for administration */
  reason?: string;

  /** Patient response or reaction */
  response?: string;

  /** Any adverse reactions observed */
  adverseReaction?: string;

  /** Site of administration (for injections) */
  site?: string;

  /** Nurse who administered */
  administeredBy?: string;

  /** Whether PRN medication */
  isPRN?: boolean;

  /** NDC (National Drug Code) if available */
  ndc?: string;
}

// ============================================================================
// PATIENT ASSESSMENT
// ============================================================================

/**
 * Level of consciousness assessment
 */
export type LevelOfConsciousness =
  | 'alert'
  | 'confused'
  | 'drowsy'
  | 'lethargic'
  | 'stuporous'
  | 'comatose';

/**
 * Comprehensive patient assessment data
 */
export interface Assessment {
  /** Level of consciousness */
  levelOfConsciousness?: LevelOfConsciousness;

  /** Orientation (person, place, time, situation) */
  orientation?: string;

  /** Cardiovascular assessment */
  cardiovascular?: {
    rhythm: string;
    pulseQuality: 'bounding' | 'strong' | 'weak' | 'thready' | 'absent';
    edema?: string;
    capillaryRefill?: string;
  };

  /** Respiratory assessment */
  respiratory?: {
    breathSounds: string;
    oxygenSupport?: string;
    cough?: string;
    sputum?: string;
  };

  /** Gastrointestinal assessment */
  gastrointestinal?: {
    bowelSounds: 'normal' | 'hyperactive' | 'hypoactive' | 'absent';
    lastBowelMovement?: string;
    abdomen?: string;
    nausea?: boolean;
    vomiting?: boolean;
  };

  /** Genitourinary assessment */
  genitourinary?: {
    urineOutput?: string;
    urineColor?: string;
    continence?: string;
    catheter?: boolean;
  };

  /** Musculoskeletal assessment */
  musculoskeletal?: {
    mobility?: string;
    strength?: string;
    range?: string;
    gait?: string;
  };

  /** Neurological assessment */
  neurological?: {
    pupils?: string;
    motorFunction?: string;
    sensoryFunction?: string;
    reflexes?: string;
  };

  /** Skin integrity */
  skin?: {
    condition: string;
    turgor?: string;
    color?: string;
    temperature?: string;
    wounds?: WoundDetails[];
  };

  /** Pain assessment */
  pain?: {
    location?: string;
    quality?: string;
    severity: number; // 0-10 scale
    onset?: string;
    duration?: string;
    alleviatingFactors?: string;
    aggravatingFactors?: string;
  };

  /** Psychosocial assessment */
  psychosocial?: {
    mood?: string;
    affect?: string;
    behavior?: string;
    support?: string;
  };

  /** Additional notes */
  notes?: string;
}

// ============================================================================
// WOUND CARE
// ============================================================================

/**
 * Wound type classification
 */
export type WoundType =
  | 'pressure-ulcer'
  | 'surgical'
  | 'traumatic'
  | 'venous'
  | 'arterial'
  | 'diabetic'
  | 'burn'
  | 'laceration'
  | 'abrasion';

/**
 * Wound stage for pressure ulcers
 */
export type WoundStage =
  | 'stage-1'
  | 'stage-2'
  | 'stage-3'
  | 'stage-4'
  | 'unstageable'
  | 'deep-tissue-injury';

/**
 * Detailed wound assessment and care documentation
 */
export interface WoundDetails {
  /** Wound location on body */
  location: string;

  /** Type of wound */
  type: WoundType;

  /** Stage (for pressure ulcers) */
  stage?: WoundStage;

  /** Wound dimensions */
  dimensions?: {
    length: number; // cm
    width: number; // cm
    depth?: number; // cm
  };

  /** Wound bed appearance */
  woundBed?: {
    color?: string;
    tissuetype?: string;
    granulation?: string;
  };

  /** Drainage characteristics */
  drainage?: {
    amount: 'none' | 'scant' | 'small' | 'moderate' | 'large' | 'copious';
    type: 'serous' | 'serosanguineous' | 'sanguineous' | 'purulent';
    odor?: 'none' | 'foul' | 'sweet';
  };

  /** Wound edges description */
  edges?: string;

  /** Surrounding skin condition */
  periwoundSkin?: string;

  /** Treatment/dressing applied */
  treatment?: string;

  /** Dressing type applied */
  dressingType?: string;

  /** Signs of infection */
  signsOfInfection?: string[];

  /** Pain level at wound site */
  painLevel?: number;

  /** Photos taken (reference IDs) */
  photos?: string[];

  /** Additional notes */
  notes?: string;
}

// ============================================================================
// SHIFT HANDOFF
// ============================================================================

/**
 * Shift handoff using SBAR format
 * SBAR: Situation, Background, Assessment, Recommendation
 */
export interface ShiftHandoff {
  /** Situation: Current status and issues */
  situation: string;

  /** Background: Relevant history and context */
  background: string;

  /** Assessment: Clinical assessment and findings */
  assessment: string;

  /** Recommendation: Suggestions for continuing care */
  recommendation: string;

  /** Key events during shift */
  keyEvents?: string[];

  /** Pending tasks or orders */
  pendingTasks?: string[];

  /** IV access and lines */
  ivAccess?: string[];

  /** Diet and nutritional status */
  diet?: string;

  /** Activity level */
  activity?: string;

  /** Upcoming procedures or appointments */
  upcoming?: string[];

  /** Family involvement or concerns */
  familyConcerns?: string;
}

// ============================================================================
// STRUCTURED DATA
// ============================================================================

/**
 * Structured data extracted from voice transcription
 * Fields populated based on workflow type
 */
export interface StructuredData {
  /** Vital signs (all workflows may include this) */
  vitalSigns?: VitalSigns;

  /** Medications administered (medication-administration workflow) */
  medications?: Medication[];

  /** Patient assessment (patient-assessment workflow) */
  assessment?: Assessment;

  /** Wound care details (wound-care workflow) */
  woundDetails?: WoundDetails[];

  /** Shift handoff data (shift-handoff workflow) */
  shiftHandoff?: ShiftHandoff;

  /** Admission data */
  admissionData?: {
    admittingDiagnosis: string;
    chiefComplaint: string;
    admissionSource: string;
    allergies: string[];
    currentMedications: Medication[];
    medicalHistory: string[];
  };

  /** Discharge data */
  dischargeData?: {
    dischargeDisposition: string;
    dischargeInstructions: string;
    medications: Medication[];
    followUpAppointments: string[];
    patientEducation: string[];
    dischargeDestination: string;
  };

  /** Additional free-text notes */
  additionalNotes?: string;
}

// ============================================================================
// DOCUMENTATION ENTRY (Main)
// ============================================================================

/**
 * Primary documentation entry created from voice-to-text input
 * This is the core data structure for all nursing documentation
 */
export interface DocumentationEntry {
  /** Unique identifier for this documentation entry */
  id: string;

  /** Timestamp when documentation was created (ISO format) */
  timestamp: string;

  /** ID of the nurse creating the documentation */
  nurseId: string;

  /** Name of the nurse */
  nurseName?: string;

  /** ID of the patient this documentation is for */
  patientId: string;

  /** Patient MRN for reference */
  patientMRN?: string;

  /** Patient name for display */
  patientName?: string;

  /** Type of nursing workflow/documentation */
  workflowType: WorkflowType;

  /** Raw voice transcript from speech-to-text */
  voiceTranscript: string;

  /** Structured data extracted from transcript */
  structuredData: StructuredData;

  /** Current status of the documentation */
  status: DocumentationStatus;

  /** When this was last modified */
  lastModified?: string;

  /** When this was sent to EHR (if applicable) */
  sentToEHRAt?: string;

  /** Confidence score from speech recognition (0-1) */
  transcriptConfidence?: number;

  /** Any flags or alerts */
  flags?: string[];

  /** Signature status */
  signed?: boolean;
  signedAt?: string;
}

// ============================================================================
// WORKFLOW TEMPLATES
// ============================================================================

/**
 * Template defining structure and prompts for each workflow type
 */
export interface WorkflowTemplate {
  /** Workflow type identifier */
  type: WorkflowType;

  /** Display name */
  name: string;

  /** Description of this workflow */
  description: string;

  /** Guided prompts to help nurse through documentation */
  promptGuide: string[];

  /** Fields required for this workflow */
  requiredFields: string[];

  /** Icon or color for UI */
  icon?: string;
  color?: string;
}

// ============================================================================
// EHR INTEGRATION TYPES
// ============================================================================

/**
 * Message format for sending data to EHR system
 */
export interface EHRMessage {
  /** Message ID */
  messageId: string;

  /** Message type */
  messageType: 'ADT' | 'ORU' | 'ORM' | 'MDM' | 'BAR';

  /** Timestamp */
  timestamp: string;

  /** Source system */
  source: string;

  /** Destination system */
  destination: string;

  /** Patient identifier */
  patientId: string;
  patientMRN: string;

  /** Encounter/visit ID */
  encounterId?: string;

  /** Message payload */
  payload: DocumentationEntry;

  /** Format (FHIR, HL7, proprietary) */
  format: 'FHIR' | 'HL7v2' | 'HL7v3' | 'CDA' | 'JSON';
}

/**
 * FHIR (Fast Healthcare Interoperability Resources) Observation
 * Simplified representation of FHIR R4 Observation resource
 */
export interface FHIRObservation {
  /** Resource type (always "Observation") */
  resourceType: 'Observation';

  /** Logical id of this artifact */
  id?: string;

  /** Business Identifier */
  identifier?: Array<{
    system?: string;
    value?: string;
  }>;

  /** Status: registered | preliminary | final | amended */
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';

  /** Classification of type of observation */
  category?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;

  /** Type of observation (LOINC code) */
  code: {
    coding?: Array<{
      system: string; // e.g., "http://loinc.org"
      code: string; // e.g., "8867-4" for heart rate
      display?: string; // e.g., "Heart rate"
    }>;
    text?: string;
  };

  /** Who/what this is about */
  subject: {
    reference: string; // e.g., "Patient/12345"
    display?: string;
  };

  /** Healthcare event during which this observation occurred */
  encounter?: {
    reference: string;
  };

  /** Clinically relevant time/time-period */
  effectiveDateTime?: string;

  /** Date/Time this was made available */
  issued?: string;

  /** Who is responsible */
  performer?: Array<{
    reference: string; // e.g., "Practitioner/67890"
    display?: string;
  }>;

  /** Actual result value */
  valueQuantity?: {
    value: number;
    unit: string;
    system?: string; // e.g., "http://unitsofmeasure.org"
    code?: string;
  };

  valueString?: string;
  valueBoolean?: boolean;

  /** High, low, normal, etc. */
  interpretation?: Array<{
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
  }>;

  /** Comments about the observation */
  note?: Array<{
    text: string;
    time?: string;
    authorReference?: {
      reference: string;
    };
  }>;
}

/**
 * HL7 v2 Message Segment
 * Represents a segment in an HL7 v2.x message
 */
export interface HL7Segment {
  /** Segment type (MSH, PID, OBR, OBX, etc.) */
  segmentType: string;

  /** Fields in the segment */
  fields: string[];
}

/**
 * HL7 v2 Message
 * Simplified representation of HL7 v2.x message structure
 */
export interface HL7Message {
  /** Message type (ADT^A01, ORU^R01, etc.) */
  messageType: string;

  /** Message control ID */
  messageControlId: string;

  /** Sending application */
  sendingApplication: string;

  /** Sending facility */
  sendingFacility: string;

  /** Receiving application */
  receivingApplication: string;

  /** Receiving facility */
  receivingFacility: string;

  /** Message timestamp */
  messageDateTime: string;

  /** Message segments */
  segments: HL7Segment[];

  /** Raw HL7 message string */
  rawMessage?: string;
}

/**
 * HL7 CDA (Clinical Document Architecture) Header
 * Simplified representation for nursing documentation
 */
export interface CDADocument {
  /** Document ID */
  documentId: string;

  /** Document type code */
  typeCode: {
    code: string;
    codeSystem: string;
    displayName: string;
  };

  /** Document title */
  title: string;

  /** Effective time */
  effectiveTime: string;

  /** Confidentiality code */
  confidentialityCode: string;

  /** Patient information */
  patient: {
    id: string;
    name: string;
    birthTime: string;
    gender: string;
  };

  /** Author (nurse) */
  author: {
    time: string;
    id: string;
    name: string;
  };

  /** Document content */
  content: string;

  /** Structured body */
  structuredBody?: StructuredData;
}

// ============================================================================
// NURSE/USER INFORMATION
// ============================================================================

/**
 * Nurse/user information
 */
export interface Nurse {
  /** Unique identifier */
  id: string;

  /** Full name */
  name: string;

  /** License number */
  licenseNumber?: string;

  /** Credentials (RN, LPN, etc.) */
  credentials?: string;

  /** Department */
  department?: string;

  /** Role */
  role?: 'RN' | 'LPN' | 'LVN' | 'CNA' | 'NP' | 'CNS';
}

// ============================================================================
// LEGACY TYPES (for backwards compatibility with existing code)
// ============================================================================

/**
 * @deprecated Use DocumentationEntry instead
 */
export interface NurseNote {
  id: string;
  patientId: string;
  patientName: string;
  patientMRN: string;
  timestamp: string;
  noteType: WorkflowType;
  transcription: string;
  vitalSigns?: VitalSigns;
  assessmentData?: Record<string, any>;
  status: 'draft' | 'completed' | 'submitted';
  nurseId?: string;
  nurseName?: string;
}
