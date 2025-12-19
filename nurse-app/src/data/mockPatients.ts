import type { Patient } from '../../../shared/types';

/**
 * Mock patient data for Nurse App - matches EHR Dashboard data
 * In production, this would come from the hospital's patient management system
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
 * Get patient by ID
 */
export function getPatientById(patientId: string): Patient | undefined {
  return mockPatients.find((p) => p.id === patientId);
}
