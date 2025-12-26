/**
 * Field-Targeted Transcript Hook
 * Integrates NLP parsing with field label recognition for intelligent auto-fill
 */

import { useEffect, useState, useRef } from 'react';
import type { WorkflowType } from '../../../shared/types';
import { segmentTranscript, type SegmentationResult } from '../services/transcriptSegmenter';
import { isTextareaField } from '../services/fieldLabelMatcher';
import {
  extractVitalSigns,
  extractMedicationInfo,
  extractAssessmentInfo,
  extractWoundInfo,
} from '../workflows/transcriptParser';

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

    // Skip if transcript hasn't changed
    if (transcript === lastProcessedTranscript.current) {
      return;
    }

    const updates: Record<string, any> = {};
    const autoFilledFields = new Set<string>();

    // TIER 1: Extract structured data via NLP using direct transcript parsers
    // These return flat field keys that match the form data structure
    // Always run NLP on full transcript for best extraction
    const nlpData: Record<string, any> = {};

    // Extract data based on workflow type
    if (workflowType === 'patient-assessment') {
      // Extract vital signs (for pain level)
      const vitals = extractVitalSigns(transcript);
      if (vitals.painLevel !== undefined) nlpData.painLevel = vitals.painLevel;

      // Extract assessment info (consciousness, mobility)
      const assessment = extractAssessmentInfo(transcript);
      if (assessment.levelOfConsciousness) nlpData.levelOfConsciousness = assessment.levelOfConsciousness;
      if (assessment.mobilityStatus) nlpData.mobilityStatus = assessment.mobilityStatus;
    } else if (workflowType === 'medication-administration') {
      // Extract medication info
      const medInfo = extractMedicationInfo(transcript);
      if (medInfo.medications && medInfo.medications.length > 0) {
        nlpData.medicationName = medInfo.medications[0];
      }
      if (medInfo.dosage) nlpData.dosage = medInfo.dosage;
      if (medInfo.route) nlpData.route = medInfo.route;
    } else if (workflowType === 'wound-care') {
      // Extract wound info
      const woundInfo = extractWoundInfo(transcript);
      if (woundInfo.location) nlpData.woundLocation = woundInfo.location;
      if (woundInfo.length) nlpData.length = woundInfo.length;
      if (woundInfo.width) nlpData.width = woundInfo.width;
      if (woundInfo.depth) nlpData.depth = woundInfo.depth;
    }
    // Note: shift-handoff relies entirely on field-targeted segmentation (SBAR labels)

    // TIER 2: Extract field-targeted content for textarea fields
    // Run segmentation on FULL transcript to ensure field labels that span chunks are detected
    const segmentationResult: SegmentationResult = segmentTranscript(transcript, workflowType);
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

    // Rule 2: Apply NLP-extracted data for non-textarea fields that weren't explicitly mentioned
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
        if (value !== null && value !== undefined && value !== '') {
          // Check if field is empty or has default value (0 for numbers)
          const currentValue = currentFormData[key];
          const isEmpty = currentValue === '' || currentValue === 0 || currentValue === undefined || currentValue === null;

          if (isEmpty) {
            updates[key] = value;
            autoFilledFields.add(key);
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
