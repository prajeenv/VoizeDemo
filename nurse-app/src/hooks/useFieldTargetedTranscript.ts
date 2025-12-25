/**
 * Field-Targeted Transcript Hook
 * Integrates NLP parsing with field label recognition for intelligent auto-fill
 */

import { useEffect, useState, useRef } from 'react';
import type { WorkflowType } from '../../../shared/types';
import { segmentTranscript, type SegmentationResult } from '../services/transcriptSegmenter';
import { parseTranscript } from '../services/parseService';
import { isTextareaField } from '../services/fieldLabelMatcher';

interface UseFieldTargetedTranscriptOptions {
  transcript: string;
  workflowType: WorkflowType;
  currentFormData: any;
  onAutoFill: (updates: Record<string, any>, autoFilledFields: Set<string>) => void;
}

export interface FieldTargetedTranscriptResult {
  segmentationWarnings: string[];
  hasFieldLabels: boolean;
}

/**
 * Hook for field-targeted transcript processing
 * Implements hybrid NLP + field label recognition auto-fill strategy
 */
export function useFieldTargetedTranscript({
  transcript,
  workflowType,
  currentFormData,
  onAutoFill
}: UseFieldTargetedTranscriptOptions): FieldTargetedTranscriptResult {
  const [segmentationWarnings, setSegmentationWarnings] = useState<string[]>([]);
  const [hasFieldLabels, setHasFieldLabels] = useState<boolean>(false);

  // Track which transcript content has been processed to enable re-entry
  const lastProcessedTranscript = useRef<string>('');

  useEffect(() => {
    if (!transcript || transcript.length === 0) {
      setSegmentationWarnings([]);
      setHasFieldLabels(false);
      return;
    }

    // Only process NEW transcript content (delta)
    if (transcript === lastProcessedTranscript.current) {
      return;
    }

    // Get the NEW portion of transcript
    const newContent = transcript.slice(lastProcessedTranscript.current.length);

    if (newContent.trim().length === 0) {
      return;
    }

    const updates: Record<string, any> = {};
    const autoFilledFields = new Set<string>();

    // TIER 1: Extract structured data via NLP (existing functionality)
    // This includes vitals, medications, consciousness level, mobility status, etc.
    const parseResult = parseTranscript(transcript, workflowType);
    const nlpData = parseResult.structuredData;

    // TIER 2: Extract field-targeted content (new functionality)
    const segmentationResult: SegmentationResult = segmentTranscript(newContent, workflowType);
    setSegmentationWarnings(segmentationResult.warnings);
    setHasFieldLabels(segmentationResult.segments.length > 0);

    // Step 3: Merge intelligently with priority rules
    // Rule 1: If field mentioned explicitly → use field-targeted content (highest priority)
    // This allows user to override any auto-fill or correct NLP mistakes
    for (const segment of segmentationResult.segments) {
      const fieldKey = segment.fieldKey;

      // Overwrite existing content if field is mentioned (enables re-entry)
      updates[fieldKey] = segment.content;
      autoFilledFields.add(fieldKey);
    }

    // Rule 2: If NLP extracted value AND field is NOT a textarea AND field wasn't explicitly mentioned
    // → use NLP data
    // (Skip patient ID and room number - they should come from patient selection)
    if (nlpData) {
      for (const [key, value] of Object.entries(nlpData)) {
        // Skip if already filled by field-targeted content
        if (updates[key] !== undefined) {
          continue;
        }

        // Skip patient ID and room number - these come from patient selection
        if (key === 'patientId' || key === 'roomNumber') {
          continue;
        }

        // Only fill non-textarea fields from NLP
        if (!isTextareaField(key, workflowType)) {
          // Handle different data types
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            // For objects like vital signs, check individual fields
            for (const [subKey, subValue] of Object.entries(value)) {
              if (subValue !== null && subValue !== undefined && subValue !== '') {
                if (!currentFormData[key] || !currentFormData[key][subKey]) {
                  if (!updates[key]) updates[key] = {};
                  updates[key][subKey] = subValue;
                  autoFilledFields.add(key);
                }
              }
            }
          } else if (value !== null && value !== undefined && value !== '') {
            // For primitive values, only fill if empty
            if (!currentFormData[key]) {
              updates[key] = value;
              autoFilledFields.add(key);
            }
          }
        }
      }
    }

    // Rule 3: For textareas without explicit mentions → DO NOT fill (leave empty)
    // This prevents unhelpful duplicate content across all textarea fields
    // (No fallback behavior)

    // Step 4: Apply updates
    if (Object.keys(updates).length > 0) {
      onAutoFill(updates, autoFilledFields);
    }

    // Update last processed transcript
    lastProcessedTranscript.current = transcript;

  }, [transcript, workflowType, currentFormData, onAutoFill]);

  // Reset processed transcript when workflow changes
  useEffect(() => {
    lastProcessedTranscript.current = '';
  }, [workflowType]);

  return {
    segmentationWarnings,
    hasFieldLabels
  };
}

/**
 * Hook to reset transcript processing state (call when Clear button clicked)
 */
export function useResetTranscriptProcessing() {
  const resetCallbacks = useRef<Array<() => void>>([]);

  const registerResetCallback = (callback: () => void) => {
    resetCallbacks.current.push(callback);
  };

  const resetTranscriptProcessing = () => {
    resetCallbacks.current.forEach(cb => cb());
  };

  return {
    registerResetCallback,
    resetTranscriptProcessing
  };
}
