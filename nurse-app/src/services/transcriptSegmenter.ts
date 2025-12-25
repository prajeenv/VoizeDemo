/**
 * Transcript Segmenter Service
 * Parses continuous speech into field-specific segments based on field label mentions
 */

import type { WorkflowType } from '../../../shared/types';
import { matchFieldLabel } from './fieldLabelMatcher';

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
  position: number;
  confidence: number;
  phrase: string;
}

// Medical abbreviations that should not be treated as sentence endings
const MEDICAL_ABBREVIATIONS = [
  'dr.', 'mr.', 'mrs.', 'ms.', 'pt.', 'pts.',
  'bp.', 'hr.', 'rr.', 'temp.', 'mg.', 'ml.',
  'cc.', 'sq.', 'iv.', 'im.', 'po.', 'prn.',
  'bid.', 'tid.', 'qid.', 'hs.', 'ac.', 'pc.',
  'stat.', 'no.', 'vs.', 'wt.', 'ht.'
];

/**
 * Check if a word is a medical abbreviation
 */
function isAbbreviation(word: string): boolean {
  const lowerWord = word.toLowerCase();
  return MEDICAL_ABBREVIATIONS.includes(lowerWord);
}

/**
 * Tokenize text into sentences, preserving medical abbreviations
 */
function tokenizeSentences(text: string): string[] {
  const sentences: string[] = [];
  let current = '';

  const words = text.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    current += (current ? ' ' : '') + word;

    // Check if word ends with sentence terminator
    if (word.match(/[.!?]$/)) {
      // Check if it's an abbreviation
      if (!isAbbreviation(word)) {
        sentences.push(current.trim());
        current = '';
      }
    }
  }

  // Add any remaining content
  if (current.trim()) {
    sentences.push(current.trim());
  }

  return sentences.filter(s => s.length > 0);
}

/**
 * Detect field markers in sentences
 */
function detectFieldMarkers(
  sentences: string[],
  workflowType: WorkflowType
): FieldMarker[] {
  const markers: FieldMarker[] = [];

  // Patterns for field label detection
  // "field_name: content" or "field_name, content" or "field_name content"
  const patterns = [
    /^(\w+(?:\s+\w+){0,3})[:]\s*(.+)/i,      // "situation: patient stable"
    /^(\w+(?:\s+\w+){0,3}),\s*(.+)/i,        // "situation, patient stable"
    /^(\w+(?:\s+\w+){0,3})\s+(.+)/i,         // "situation patient stable"
  ];

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];

    for (const pattern of patterns) {
      const match = sentence.match(pattern);

      if (match) {
        const potentialLabel = match[1];
        const fieldMatch = matchFieldLabel(potentialLabel, workflowType);

        if (fieldMatch && fieldMatch.confidence >= 0.7) {
          markers.push({
            fieldKey: fieldMatch.fieldKey,
            position: i,
            confidence: fieldMatch.confidence,
            phrase: potentialLabel
          });
          break; // Found a marker, move to next sentence
        }
      }
    }
  }

  return markers;
}

/**
 * Merge content for duplicate field mentions
 */
function mergeDuplicateFields(
  segments: FieldSegment[],
  warnings: string[]
): FieldSegment[] {
  const fieldMap = new Map<string, FieldSegment>();

  for (const segment of segments) {
    if (fieldMap.has(segment.fieldKey)) {
      const existing = fieldMap.get(segment.fieldKey)!;

      // Merge content with separator
      existing.content += '. ' + segment.content;
      existing.confidence = Math.min(existing.confidence, segment.confidence);

      warnings.push(
        `Field "${segment.fieldKey}" mentioned multiple times - content merged`
      );
    } else {
      fieldMap.set(segment.fieldKey, { ...segment });
    }
  }

  return Array.from(fieldMap.values());
}

/**
 * Segment transcript into field-specific content
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

  // Step 1: Tokenize transcript into sentences
  const sentences = tokenizeSentences(transcript);

  if (sentences.length === 0) {
    return {
      segments: [],
      unmatchedContent: transcript,
      warnings: ['Could not tokenize transcript']
    };
  }

  // Step 2: Identify field markers
  const markers = detectFieldMarkers(sentences, workflowType);

  // Step 3: Check if no markers found
  if (markers.length === 0) {
    return {
      segments: [],
      unmatchedContent: transcript,
      warnings: ['No field labels detected in transcript']
    };
  }

  // Step 4: Extract content between markers
  const segments: FieldSegment[] = [];

  for (let i = 0; i < markers.length; i++) {
    const currentMarker = markers[i];
    const nextMarker = markers[i + 1];

    const startIdx = currentMarker.position;
    const endIdx = nextMarker ? nextMarker.position : sentences.length;

    // Extract sentences between markers
    const fieldSentences = sentences.slice(startIdx, endIdx);

    // Remove the field label from first sentence
    let content = fieldSentences[0].replace(
      new RegExp(`^${escapeRegex(currentMarker.phrase)}[:, ]?\\s*`, 'i'),
      ''
    );

    // Append remaining sentences
    if (fieldSentences.length > 1) {
      content += ' ' + fieldSentences.slice(1).join(' ');
    }

    // Only add if content is not empty
    if (content.trim().length > 0) {
      segments.push({
        fieldKey: currentMarker.fieldKey,
        content: content.trim(),
        confidence: currentMarker.confidence,
        startPosition: startIdx,
        endPosition: endIdx
      });
    } else {
      warnings.push(`Field "${currentMarker.fieldKey}" mentioned but no content provided`);
    }
  }

  // Step 5: Handle duplicate field mentions
  const mergedSegments = mergeDuplicateFields(segments, warnings);

  return {
    segments: mergedSegments,
    unmatchedContent: '',
    warnings
  };
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
