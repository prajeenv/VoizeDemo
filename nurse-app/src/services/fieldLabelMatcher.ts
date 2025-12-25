/**
 * Field Label Matcher Service
 * Maps spoken field names to actual field keys with fuzzy matching and medical terminology support
 */

import type { WorkflowType } from '../../../shared/types';

export interface FieldLabelMatch {
  fieldKey: string;
  confidence: number;
  matchedPhrase: string;
}

export interface FieldMapping {
  fieldKey: string;
  primaryLabels: string[];      // Main field name variations
  aliases: string[];            // Common abbreviations/synonyms
  medicalTerms: string[];       // Medical terminology variations
}

// Patient Assessment Field Mappings
const PATIENT_ASSESSMENT_MAPPINGS: FieldMapping[] = [
  {
    fieldKey: 'skinCondition',
    primaryLabels: ['skin condition', 'skin', 'skin integrity'],
    aliases: ['skin cond', 'integument'],
    medicalTerms: ['dermatological', 'epidermis', 'skin assessment']
  },
  {
    fieldKey: 'observations',
    primaryLabels: ['observations', 'general observations', 'notes', 'additional notes'],
    aliases: ['obs', 'general obs', 'general notes'],
    medicalTerms: ['clinical observations', 'assessment notes']
  }
];

// Medication Administration Field Mappings
const MEDICATION_MAPPINGS: FieldMapping[] = [
  {
    fieldKey: 'patientResponse',
    primaryLabels: ['patient response', 'response', 'patient reaction'],
    aliases: ['reaction', 'effect', 'patient effect'],
    medicalTerms: ['therapeutic response', 'medication response']
  },
  {
    fieldKey: 'adverseReaction',
    primaryLabels: ['adverse reaction', 'adverse effects', 'side effects'],
    aliases: ['adverse', 'side effect', 'adverse event'],
    medicalTerms: ['adverse drug reaction', 'adr', 'medication adverse event']
  }
];

// Wound Care Field Mappings
const WOUND_CARE_MAPPINGS: FieldMapping[] = [
  {
    fieldKey: 'treatmentProvided',
    primaryLabels: ['treatment', 'treatment provided', 'care provided'],
    aliases: ['tx', 'treatment given', 'intervention'],
    medicalTerms: ['wound care', 'wound treatment', 'dressing change']
  }
];

// Shift Handoff Field Mappings (SBAR)
const SHIFT_HANDOFF_MAPPINGS: FieldMapping[] = [
  {
    fieldKey: 'situation',
    primaryLabels: ['situation', 'current status', 'current situation'],
    aliases: ['s', 'sit', 'status'],
    medicalTerms: ['sbar s', 'sbar situation']
  },
  {
    fieldKey: 'background',
    primaryLabels: ['background', 'history', 'patient background'],
    aliases: ['b', 'bg', 'back'],
    medicalTerms: ['sbar b', 'sbar background', 'medical history']
  },
  {
    fieldKey: 'assessment',
    primaryLabels: ['assessment', 'findings', 'clinical findings'],
    aliases: ['a', 'assess'],
    medicalTerms: ['sbar a', 'sbar assessment', 'clinical assessment']
  },
  {
    fieldKey: 'recommendation',
    primaryLabels: ['recommendation', 'plan', 'recommendations'],
    aliases: ['r', 'rec'],
    medicalTerms: ['sbar r', 'sbar recommendation', 'care plan']
  },
  {
    fieldKey: 'pendingTasks',
    primaryLabels: ['pending tasks', 'pending', 'tasks'],
    aliases: ['pending items', 'to-do', 'todos'],
    medicalTerms: []
  },
  {
    fieldKey: 'criticalAlerts',
    primaryLabels: ['critical alerts', 'alerts', 'critical'],
    aliases: ['warnings', 'critical items'],
    medicalTerms: []
  }
];

// Common Web Speech API misrecognitions
const COMMON_MISRECOGNITIONS: Record<string, string> = {
  'citation': 'situation',
  'ass': 's',
  'assess meant': 'assessment',
  'recommend asian': 'recommendation',
  'back ground': 'background',
  'skin integration': 'skin integrity',
  'observation': 'observations',
};

/**
 * Get field mappings for a specific workflow type
 */
function getWorkflowMappings(workflowType: WorkflowType): FieldMapping[] {
  switch (workflowType) {
    case 'patient-assessment':
      return PATIENT_ASSESSMENT_MAPPINGS;
    case 'medication-administration':
      return MEDICATION_MAPPINGS;
    case 'wound-care':
      return WOUND_CARE_MAPPINGS;
    case 'shift-handoff':
      return SHIFT_HANDOFF_MAPPINGS;
    default:
      return [];
  }
}

/**
 * Normalize spoken text for matching
 */
function normalizeSpoken(text: string): string {
  let normalized = text.toLowerCase().trim();

  // Remove punctuation
  normalized = normalized.replace(/[.,;:!?]/g, '');

  // Apply common misrecognition corrections
  for (const [wrong, correct] of Object.entries(COMMON_MISRECOGNITIONS)) {
    if (normalized.includes(wrong)) {
      normalized = normalized.replace(new RegExp(wrong, 'g'), correct);
    }
  }

  return normalized;
}

/**
 * Calculate Levenshtein distance for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Calculate similarity score (0-1) based on Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  if (maxLength === 0) return 1.0;

  return 1 - (distance / maxLength);
}

/**
 * Match a spoken field label to actual field key
 * @param spokenText The text spoken by the user
 * @param workflowType The current workflow type
 * @param threshold Minimum similarity threshold (0-1), default 0.7
 * @returns Matched field information or null if no match found
 */
export function matchFieldLabel(
  spokenText: string,
  workflowType: WorkflowType,
  threshold: number = 0.7
): FieldLabelMatch | null {
  // 1. Normalize input
  const normalized = normalizeSpoken(spokenText);

  // 2. Get workflow-specific mappings
  const mappings = getWorkflowMappings(workflowType);

  // 3. Try exact matches first (highest confidence)
  for (const mapping of mappings) {
    for (const label of mapping.primaryLabels) {
      if (normalized === label) {
        return {
          fieldKey: mapping.fieldKey,
          confidence: 1.0,
          matchedPhrase: spokenText
        };
      }
    }
  }

  // 4. Try aliases (high confidence)
  for (const mapping of mappings) {
    for (const alias of mapping.aliases) {
      if (normalized === alias) {
        return {
          fieldKey: mapping.fieldKey,
          confidence: 0.9,
          matchedPhrase: spokenText
        };
      }
    }
  }

  // 5. Try medical terms (high confidence)
  for (const mapping of mappings) {
    for (const term of mapping.medicalTerms) {
      if (normalized.includes(term) || term.includes(normalized)) {
        return {
          fieldKey: mapping.fieldKey,
          confidence: 0.85,
          matchedPhrase: spokenText
        };
      }
    }
  }

  // 6. Fuzzy matching with Levenshtein distance
  let bestMatch: FieldLabelMatch | null = null;
  let highestScore = 0;

  for (const mapping of mappings) {
    const allLabels = [
      ...mapping.primaryLabels,
      ...mapping.aliases,
      ...mapping.medicalTerms
    ];

    for (const label of allLabels) {
      const similarity = calculateSimilarity(normalized, label);

      if (similarity > highestScore && similarity >= threshold) {
        highestScore = similarity;
        bestMatch = {
          fieldKey: mapping.fieldKey,
          confidence: similarity,
          matchedPhrase: spokenText
        };
      }
    }
  }

  return bestMatch;
}

/**
 * Get all field keys for a workflow (for textarea identification)
 */
export function getTextareaFields(workflowType: WorkflowType): string[] {
  const mappings = getWorkflowMappings(workflowType);
  return mappings.map(m => m.fieldKey);
}

/**
 * Check if a field is a textarea field for given workflow
 */
export function isTextareaField(fieldKey: string, workflowType: WorkflowType): boolean {
  const textareaFields = getTextareaFields(workflowType);
  return textareaFields.includes(fieldKey);
}

/**
 * Get expected field names for user guidance (display purposes)
 */
export function getExpectedFieldNames(workflowType: WorkflowType): Record<string, string[]> {
  const mappings = getWorkflowMappings(workflowType);
  const result: Record<string, string[]> = {};

  for (const mapping of mappings) {
    result[mapping.fieldKey] = mapping.primaryLabels;
  }

  return result;
}
