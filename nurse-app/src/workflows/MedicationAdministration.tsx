/**
 * Medication Administration Workflow Component
 * Captures medication administration data with voice integration
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

interface MedicationAdministrationData {
  patientId: string;
  medicationName: string;
  dosage: string;
  route: string;
  timeAdministered: string;
  patientResponse: string;
  adverseReaction: string;
}

const routeOptions = [
  { value: 'PO', label: 'PO (Oral)' },
  { value: 'IV', label: 'IV (Intravenous)' },
  { value: 'IM', label: 'IM (Intramuscular)' },
  { value: 'SQ', label: 'SQ (Subcutaneous)' },
  { value: 'SL', label: 'SL (Sublingual)' },
  { value: 'PR', label: 'PR (Rectal)' },
  { value: 'TOP', label: 'TOP (Topical)' },
  { value: 'INH', label: 'INH (Inhalation)' },
  { value: 'OPH', label: 'OPH (Ophthalmic)' },
  { value: 'OT', label: 'OT (Otic)' },
  { value: 'NG', label: 'NG (Nasogastric)' },
  { value: 'GT', label: 'GT (Gastrostomy)' },
];

export const MedicationAdministration: React.FC<WorkflowBaseProps> = ({
  transcript,
  isRecording,
  onSubmit,
  onCancel,
}) => {
  const { selectedPatient } = useApp();

  const [formData, setFormData] = useState<MedicationAdministrationData>({
    patientId: selectedPatient?.id || '',
    medicationName: '',
    dosage: '',
    route: '',
    timeAdministered: new Date().toISOString().slice(0, 16),
    patientResponse: '',
    adverseReaction: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [editedTranscript, setEditedTranscript] = useState(transcript || '');

  // Field-targeted transcript auto-fill with NLP integration
  const { segmentationWarnings } = useFieldTargetedTranscript({
    transcript,
    workflowType: 'medication-administration',
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

  const handleFieldChange = (field: keyof MedicationAdministrationData, value: any) => {
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
        field: 'medicationName',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Medication name is required',
      },
      {
        field: 'dosage',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Dosage is required',
      },
      {
        field: 'route',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Route of administration is required',
      },
      {
        field: 'timeAdministered',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Time administered is required',
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
      workflowType: 'medication-administration',
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
    medicationName: {
      name: 'medicationName',
      label: 'Medication Name',
      type: 'text',
      required: true,
      autoFilled: autoFilledFields.has('medicationName'),
      placeholder: 'e.g., Aspirin, Metformin',
    },
    dosage: {
      name: 'dosage',
      label: 'Dosage',
      type: 'text',
      required: true,
      autoFilled: autoFilledFields.has('dosage'),
      placeholder: 'e.g., 500 mg, 10 units',
    },
    route: {
      name: 'route',
      label: 'Route of Administration',
      type: 'select',
      required: true,
      autoFilled: autoFilledFields.has('route'),
      options: routeOptions,
    },
    timeAdministered: {
      name: 'timeAdministered',
      label: 'Time Administered',
      type: 'datetime-local' as any,
      required: true,
      autoFilled: autoFilledFields.has('timeAdministered'),
    },
    patientResponse: {
      name: 'patientResponse',
      label: 'Patient Response/Reaction',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('patientResponse'),
      placeholder: 'Describe patient response to medication...',
    },
    adverseReaction: {
      name: 'adverseReaction',
      label: 'Adverse Reaction (if any)',
      type: 'textarea',
      required: false,
      autoFilled: autoFilledFields.has('adverseReaction'),
      placeholder: 'Document any adverse reactions or side effects...',
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medication Administration</h2>
        <p className="text-gray-600">
          Record medication administration. Fields highlighted in blue were auto-filled from your voice
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
            Say field names before content for targeted auto-fill. Example: "Patient response tolerated well. Adverse reaction none noted."
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
          <FormField
            field={fields.patientId}
            value={formData.patientId}
            onChange={(value) => handleFieldChange('patientId', value)}
            error={errors.patientId}
          />
        </FieldGroup>

        <FieldGroup title="Medication Details">
          <FormField
            field={fields.medicationName}
            value={formData.medicationName}
            onChange={(value) => handleFieldChange('medicationName', value)}
            error={errors.medicationName}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.dosage}
              value={formData.dosage}
              onChange={(value) => handleFieldChange('dosage', value)}
              error={errors.dosage}
            />
            <FormField
              field={fields.route}
              value={formData.route}
              onChange={(value) => handleFieldChange('route', value)}
              error={errors.route}
            />
          </div>

          <FormField
            field={fields.timeAdministered}
            value={formData.timeAdministered}
            onChange={(value) => handleFieldChange('timeAdministered', value)}
            error={errors.timeAdministered}
          />
        </FieldGroup>

        <FieldGroup title="Patient Response">
          <FormField
            field={fields.patientResponse}
            value={formData.patientResponse}
            onChange={(value) => handleFieldChange('patientResponse', value)}
          />

          <FormField
            field={fields.adverseReaction}
            value={formData.adverseReaction}
            onChange={(value) => handleFieldChange('adverseReaction', value)}
          />

          {formData.adverseReaction && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ Adverse reaction documented. Ensure proper follow-up protocols are followed.
              </p>
            </div>
          )}
        </FieldGroup>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Record Medication Administration"
        />
      </form>
    </div>
  );
};

export default MedicationAdministration;
