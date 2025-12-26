/**
 * Shift Handoff Workflow Component
 * Captures shift handoff data using SBAR format with voice integration
 */

import React, { useState, useEffect } from 'react';
import {
  type WorkflowBaseProps,
  FieldGroup,
  FormField,
  TranscriptViewer,
  FormActions,
  validateForm,
  type WorkflowField,
} from './WorkflowBase';
import { useFieldTargetedTranscript } from '../hooks/useFieldTargetedTranscript';

interface ShiftHandoffData {
  outgoingNurse: string;
  incomingNurse: string;
  shiftTime: string;
  situation: string;
  background: string;
  assessment: string;
  recommendation: string;
  pendingTasks: string;
  criticalAlerts: string;
}

export const ShiftHandoff: React.FC<WorkflowBaseProps> = ({
  transcript,
  isRecording,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<ShiftHandoffData>({
    outgoingNurse: '',
    incomingNurse: '',
    shiftTime: new Date().toISOString().slice(0, 16),
    situation: '',
    background: '',
    assessment: '',
    recommendation: '',
    pendingTasks: '',
    criticalAlerts: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [editedTranscript, setEditedTranscript] = useState(transcript || '');

  // Field-targeted transcript auto-fill with NLP integration
  const { segmentationWarnings } = useFieldTargetedTranscript({
    transcript,
    workflowType: 'shift-handoff',
    currentFormData: formData,
    onAutoFill: (updates, newAutoFilled) => {
      setFormData((prev) => ({ ...prev, ...updates }));
      setAutoFilledFields((prev) => new Set([...prev, ...newAutoFilled]));
    }
  });

  // Update edited transcript when transcript changes
  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  const handleFieldChange = (field: keyof ShiftHandoffData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Remove auto-filled status when user manually edits
    if (autoFilledFields.has(field)) {
      setAutoFilledFields((prev) => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const validationRules = [
      {
        field: 'outgoingNurse',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Outgoing nurse name is required',
      },
      {
        field: 'incomingNurse',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Incoming nurse name is required',
      },
      {
        field: 'shiftTime',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Shift time is required',
      },
      {
        field: 'situation',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Situation (current status) is required',
      },
      {
        field: 'background',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Background information is required',
      },
      {
        field: 'assessment',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Assessment is required',
      },
      {
        field: 'recommendation',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Recommendation is required',
      },
    ];

    const validationErrors = validateForm(formData, validationRules);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Submit the data with transcript
    onSubmit({
      ...formData,
      transcript: editedTranscript,
      timestamp: new Date().toISOString(),
      workflowType: 'shift-handoff',
    });
  };

  const fields: Record<string, WorkflowField> = {
    outgoingNurse: {
      name: 'outgoingNurse',
      label: 'Outgoing Nurse',
      type: 'text',
      required: true,
      placeholder: 'e.g., Sarah Johnson, RN',
    },
    incomingNurse: {
      name: 'incomingNurse',
      label: 'Incoming Nurse',
      type: 'text',
      required: true,
      placeholder: 'e.g., Michael Chen, RN',
    },
    shiftTime: {
      name: 'shiftTime',
      label: 'Shift Handoff Time',
      type: 'datetime-local' as any,
      required: true,
    },
    situation: {
      name: 'situation',
      label: 'Situation (Current Status & Issues)',
      type: 'textarea',
      required: true,
      autoFilled: autoFilledFields.has('situation'),
      placeholder: 'What is happening with the patient right now? Current problems, concerns, symptoms...',
    },
    background: {
      name: 'background',
      label: 'Background (Relevant History & Context)',
      type: 'textarea',
      required: true,
      autoFilled: autoFilledFields.has('background'),
      placeholder: 'Medical history, admission diagnosis, relevant procedures, medications...',
    },
    assessment: {
      name: 'assessment',
      label: 'Assessment (Clinical Findings)',
      type: 'textarea',
      required: true,
      autoFilled: autoFilledFields.has('assessment'),
      placeholder: 'Current vital signs, lab results, physical assessment findings, trends...',
    },
    recommendation: {
      name: 'recommendation',
      label: 'Recommendation (Continuing Care)',
      type: 'textarea',
      required: true,
      autoFilled: autoFilledFields.has('recommendation'),
      placeholder: 'What needs to be done? Upcoming tasks, monitoring needs, anticipated changes...',
    },
    pendingTasks: {
      name: 'pendingTasks',
      label: 'Pending Tasks',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('pendingTasks'),
      placeholder: 'Outstanding orders, scheduled medications, pending tests or procedures...',
    },
    criticalAlerts: {
      name: 'criticalAlerts',
      label: 'Critical Alerts',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('criticalAlerts'),
      placeholder: 'Fall risk, isolation precautions, allergies, code status, special needs...',
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Shift Handoff (SBAR)</h2>
        <p className="text-gray-600">
          Complete shift handoff using SBAR format: Situation, Background, Assessment, Recommendation. Fields highlighted in blue were auto-filled from your voice transcript.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <TranscriptViewer
          transcript={editedTranscript}
          isRecording={isRecording}
          onEdit={setEditedTranscript}
        />

        <FieldGroup title="Handoff Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.outgoingNurse}
              value={formData.outgoingNurse}
              onChange={(value) => handleFieldChange('outgoingNurse', value)}
              error={errors.outgoingNurse}
            />
            <FormField
              field={fields.incomingNurse}
              value={formData.incomingNurse}
              onChange={(value) => handleFieldChange('incomingNurse', value)}
              error={errors.incomingNurse}
            />
          </div>

          <FormField
            field={fields.shiftTime}
            value={formData.shiftTime}
            onChange={(value) => handleFieldChange('shiftTime', value)}
            error={errors.shiftTime}
          />
        </FieldGroup>

        {/* Voice Recording Tips */}
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900 font-semibold mb-1">
            💡 Voice Recording Tip for SBAR:
          </p>
          <p className="text-sm text-green-800">
            Say field names before content. Example: "Outgoing nurse Sarah Johnson. Incoming nurse Michael Chen. Situation patient has chest pain. Background history of CAD. Assessment BP 140/90. Recommendation monitor closely."
          </p>
        </div>

        {/* Segmentation Warnings */}
        {segmentationWarnings.length > 0 && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-semibold mb-1">Transcript Notes:</p>
            <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
              {segmentationWarnings.map((warning, i) => (
                <li key={i}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">SBAR Framework</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li><strong>S</strong>ituation: What is happening right now?</li>
            <li><strong>B</strong>ackground: What led to this situation?</li>
            <li><strong>A</strong>ssessment: What do you think the problem is?</li>
            <li><strong>R</strong>ecommendation: What should be done?</li>
          </ul>
        </div>

        <FieldGroup title="S - Situation">
          <FormField
            field={fields.situation}
            value={formData.situation}
            onChange={(value) => handleFieldChange('situation', value)}
            error={errors.situation}
          />
        </FieldGroup>

        <FieldGroup title="B - Background">
          <FormField
            field={fields.background}
            value={formData.background}
            onChange={(value) => handleFieldChange('background', value)}
            error={errors.background}
          />
        </FieldGroup>

        <FieldGroup title="A - Assessment">
          <FormField
            field={fields.assessment}
            value={formData.assessment}
            onChange={(value) => handleFieldChange('assessment', value)}
            error={errors.assessment}
          />
        </FieldGroup>

        <FieldGroup title="R - Recommendation">
          <FormField
            field={fields.recommendation}
            value={formData.recommendation}
            onChange={(value) => handleFieldChange('recommendation', value)}
            error={errors.recommendation}
          />
        </FieldGroup>

        <FieldGroup title="Additional Information" collapsible>
          <FormField
            field={fields.pendingTasks}
            value={formData.pendingTasks}
            onChange={(value) => handleFieldChange('pendingTasks', value)}
          />

          <FormField
            field={fields.criticalAlerts}
            value={formData.criticalAlerts}
            onChange={(value) => handleFieldChange('criticalAlerts', value)}
          />

          {formData.criticalAlerts && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
              <p className="text-sm text-red-800 font-semibold">
                ⚠️ Critical alerts documented. Ensure incoming nurse acknowledges all alerts.
              </p>
            </div>
          )}
        </FieldGroup>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Complete Shift Handoff"
        />
      </form>
    </div>
  );
};

export default ShiftHandoff;
