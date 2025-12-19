import type { Patient, DocumentationEntry } from '../../../shared/types';

/**
 * Mock patient data for EHR Dashboard demonstration
 */
export const mockPatients: Patient[] = [
  {
    id: 'patient-001',
    name: 'Smith, John',
    mrn: 'MRN-2024-001',
    dateOfBirth: '1965-03-15',
    room: '204',
    gender: 'male',
    admissionDate: '2025-12-15T08:30:00Z',
    primaryDiagnosis: 'Pneumonia, CHF exacerbation',
    allergies: ['Penicillin', 'Sulfa'],
    codeStatus: 'Full Code',
  },
  {
    id: 'patient-002',
    name: 'Davis, Mary',
    mrn: 'MRN-2024-002',
    dateOfBirth: '1978-07-22',
    room: '206',
    gender: 'female',
    admissionDate: '2025-12-16T14:15:00Z',
    primaryDiagnosis: 'Post-op hip replacement',
    allergies: ['NKDA'],
    codeStatus: 'Full Code',
  },
  {
    id: 'patient-003',
    name: 'Johnson, Bob',
    mrn: 'MRN-2024-003',
    dateOfBirth: '1952-11-08',
    room: '208',
    gender: 'male',
    admissionDate: '2025-12-14T10:00:00Z',
    primaryDiagnosis: 'Diabetic ketoacidosis',
    allergies: ['Latex'],
    codeStatus: 'DNR',
  },
  {
    id: 'patient-004',
    name: 'Williams, Sarah',
    mrn: 'MRN-2024-004',
    dateOfBirth: '1988-05-30',
    room: '210',
    gender: 'female',
    admissionDate: '2025-12-17T06:45:00Z',
    primaryDiagnosis: 'Sepsis, UTI',
    allergies: ['NKDA'],
    codeStatus: 'Full Code',
  },
  {
    id: 'patient-005',
    name: 'Brown, Michael',
    mrn: 'MRN-2024-005',
    dateOfBirth: '1970-09-12',
    room: '212',
    gender: 'male',
    admissionDate: '2025-12-13T12:30:00Z',
    primaryDiagnosis: 'COPD exacerbation',
    allergies: ['Shellfish'],
    codeStatus: 'Full Code',
  },
  {
    id: 'patient-006',
    name: 'Martinez, Elena',
    mrn: 'MRN-2024-006',
    dateOfBirth: '1945-02-18',
    room: '214',
    gender: 'female',
    admissionDate: '2025-12-16T09:20:00Z',
    primaryDiagnosis: 'Stroke (CVA), left hemisphere',
    allergies: ['Aspirin', 'NSAIDs'],
    codeStatus: 'DNR',
  },
];

/**
 * Mock existing documentation entries for realistic dashboard display
 */
export const mockDocumentationEntries: DocumentationEntry[] = [
  {
    id: 'doc-001',
    timestamp: '2025-12-19T08:00:00Z',
    nurseId: 'nurse-002',
    nurseName: 'Nurse Williams',
    patientId: 'patient-001',
    patientMRN: 'MRN-2024-001',
    patientName: 'Smith, John',
    workflowType: 'vital-signs',
    voiceTranscript: 'Vital signs for John Smith in room 204. Blood pressure 142 over 88. Heart rate 92. Temperature 98.6 oral. Respiratory rate 18. Oxygen saturation 94% on 2 liters nasal cannula. Pain level 3 out of 10.',
    structuredData: {
      vitalSigns: {
        timestamp: '2025-12-19T08:00:00Z',
        bloodPressure: '142/88',
        systolic: 142,
        diastolic: 88,
        heartRate: 92,
        temperature: 98.6,
        temperatureMethod: 'oral',
        respiratoryRate: 18,
        oxygenSaturation: 94,
        painLevel: 3,
      },
    },
    status: 'sent_to_ehr',
    sentToEHRAt: '2025-12-19T08:02:00Z',
    transcriptConfidence: 0.94,
  },
  {
    id: 'doc-002',
    timestamp: '2025-12-19T09:30:00Z',
    nurseId: 'nurse-002',
    nurseName: 'Nurse Williams',
    patientId: 'patient-002',
    patientMRN: 'MRN-2024-002',
    patientName: 'Davis, Mary',
    workflowType: 'medication-administration',
    voiceTranscript: 'Medication administration for Mary Davis room 206. Given Norco 10-325, one tablet by mouth at 9:30 AM for post-operative pain level 7. Patient tolerated well, no adverse effects noted.',
    structuredData: {
      medications: [
        {
          name: 'Norco 10-325',
          dose: '1 tablet',
          route: 'PO',
          timeAdministered: '2025-12-19T09:30:00Z',
          reason: 'Post-operative pain',
          response: 'Tolerated well, no adverse effects',
        },
      ],
    },
    status: 'sent_to_ehr',
    sentToEHRAt: '2025-12-19T09:32:00Z',
    transcriptConfidence: 0.96,
  },
  {
    id: 'doc-003',
    timestamp: '2025-12-19T10:15:00Z',
    nurseId: 'nurse-003',
    nurseName: 'Nurse Chen',
    patientId: 'patient-003',
    patientMRN: 'MRN-2024-003',
    patientName: 'Johnson, Bob',
    workflowType: 'patient-assessment',
    voiceTranscript: 'Assessment for Bob Johnson room 208. Patient alert and oriented times three. Cardiovascular: regular rhythm, strong peripheral pulses, no edema. Respiratory: breath sounds clear bilaterally, no oxygen support needed. Blood glucose 145. Patient ambulatory with steady gait.',
    structuredData: {
      vitalSigns: {
        bloodGlucose: 145,
      },
      assessment: {
        levelOfConsciousness: 'alert',
        orientation: 'Alert and oriented x3 (person, place, time)',
        cardiovascular: {
          rhythm: 'Regular',
          pulseQuality: 'strong',
          edema: 'None',
        },
        respiratory: {
          breathSounds: 'Clear bilaterally',
          oxygenSupport: 'Room air',
        },
        musculoskeletal: {
          mobility: 'Ambulatory',
          gait: 'Steady',
        },
      },
    },
    status: 'sent_to_ehr',
    sentToEHRAt: '2025-12-19T10:17:00Z',
    transcriptConfidence: 0.92,
  },
  {
    id: 'doc-004',
    timestamp: '2025-12-19T11:45:00Z',
    nurseId: 'nurse-002',
    nurseName: 'Nurse Williams',
    patientId: 'patient-001',
    patientMRN: 'MRN-2024-001',
    patientName: 'Smith, John',
    workflowType: 'medication-administration',
    voiceTranscript: 'Med admin for John Smith. Lasix 40 milligrams IV push given at 11:45. Patient urinated 400 mL clear yellow urine at 12:30. No adverse reactions.',
    structuredData: {
      medications: [
        {
          name: 'Lasix',
          dose: '40mg',
          route: 'IV',
          timeAdministered: '2025-12-19T11:45:00Z',
          reason: 'CHF, fluid overload',
          response: 'Urinated 400mL clear yellow urine, no adverse reactions',
        },
      ],
    },
    status: 'sent_to_ehr',
    sentToEHRAt: '2025-12-19T11:47:00Z',
    transcriptConfidence: 0.95,
  },
];

/**
 * Get patient by ID
 */
export function getPatientById(patientId: string): Patient | undefined {
  return mockPatients.find((p) => p.id === patientId);
}

/**
 * Get documentation entries for a specific patient
 */
export function getEntriesForPatient(patientId: string): DocumentationEntry[] {
  return mockDocumentationEntries.filter((entry) => entry.patientId === patientId);
}

/**
 * Count unread entries for a patient
 * In this mock, we'll consider entries from the last 2 hours as "new"
 */
export function getUnreadCount(patientId: string): number {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  return mockDocumentationEntries.filter(
    (entry) =>
      entry.patientId === patientId && new Date(entry.timestamp) > twoHoursAgo
  ).length;
}
