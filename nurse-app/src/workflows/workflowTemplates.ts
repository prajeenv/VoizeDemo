// Workflow templates for different nursing documentation types
// Defines structure and prompts for each workflow

import { WorkflowTemplate } from '../../../shared/types'

export const workflowTemplates: WorkflowTemplate[] = [
  {
    type: 'admission',
    name: 'Patient Admission',
    description: 'Initial patient admission documentation',
    promptGuide: [
      'Patient identification and demographics',
      'Chief complaint and reason for admission',
      'Medical history',
      'Current medications',
      'Allergies',
      'Initial vital signs',
      'Initial assessment'
    ],
    requiredFields: ['patientName', 'mrn', 'chiefComplaint', 'vitalSigns']
  },
  {
    type: 'shift-assessment',
    name: 'Shift Assessment',
    description: 'Routine shift-to-shift patient assessment',
    promptGuide: [
      'Patient status update',
      'Vital signs',
      'Pain assessment',
      'System-by-system review',
      'Interventions performed',
      'Patient response',
      'Plan for next shift'
    ],
    requiredFields: ['vitalSigns', 'assessment']
  },
  {
    type: 'medication-administration',
    name: 'Medication Administration',
    description: 'Medication administration record',
    promptGuide: [
      'Medication name and dose',
      'Route of administration',
      'Time administered',
      'Patient response',
      'Any adverse reactions'
    ],
    requiredFields: ['medicationName', 'dose', 'route', 'time']
  },
  {
    type: 'discharge',
    name: 'Patient Discharge',
    description: 'Patient discharge documentation',
    promptGuide: [
      'Final assessment',
      'Discharge instructions given',
      'Medications prescribed',
      'Follow-up appointments',
      'Patient understanding verified',
      'Discharge destination'
    ],
    requiredFields: ['dischargeInstructions', 'followUp']
  },
  {
    type: 'general-note',
    name: 'General Note',
    description: 'Free-form nursing note',
    promptGuide: [
      'Observation or event',
      'Actions taken',
      'Patient response',
      'Additional notes'
    ],
    requiredFields: []
  }
]
