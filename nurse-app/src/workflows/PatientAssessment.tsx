/**
 * Patient Assessment Workflow Component
 * Captures comprehensive patient assessment data with voice integration
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
import { useApp } from '../contexts/AppContext';

interface PatientAssessmentData {
  patientId: string;
  roomNumber: string;
  levelOfConsciousness: string;
  mobilityStatus: string;
  painLevel: number;
  skinCondition: string;
  observations: string;
}

const levelOfConsciousnessOptions = [
  { value: 'alert', label: 'Alert' },
  { value: 'confused', label: 'Confused' },
  { value: 'drowsy', label: 'Drowsy' },
  { value: 'lethargic', label: 'Lethargic' },
  { value: 'responsive', label: 'Responsive' },
  { value: 'unresponsive', label: 'Unresponsive' },
];

const mobilityOptions = [
  { value: 'ambulatory', label: 'Ambulatory' },
  { value: 'assisted', label: 'Assisted' },
  { value: 'bedbound', label: 'Bedbound' },
  { value: 'wheelchair', label: 'Wheelchair' },
];

export const PatientAssessment: React.FC<WorkflowBaseProps> = ({
  transcript,
  isRecording,
  onSubmit,
  onCancel,
}) => {
  const { selectedPatient } = useApp();

  const [formData, setFormData] = useState<PatientAssessmentData>({
    patientId: selectedPatient?.id || '',
    roomNumber: selectedPatient?.room || '',
    levelOfConsciousness: '',
    mobilityStatus: '',
    painLevel: 0,
    skinCondition: '',
    observations: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [editedTranscript, setEditedTranscript] = useState(transcript || '');

  // Field-targeted transcript auto-fill with NLP integration
  const { segmentationWarnings } = useFieldTargetedTranscript({
    transcript,
    workflowType: 'patient-assessment',
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

  const handleFieldChange = (field: keyof PatientAssessmentData, value: any) => {
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
        field: 'patientId',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Patient ID is required',
      },
      {
        field: 'roomNumber',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Room number is required',
      },
      {
        field: 'levelOfConsciousness',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Level of consciousness is required',
      },
      {
        field: 'mobilityStatus',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Mobility status is required',
      },
      {
        field: 'painLevel',
        validator: (value: number) => value >= 0 && value <= 10,
        message: 'Pain level must be between 0 and 10',
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
      workflowType: 'patient-assessment',
    });
  };

  const fields: Record<string, WorkflowField> = {
    patientId: {
      name: 'patientId',
      label: 'Patient ID',
      type: 'text',
      required: true,
      autoFilled: autoFilledFields.has('patientId'),
      placeholder: 'e.g., PT12345',
    },
    roomNumber: {
      name: 'roomNumber',
      label: 'Room Number',
      type: 'text',
      required: true,
      autoFilled: autoFilledFields.has('roomNumber'),
      placeholder: 'e.g., 301A',
    },
    levelOfConsciousness: {
      name: 'levelOfConsciousness',
      label: 'Level of Consciousness',
      type: 'select',
      required: true,
      autoFilled: autoFilledFields.has('levelOfConsciousness'),
      options: levelOfConsciousnessOptions,
    },
    mobilityStatus: {
      name: 'mobilityStatus',
      label: 'Mobility Status',
      type: 'select',
      required: true,
      autoFilled: autoFilledFields.has('mobilityStatus'),
      options: mobilityOptions,
    },
    painLevel: {
      name: 'painLevel',
      label: 'Pain Level (0-10)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('painLevel'),
      min: 0,
      max: 10,
      step: 1,
    },
    skinCondition: {
      name: 'skinCondition',
      label: 'Skin Condition',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('skinCondition'),
      placeholder: 'Describe skin integrity, color, temperature, moisture...',
    },
    observations: {
      name: 'observations',
      label: 'General Observations',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('observations'),
      placeholder: 'Additional observations and notes...',
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Assessment</h2>
        <p className="text-gray-600">
          Complete patient assessment form. Fields highlighted in blue were auto-filled from your voice
          transcript.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <TranscriptViewer
          transcript={editedTranscript}
          isRecording={isRecording}
          onEdit={setEditedTranscript}
        />

        {/* Voice Recording Tips */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-semibold mb-1">
            💡 Voice Recording Tip:
          </p>
          <p className="text-sm text-blue-800">
            Say field names before content for targeted auto-fill. Example: "Skin condition warm and dry. Observations patient ambulatory."
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

        <FieldGroup title="Patient Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.patientId}
              value={formData.patientId}
              onChange={(value) => handleFieldChange('patientId', value)}
              error={errors.patientId}
            />
            <FormField
              field={fields.roomNumber}
              value={formData.roomNumber}
              onChange={(value) => handleFieldChange('roomNumber', value)}
              error={errors.roomNumber}
            />
          </div>
        </FieldGroup>

        <FieldGroup title="Physical Assessment">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.levelOfConsciousness}
              value={formData.levelOfConsciousness}
              onChange={(value) => handleFieldChange('levelOfConsciousness', value)}
              error={errors.levelOfConsciousness}
            />
            <FormField
              field={fields.mobilityStatus}
              value={formData.mobilityStatus}
              onChange={(value) => handleFieldChange('mobilityStatus', value)}
              error={errors.mobilityStatus}
            />
          </div>

          <FormField
            field={fields.painLevel}
            value={formData.painLevel}
            onChange={(value) => handleFieldChange('painLevel', value)}
            error={errors.painLevel}
          />

          <FormField
            field={fields.skinCondition}
            value={formData.skinCondition}
            onChange={(value) => handleFieldChange('skinCondition', value)}
          />
        </FieldGroup>

        <FieldGroup title="Additional Notes">
          <FormField
            field={fields.observations}
            value={formData.observations}
            onChange={(value) => handleFieldChange('observations', value)}
          />
        </FieldGroup>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Complete Assessment"
        />
      </form>
    </div>
  );
};

export default PatientAssessment;
