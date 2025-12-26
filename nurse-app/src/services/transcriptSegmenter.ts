/**
 * Transcript Segmenter Service
 * Parses continuous speech into field-specific segments based on field label mentions
 * Handles speech without punctuation by scanning for field labels anywhere in text
 */

import type { WorkflowType } from '../../../shared/types';
// Note: We use inline field label definitions for better performance

export interface FieldSegment {
  fieldKey: string;
  content: string;
  confidence: number;
  startPosition: number;
  endPosition: number;
}

export interface SegmentationResult {
  segments: FieldSegment[];
  unmatchedContent: string;
  warnings: string[];
}

interface FieldMarker {
  fieldKey: string;
  position: number;  // character position in transcript
  endPosition: number;  // end of the label phrase
  confidence: number;
  phrase: string;
}

/**
 * Get all possible field label phrases for a workflow
 */
function getFieldLabelPhrases(workflowType: WorkflowType): Map<string, string> {
  // Map of lowercase phrase -> fieldKey
  const phrases = new Map<string, string>();

  // Define all label phrases per workflow
  const labelsByWorkflow: Record<string, Record<string, string[]>> = {
    'vital-signs': {
      'systolic': ['systolic', 'systolic pressure'],
      'diastolic': ['diastolic', 'diastolic pressure'],
      'bloodPressure': ['blood pressure', 'bp'],
      'heartRate': ['heart rate', 'pulse', 'hr'],
      'temperature': ['temperature', 'temp'],
      'respiratoryRate': ['respiratory rate', 'respiration', 'rr', 'respirations'],
      'oxygenSaturation': ['oxygen saturation', 'o2 sat', 'spo2', 'oxygen sat', 'o2'],
      'painLevel': ['pain level', 'pain', 'pain score']
    },
    'wound-care': {
      'woundLocation': ['wound location', 'location', 'wound site', 'site'],
      'woundType': ['wound type', 'type of wound', 'wound kind'],
      'length': ['length', 'wound length'],
      'width': ['width', 'wound width'],
      'depth': ['depth', 'wound depth'],
      'drainageAmount': ['drainage amount', 'drainage', 'amount of drainage'],
      'drainageType': ['drainage type', 'type of drainage'],
      'treatmentProvided': ['treatment provided', 'treatment', 'care provided', 'tx', 'intervention', 'wound care', 'dressing']
    },
    'shift-handoff': {
      'outgoingNurse': ['outgoing nurse', 'outgoing', 'outgoing nurse name', 'leaving nurse', 'off going nurse', 'departing nurse'],
      'incomingNurse': ['incoming nurse', 'incoming', 'incoming nurse name', 'arriving nurse', 'oncoming nurse', 'relieving nurse'],
      'situation': ['situation', 'current status', 'current situation', 'sit', 'status'],
      'background': ['background', 'history', 'patient background', 'bg', 'back', 'medical history'],
      'assessment': ['assessment', 'findings', 'clinical findings', 'assess'],
      'recommendation': ['recommendation', 'plan', 'recommendations', 'rec', 'care plan'],
      'pendingTasks': ['pending tasks', 'pending', 'tasks', 'pending items', 'to do'],
      'criticalAlerts': ['critical alerts', 'alerts', 'critical', 'warnings']
    },
    'patient-assessment': {
      'levelOfConsciousness': ['level of consciousness', 'consciousness', 'loc', 'mental status'],
      'mobilityStatus': ['mobility status', 'mobility', 'ambulation', 'ambulatory status'],
      'painLevel': ['pain level', 'pain', 'pain score'],
      'skinCondition': ['skin condition', 'skin', 'skin integrity', 'integument'],
      'observations': ['observations', 'general observations', 'notes', 'additional notes', 'obs']
    },
    'medication-administration': {
      'medicationName': ['medication name', 'medication', 'med name', 'drug name'],
      'dosage': ['dosage', 'dose', 'amount'],
      'route': ['route', 'route of administration', 'administration route', 'via'],
      'timeAdministered': ['time administered', 'time given', 'administered at', 'given at'],
      'patientResponse': ['patient response', 'response', 'patient reaction', 'reaction', 'effect'],
      'adverseReaction': ['adverse reaction', 'adverse reactions', 'adverses reactions', 'adverse effects', 'side effects', 'adverse', 'side effect']
    }
  };

  const labels = labelsByWorkflow[workflowType] || {};
  for (const [fieldKey, phraseList] of Object.entries(labels)) {
    for (const phrase of phraseList) {
      phrases.set(phrase.toLowerCase(), fieldKey);
    }
  }

  return phrases;
}

/**
 * Find all field markers in continuous text (without relying on punctuation)
 */
function findFieldMarkersInText(
  transcript: string,
  workflowType: WorkflowType
): FieldMarker[] {
  const markers: FieldMarker[] = [];
  const lowerTranscript = transcript.toLowerCase();
  const phrases = getFieldLabelPhrases(workflowType);

  // Sort phrases by length (longest first) to match longer phrases before shorter ones
  const sortedPhrases = Array.from(phrases.entries()).sort((a, b) => b[0].length - a[0].length);

  // Track which positions are already claimed by a match
  const claimedPositions = new Set<number>();

  for (const [phrase, fieldKey] of sortedPhrases) {
    let searchStart = 0;

    while (true) {
      const pos = lowerTranscript.indexOf(phrase, searchStart);
      if (pos === -1) break;

      // Check if this position is already claimed
      let isClaimed = false;
      for (let i = pos; i < pos + phrase.length; i++) {
        if (claimedPositions.has(i)) {
          isClaimed = true;
          break;
        }
      }

      if (!isClaimed) {
        // Check word boundaries (not in middle of a word)
        const charBefore = pos > 0 ? lowerTranscript[pos - 1] : ' ';
        const charAfter = pos + phrase.length < lowerTranscript.length
          ? lowerTranscript[pos + phrase.length]
          : ' ';

        const isWordBoundaryBefore = /[\s.,;:!?]/.test(charBefore) || pos === 0;
        const isWordBoundaryAfter = /[\s.,;:!?]/.test(charAfter) || pos + phrase.length === lowerTranscript.length;

        if (isWordBoundaryBefore && isWordBoundaryAfter) {
          markers.push({
            fieldKey,
            position: pos,
            endPosition: pos + phrase.length,
            confidence: phrase.length > 10 ? 1.0 : 0.9, // Longer phrases = higher confidence
            phrase: transcript.substring(pos, pos + phrase.length)
          });

          // Claim these positions
          for (let i = pos; i < pos + phrase.length; i++) {
            claimedPositions.add(i);
          }
        }
      }

      searchStart = pos + 1;
    }
  }

  // Sort by position in transcript
  markers.sort((a, b) => a.position - b.position);

  return markers;
}

/**
 * Handle duplicate field mentions by using the LAST mentioned value
 * When a user mentions a field multiple times, the last mention is treated as a correction
 */
function handleDuplicateFields(
  segments: FieldSegment[],
  warnings: string[]
): FieldSegment[] {
  const fieldMap = new Map<string, FieldSegment>();

  for (const segment of segments) {
    if (fieldMap.has(segment.fieldKey)) {
      warnings.push(
        `Field "${segment.fieldKey}" mentioned again - updated to latest value`
      );
    }
    // Always use the latest value (last mention wins)
    fieldMap.set(segment.fieldKey, { ...segment });
  }

  return Array.from(fieldMap.values());
}

/**
 * Segment transcript into field-specific content
 * Handles continuous speech without punctuation
 * @param transcript The full voice transcript
 * @param workflowType The current workflow type
 * @returns Segmentation result with field segments and warnings
 */
export function segmentTranscript(
  transcript: string,
  workflowType: WorkflowType
): SegmentationResult {
  const warnings: string[] = [];

  if (!transcript || transcript.trim().length === 0) {
    return {
      segments: [],
      unmatchedContent: '',
      warnings: ['Empty transcript']
    };
  }

  // Find all field markers in the continuous text
  const markers = findFieldMarkersInText(transcript, workflowType);

  // Check if no markers found
  if (markers.length === 0) {
    return {
      segments: [],
      unmatchedContent: transcript,
      warnings: ['No field labels detected in transcript']
    };
  }

  // Extract content between markers
  const segments: FieldSegment[] = [];

  for (let i = 0; i < markers.length; i++) {
    const currentMarker = markers[i];
    const nextMarker = markers[i + 1];

    // Content starts after the field label
    const contentStart = currentMarker.endPosition;
    // Content ends at the next marker or end of transcript
    const contentEnd = nextMarker ? nextMarker.position : transcript.length;

    // Extract and clean content
    let content = transcript.substring(contentStart, contentEnd).trim();

    // Remove leading punctuation/whitespace
    content = content.replace(/^[\s.,;:!?]+/, '').trim();

    // Only add if content is not empty
    if (content.length > 0) {
      segments.push({
        fieldKey: currentMarker.fieldKey,
        content: content,
        confidence: currentMarker.confidence,
        startPosition: currentMarker.position,
        endPosition: contentEnd
      });
    } else {
      warnings.push(`Field "${currentMarker.fieldKey}" mentioned but no content provided`);
    }
  }

  // Handle duplicate field mentions - last value wins
  const mergedSegments = handleDuplicateFields(segments, warnings);

  return {
    segments: mergedSegments,
    unmatchedContent: '',
    warnings
  };
}

/**
 * Get segment for a specific field key
 */
export function getSegmentForField(
  result: SegmentationResult,
  fieldKey: string
): FieldSegment | null {
  return result.segments.find(s => s.fieldKey === fieldKey) || null;
}

/**
 * Check if a field was mentioned in the transcript
 */
export function wasFieldMentioned(
  result: SegmentationResult,
  fieldKey: string
): boolean {
  return result.segments.some(s => s.fieldKey === fieldKey);
}
