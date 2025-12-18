// Shared TypeScript types for the Voize Demo application

export interface Patient {
  id: string;
  name: string;
  mrn: string; // Medical Record Number
  dateOfBirth: string;
  room?: string;
}

export interface VitalSigns {
  bloodPressure?: string;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
}

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

export type WorkflowType =
  | 'admission'
  | 'shift-assessment'
  | 'medication-administration'
  | 'discharge'
  | 'general-note';

export interface WorkflowTemplate {
  type: WorkflowType;
  name: string;
  description: string;
  promptGuide: string[];
  requiredFields: string[];
}
