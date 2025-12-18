/**
 * Base components and utilities for all workflow forms
 */

import React from 'react';

export interface WorkflowField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'time';
  required?: boolean;
  autoFilled?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface WorkflowBaseProps {
  transcript: string;
  isRecording: boolean;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

interface FieldGroupProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({ title, children, collapsible = false }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        {collapsible && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isOpen ? '▼' : '▶'}
          </button>
        )}
      </div>
      {isOpen && <div className="space-y-3">{children}</div>}
    </div>
  );
};

interface FormFieldProps {
  field: WorkflowField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ field, value, onChange, error }) => {
  const baseInputClass = `w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    error ? 'border-red-500' : 'border-gray-300'
  } ${field.autoFilled ? 'bg-blue-50 border-blue-300' : 'bg-white'}`;

  const renderInput = () => {
    switch (field.type) {
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={`${baseInputClass} min-h-[80px]`}
            rows={3}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            className={baseInputClass}
          />
        );

      case 'date':
      case 'time':
        return (
          <input
            type={field.type}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
        {field.autoFilled && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
            Auto-filled
          </span>
        )}
      </label>
      {renderInput()}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

interface TranscriptViewerProps {
  transcript: string;
  isRecording: boolean;
  onEdit?: (transcript: string) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  transcript,
  isRecording,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedTranscript, setEditedTranscript] = React.useState(transcript);

  React.useEffect(() => {
    setEditedTranscript(transcript);
  }, [transcript]);

  const handleSave = () => {
    onEdit?.(editedTranscript);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTranscript(transcript);
    setIsEditing(false);
  };

  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          Voice Transcript
          {isRecording && (
            <span className="flex items-center gap-1 text-sm font-normal text-red-600">
              <span className="animate-pulse">●</span> Recording
            </span>
          )}
        </h3>
        {!isEditing && onEdit && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
            rows={6}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-gray-700 whitespace-pre-wrap">
          {transcript || (
            <span className="text-gray-400 italic">
              {isRecording ? 'Listening...' : 'No transcript yet. Start recording to begin.'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

interface ValidationRule {
  field: string;
  validator: (value: any) => boolean;
  message: string;
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRule[]
): Record<string, string> => {
  const errors: Record<string, string> = {};

  rules.forEach((rule) => {
    const value = data[rule.field];
    if (!rule.validator(value)) {
      errors[rule.field] = rule.message;
    }
  });

  return errors;
};

export const FormActions: React.FC<{
  onSubmit: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}> = ({ onSubmit, onCancel, submitLabel = 'Submit', cancelLabel = 'Cancel', isSubmitting = false }) => {
  return (
    <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
      <button
        type="submit"
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
      >
        {isSubmitting ? 'Submitting...' : submitLabel}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
        >
          {cancelLabel}
        </button>
      )}
    </div>
  );
};
