// Workflow templates for different nursing documentation types
// Defines structure and prompts for each workflow

import type { WorkflowTemplate } from '../../../shared/types'

/**
 * Comprehensive workflow templates with detailed prompts
 * Aligned with the new WorkflowType definitions
 */
export const workflowTemplates: WorkflowTemplate[] = [
  {
    type: 'patient-assessment',
    name: 'Patient Assessment',
    description: 'Comprehensive head-to-toe patient assessment',
    promptGuide: [
      'Patient identification and current status',
      'Level of consciousness and orientation',
      'Vital signs (BP, HR, Temp, RR, SpO2, Pain)',
      'Cardiovascular: heart rhythm, pulse quality, edema',
      'Respiratory: breath sounds, oxygen support, cough',
      'Gastrointestinal: bowel sounds, last BM, abdomen',
      'Genitourinary: urine output, continence',
      'Musculoskeletal: mobility, strength, gait',
      'Neurological: pupils, motor/sensory function',
      'Skin: integrity, wounds, color, turgor',
      'Pain: location, quality, severity (0-10 scale)',
      'Psychosocial: mood, affect, behavior'
    ],
    requiredFields: ['levelOfConsciousness', 'vitalSigns', 'assessment'],
    icon: '🩺',
    color: '#2563EB'
  },
  {
    type: 'medication-administration',
    name: 'Medication Administration',
    description: 'Document medication administration and patient response',
    promptGuide: [
      'Medication name (generic and brand)',
      'Dosage amount and unit',
      'Route of administration (PO, IV, IM, SQ, etc.)',
      'Time administered',
      'Site of administration (if injectable)',
      'Reason for administration (if PRN)',
      'Patient response or reaction',
      'Any adverse effects observed'
    ],
    requiredFields: ['medicationName', 'dose', 'route', 'timeAdministered'],
    icon: '💊',
    color: '#10B981'
  },
  {
    type: 'wound-care',
    name: 'Wound Care',
    description: 'Detailed wound assessment and treatment documentation',
    promptGuide: [
      'Wound location on body',
      'Type of wound (pressure ulcer, surgical, etc.)',
      'Stage (if pressure ulcer: Stage 1-4)',
      'Dimensions: length, width, depth in cm',
      'Wound bed: color, tissue type, granulation',
      'Drainage: amount, type (serous, purulent), odor',
      'Wound edges and periwound skin condition',
      'Treatment or dressing applied',
      'Pain level at wound site (0-10)',
      'Signs of infection if present'
    ],
    requiredFields: ['location', 'woundType', 'dimensions', 'treatment'],
    icon: '🩹',
    color: '#F59E0B'
  },
  {
    type: 'vital-signs',
    name: 'Vital Signs',
    description: 'Quick vital signs documentation',
    promptGuide: [
      'Blood pressure (systolic/diastolic)',
      'Heart rate',
      'Temperature and method (oral, tympanic, etc.)',
      'Respiratory rate',
      'Oxygen saturation (SpO2)',
      'Pain level (0-10 scale)',
      'Blood glucose (if applicable)',
      'Patient position during vitals'
    ],
    requiredFields: ['bloodPressure', 'heartRate', 'temperature', 'respiratoryRate'],
    icon: '📊',
    color: '#EF4444'
  },
  {
    type: 'shift-handoff',
    name: 'Shift Handoff',
    description: 'SBAR format shift-to-shift report',
    promptGuide: [
      'SITUATION: Current patient status and issues',
      'BACKGROUND: Relevant history and admission reason',
      'ASSESSMENT: Clinical findings and vital trends',
      'RECOMMENDATION: Plan and pending tasks',
      'Key events during shift',
      'IV access and lines status',
      'Diet and activity level',
      'Upcoming procedures or appointments',
      'Family concerns or involvement'
    ],
    requiredFields: ['situation', 'background', 'assessment', 'recommendation'],
    icon: '🔄',
    color: '#8B5CF6'
  },
  {
    type: 'admission',
    name: 'Patient Admission',
    description: 'Initial patient admission documentation',
    promptGuide: [
      'Patient demographics and identification',
      'Admitting diagnosis and chief complaint',
      'Admission source (ED, direct, transfer)',
      'Medical and surgical history',
      'Current medications (name, dose, frequency)',
      'Known allergies (medications, food, environmental)',
      'Code status and advance directives',
      'Initial vital signs',
      'Initial head-to-toe assessment',
      'Patient and family education provided'
    ],
    requiredFields: ['admittingDiagnosis', 'chiefComplaint', 'allergies', 'vitalSigns'],
    icon: '🏥',
    color: '#06B6D4'
  },
  {
    type: 'discharge',
    name: 'Patient Discharge',
    description: 'Patient discharge documentation and instructions',
    promptGuide: [
      'Discharge disposition (home, SNF, rehab, etc.)',
      'Final assessment and vital signs',
      'Discharge instructions provided',
      'Discharge medications (name, dose, frequency, purpose)',
      'Follow-up appointments scheduled',
      'Warning signs to watch for',
      'Activity restrictions',
      'Diet instructions',
      'Patient/family understanding verified',
      'Contact information provided'
    ],
    requiredFields: ['dischargeDisposition', 'dischargeInstructions', 'medications'],
    icon: '🚪',
    color: '#EC4899'
  },
  {
    type: 'general-note',
    name: 'General Note',
    description: 'Free-form nursing note for any observation or event',
    promptGuide: [
      'Date, time, and patient identification',
      'Observation or event description',
      'Actions taken or interventions performed',
      'Patient response to interventions',
      'Notifications made (physician, family, etc.)',
      'Additional notes or concerns'
    ],
    requiredFields: [],
    icon: '📝',
    color: '#64748B'
  }
]

/**
 * Get workflow template by type
 */
export function getWorkflowTemplate(type: string): WorkflowTemplate | undefined {
  return workflowTemplates.find(template => template.type === type)
}

/**
 * Get all workflow types for selection UI
 */
export function getAllWorkflowTypes(): { type: string; name: string; description: string; icon?: string; color?: string }[] {
  return workflowTemplates.map(template => ({
    type: template.type,
    name: template.name,
    description: template.description,
    icon: template.icon,
    color: template.color
  }))
}
