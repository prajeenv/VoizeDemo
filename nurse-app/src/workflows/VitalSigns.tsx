/**
 * Vital Signs Workflow Component
 * Captures patient vital signs with voice integration
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
import { extractVitalSigns } from './transcriptParser';

interface VitalSignsData {
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  temperatureMethod: string;
  respiratoryRate: number;
  oxygenSaturation: number;
  painLevel: number;
  timestamp: string;
}

const temperatureMethodOptions = [
  { value: 'oral', label: 'Oral' },
  { value: 'tympanic', label: 'Tympanic (Ear)' },
  { value: 'temporal', label: 'Temporal (Forehead)' },
  { value: 'axillary', label: 'Axillary (Underarm)' },
  { value: 'rectal', label: 'Rectal' },
];

export const VitalSigns: React.FC<WorkflowBaseProps> = ({
  transcript,
  isRecording,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<VitalSignsData>({
    systolic: 0,
    diastolic: 0,
    heartRate: 0,
    temperature: 0,
    temperatureMethod: 'oral',
    respiratoryRate: 0,
    oxygenSaturation: 0,
    painLevel: 0,
    timestamp: new Date().toISOString().slice(0, 16),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [editedTranscript, setEditedTranscript] = useState(transcript);

  // Auto-fill fields from transcript
  useEffect(() => {
    if (!transcript) return;

    const vitalSigns = extractVitalSigns(transcript);

    const newAutoFilled = new Set<string>();
    const updates: Partial<VitalSignsData> = {};

    if (vitalSigns.systolic && formData.systolic === 0) {
      updates.systolic = vitalSigns.systolic;
      newAutoFilled.add('systolic');
    }

    if (vitalSigns.diastolic && formData.diastolic === 0) {
      updates.diastolic = vitalSigns.diastolic;
      newAutoFilled.add('diastolic');
    }

    if (vitalSigns.heartRate && formData.heartRate === 0) {
      updates.heartRate = vitalSigns.heartRate;
      newAutoFilled.add('heartRate');
    }

    if (vitalSigns.temperature && formData.temperature === 0) {
      updates.temperature = vitalSigns.temperature;
      newAutoFilled.add('temperature');
    }

    if (vitalSigns.respiratoryRate && formData.respiratoryRate === 0) {
      updates.respiratoryRate = vitalSigns.respiratoryRate;
      newAutoFilled.add('respiratoryRate');
    }

    if (vitalSigns.oxygenSaturation && formData.oxygenSaturation === 0) {
      updates.oxygenSaturation = vitalSigns.oxygenSaturation;
      newAutoFilled.add('oxygenSaturation');
    }

    if (vitalSigns.painLevel !== undefined && formData.painLevel === 0) {
      updates.painLevel = vitalSigns.painLevel;
      newAutoFilled.add('painLevel');
    }

    if (Object.keys(updates).length > 0) {
      setFormData((prev) => ({ ...prev, ...updates }));
      setAutoFilledFields((prev) => new Set([...prev, ...newAutoFilled]));
    }
  }, [transcript]);

  // Update edited transcript when transcript changes
  useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  const handleFieldChange = (field: keyof VitalSignsData, value: any) => {
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
        field: 'systolic',
        validator: (value: number) => value > 0 && value >= 70 && value <= 250,
        message: 'Systolic BP must be between 70 and 250 mmHg',
      },
      {
        field: 'diastolic',
        validator: (value: number) => value > 0 && value >= 40 && value <= 150,
        message: 'Diastolic BP must be between 40 and 150 mmHg',
      },
      {
        field: 'heartRate',
        validator: (value: number) => value > 0 && value >= 30 && value <= 250,
        message: 'Heart rate must be between 30 and 250 bpm',
      },
      {
        field: 'temperature',
        validator: (value: number) => value > 0 && value >= 95 && value <= 107,
        message: 'Temperature must be between 95 and 107°F',
      },
      {
        field: 'respiratoryRate',
        validator: (value: number) => value > 0 && value >= 8 && value <= 60,
        message: 'Respiratory rate must be between 8 and 60 breaths/min',
      },
      {
        field: 'oxygenSaturation',
        validator: (value: number) => value > 0 && value >= 70 && value <= 100,
        message: 'Oxygen saturation must be between 70 and 100%',
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
      bloodPressure: `${formData.systolic}/${formData.diastolic}`,
      transcript: editedTranscript,
      workflowType: 'vital-signs',
    });
  };

  const fields: Record<string, WorkflowField> = {
    systolic: {
      name: 'systolic',
      label: 'Systolic Blood Pressure (mmHg)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('systolic'),
      placeholder: 'e.g., 120',
      min: 70,
      max: 250,
    },
    diastolic: {
      name: 'diastolic',
      label: 'Diastolic Blood Pressure (mmHg)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('diastolic'),
      placeholder: 'e.g., 80',
      min: 40,
      max: 150,
    },
    heartRate: {
      name: 'heartRate',
      label: 'Heart Rate (BPM)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('heartRate'),
      placeholder: 'e.g., 72',
      min: 30,
      max: 250,
    },
    temperature: {
      name: 'temperature',
      label: 'Temperature (°F)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('temperature'),
      placeholder: 'e.g., 98.6',
      min: 95,
      max: 107,
      step: 0.1,
    },
    temperatureMethod: {
      name: 'temperatureMethod',
      label: 'Temperature Method',
      type: 'select',
      required: true,
      options: temperatureMethodOptions,
    },
    respiratoryRate: {
      name: 'respiratoryRate',
      label: 'Respiratory Rate (breaths/min)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('respiratoryRate'),
      placeholder: 'e.g., 16',
      min: 8,
      max: 60,
    },
    oxygenSaturation: {
      name: 'oxygenSaturation',
      label: 'Oxygen Saturation (SpO2 %)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('oxygenSaturation'),
      placeholder: 'e.g., 98',
      min: 70,
      max: 100,
    },
    painLevel: {
      name: 'painLevel',
      label: 'Pain Level (0-10)',
      type: 'number',
      required: false,
      autoFilled: autoFilledFields.has('painLevel'),
      min: 0,
      max: 10,
      step: 1,
    },
    timestamp: {
      name: 'timestamp',
      label: 'Time Recorded',
      type: 'datetime-local' as any,
      required: true,
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vital Signs</h2>
        <p className="text-gray-600">
          Record patient vital signs. Fields highlighted in blue were auto-filled from your voice transcript.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <TranscriptViewer
          transcript={editedTranscript}
          isRecording={isRecording}
          onEdit={setEditedTranscript}
        />

        <FieldGroup title="Blood Pressure">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.systolic}
              value={formData.systolic}
              onChange={(value) => handleFieldChange('systolic', value)}
              error={errors.systolic}
            />
            <FormField
              field={fields.diastolic}
              value={formData.diastolic}
              onChange={(value) => handleFieldChange('diastolic', value)}
              error={errors.diastolic}
            />
          </div>
          {formData.systolic > 0 && formData.diastolic > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Blood Pressure:</strong> {formData.systolic}/{formData.diastolic} mmHg
              </p>
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="Vital Measurements">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.heartRate}
              value={formData.heartRate}
              onChange={(value) => handleFieldChange('heartRate', value)}
              error={errors.heartRate}
            />
            <FormField
              field={fields.respiratoryRate}
              value={formData.respiratoryRate}
              onChange={(value) => handleFieldChange('respiratoryRate', value)}
              error={errors.respiratoryRate}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.temperature}
              value={formData.temperature}
              onChange={(value) => handleFieldChange('temperature', value)}
              error={errors.temperature}
            />
            <FormField
              field={fields.temperatureMethod}
              value={formData.temperatureMethod}
              onChange={(value) => handleFieldChange('temperatureMethod', value)}
            />
          </div>

          <FormField
            field={fields.oxygenSaturation}
            value={formData.oxygenSaturation}
            onChange={(value) => handleFieldChange('oxygenSaturation', value)}
            error={errors.oxygenSaturation}
          />
        </FieldGroup>

        <FieldGroup title="Additional Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.painLevel}
              value={formData.painLevel}
              onChange={(value) => handleFieldChange('painLevel', value)}
              error={errors.painLevel}
            />
            <FormField
              field={fields.timestamp}
              value={formData.timestamp}
              onChange={(value) => handleFieldChange('timestamp', value)}
            />
          </div>
        </FieldGroup>

        <FormActions onSubmit={handleSubmit} onCancel={onCancel} submitLabel="Record Vital Signs" />
      </form>
    </div>
  );
};

export default VitalSigns;
