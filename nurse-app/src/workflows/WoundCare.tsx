/**
 * Wound Care Workflow Component
 * Captures wound assessment and treatment data with voice integration
 */

import React, { useState, useEffect } from 'react';
import {
  type WorkflowBaseProps,
  FieldGroup,
  FormField,
  FormActions,
  validateForm,
  type WorkflowField,
} from './WorkflowBase';
import { useFieldTargetedTranscript } from '../hooks/useFieldTargetedTranscript';

interface WoundCareData {
  woundLocation: string;
  woundType: string;
  length: number;
  width: number;
  depth: number;
  drainageAmount: string;
  drainageType: string;
  treatmentProvided: string;
}

const woundTypeOptions = [
  { value: 'pressure-ulcer', label: 'Pressure Ulcer' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'traumatic', label: 'Traumatic' },
  { value: 'venous', label: 'Venous' },
  { value: 'arterial', label: 'Arterial' },
  { value: 'diabetic', label: 'Diabetic' },
  { value: 'burn', label: 'Burn' },
  { value: 'laceration', label: 'Laceration' },
  { value: 'abrasion', label: 'Abrasion' },
];

const drainageAmountOptions = [
  { value: 'none', label: 'None' },
  { value: 'scant', label: 'Scant' },
  { value: 'small', label: 'Small' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'large', label: 'Large' },
  { value: 'copious', label: 'Copious' },
];

const drainageTypeOptions = [
  { value: 'none', label: 'None' },
  { value: 'serous', label: 'Serous (Clear/Yellow)' },
  { value: 'serosanguineous', label: 'Serosanguineous (Pink/Red)' },
  { value: 'sanguineous', label: 'Sanguineous (Blood)' },
  { value: 'purulent', label: 'Purulent (Pus)' },
];

export const WoundCare: React.FC<WorkflowBaseProps> = ({
  transcript,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<WoundCareData>({
    woundLocation: '',
    woundType: '',
    length: 0,
    width: 0,
    depth: 0,
    drainageAmount: 'none',
    drainageType: 'none',
    treatmentProvided: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilledFields, setAutoFilledFields] = useState<Set<string>>(new Set());
  const [editedTranscript, setEditedTranscript] = useState(transcript || '');

  // Field-targeted transcript auto-fill with NLP integration
  const { segmentationWarnings } = useFieldTargetedTranscript({
    transcript,
    workflowType: 'wound-care',
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

  const handleFieldChange = (field: keyof WoundCareData, value: any) => {
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
        field: 'woundLocation',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Wound location is required',
      },
      {
        field: 'woundType',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Wound type is required',
      },
      {
        field: 'length',
        validator: (value: number) => value > 0,
        message: 'Wound length must be greater than 0',
      },
      {
        field: 'width',
        validator: (value: number) => value > 0,
        message: 'Wound width must be greater than 0',
      },
      {
        field: 'treatmentProvided',
        validator: (value: string) => !!(value && value.length > 0),
        message: 'Treatment provided is required',
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
      dimensions: {
        length: formData.length,
        width: formData.width,
        depth: formData.depth || undefined,
      },
      drainage: {
        amount: formData.drainageAmount,
        type: formData.drainageType,
      },
      transcript: editedTranscript,
      timestamp: new Date().toISOString(),
      workflowType: 'wound-care',
    });
  };

  const fields: Record<string, WorkflowField> = {
    woundLocation: {
      name: 'woundLocation',
      label: 'Wound Location',
      type: 'text',
      required: true,
      autoFilled: autoFilledFields.has('woundLocation'),
      placeholder: 'e.g., Right heel, Sacrum, Left hip',
    },
    woundType: {
      name: 'woundType',
      label: 'Wound Type',
      type: 'select',
      required: true,
      options: woundTypeOptions,
    },
    length: {
      name: 'length',
      label: 'Length (cm)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('length'),
      placeholder: 'e.g., 5.0',
      min: 0,
      step: 0.1,
    },
    width: {
      name: 'width',
      label: 'Width (cm)',
      type: 'number',
      required: true,
      autoFilled: autoFilledFields.has('width'),
      placeholder: 'e.g., 3.5',
      min: 0,
      step: 0.1,
    },
    depth: {
      name: 'depth',
      label: 'Depth (cm)',
      type: 'number',
      required: false,
      autoFilled: autoFilledFields.has('depth'),
      placeholder: 'e.g., 1.5',
      min: 0,
      step: 0.1,
    },
    drainageAmount: {
      name: 'drainageAmount',
      label: 'Drainage Amount',
      type: 'select',
      required: true,
      options: drainageAmountOptions,
    },
    drainageType: {
      name: 'drainageType',
      label: 'Drainage Type',
      type: 'select',
      required: true,
      options: drainageTypeOptions,
    },
    treatmentProvided: {
      name: 'treatmentProvided',
      label: 'Treatment Provided',
      type: 'textarea',
      required: true,
      autoFilled: autoFilledFields.has('treatmentProvided'),
      placeholder: 'Describe wound care treatment, dressing type, cleansing method...',
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wound Care</h2>
        <p className="text-gray-600">
          Document wound assessment and treatment. Fields highlighted in blue were auto-filled from your
          voice transcript.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Voice Recording Tips */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-semibold mb-1">
            💡 Voice Recording Tip:
          </p>
          <p className="text-sm text-blue-800">
            Say "Treatment provided" before describing care. Example: "Treatment provided cleaned with saline, applied hydrocolloid dressing."
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

        <FieldGroup title="Wound Assessment">
          <FormField
            field={fields.woundLocation}
            value={formData.woundLocation}
            onChange={(value) => handleFieldChange('woundLocation', value)}
            error={errors.woundLocation}
          />

          <FormField
            field={fields.woundType}
            value={formData.woundType}
            onChange={(value) => handleFieldChange('woundType', value)}
            error={errors.woundType}
          />
        </FieldGroup>

        <FieldGroup title="Wound Measurements">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              field={fields.length}
              value={formData.length}
              onChange={(value) => handleFieldChange('length', value)}
              error={errors.length}
            />
            <FormField
              field={fields.width}
              value={formData.width}
              onChange={(value) => handleFieldChange('width', value)}
              error={errors.width}
            />
            <FormField
              field={fields.depth}
              value={formData.depth}
              onChange={(value) => handleFieldChange('depth', value)}
              error={errors.depth}
            />
          </div>

          {formData.length > 0 && formData.width > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Wound Size:</strong> {formData.length} cm × {formData.width} cm
                {formData.depth > 0 && ` × ${formData.depth} cm (LWD)`}
              </p>
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="Drainage Characteristics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              field={fields.drainageAmount}
              value={formData.drainageAmount}
              onChange={(value) => handleFieldChange('drainageAmount', value)}
            />
            <FormField
              field={fields.drainageType}
              value={formData.drainageType}
              onChange={(value) => handleFieldChange('drainageType', value)}
            />
          </div>

          {formData.drainageType === 'purulent' && (
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <p className="text-sm text-yellow-800 font-semibold">
                ⚠️ Purulent drainage noted. Monitor for signs of infection and consider notifying provider.
              </p>
            </div>
          )}
        </FieldGroup>

        <FieldGroup title="Treatment">
          <FormField
            field={fields.treatmentProvided}
            value={formData.treatmentProvided}
            onChange={(value) => handleFieldChange('treatmentProvided', value)}
            error={errors.treatmentProvided}
          />
        </FieldGroup>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Record Wound Care"
        />
      </form>
    </div>
  );
};

export default WoundCare;
