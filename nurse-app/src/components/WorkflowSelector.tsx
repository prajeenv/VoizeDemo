/**
 * Workflow Selector Component
 * Allows nurses to choose the appropriate documentation workflow
 */

import React from 'react';

export type WorkflowType =
  | 'patient-assessment'
  | 'vital-signs'
  | 'medication-administration'
  | 'wound-care'
  | 'shift-handoff';

export interface WorkflowOption {
  type: WorkflowType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const workflowOptions: WorkflowOption[] = [
  {
    type: 'patient-assessment',
    name: 'Patient Assessment',
    description: 'Complete comprehensive patient assessment including LOC, mobility, and skin condition',
    icon: '👤',
    color: 'blue',
  },
  {
    type: 'vital-signs',
    name: 'Vital Signs',
    description: 'Record blood pressure, heart rate, temperature, respiratory rate, and SpO2',
    icon: '❤️',
    color: 'red',
  },
  {
    type: 'medication-administration',
    name: 'Medication Administration',
    description: 'Document medication administration including drug name, dosage, route, and patient response',
    icon: '💊',
    color: 'green',
  },
  {
    type: 'wound-care',
    name: 'Wound Care',
    description: 'Document wound assessment, measurements, drainage, and treatment provided',
    icon: '🩹',
    color: 'orange',
  },
  {
    type: 'shift-handoff',
    name: 'Shift Handoff',
    description: 'Complete shift handoff using SBAR format (Situation, Background, Assessment, Recommendation)',
    icon: '🔄',
    color: 'purple',
  },
];

interface WorkflowSelectorProps {
  onSelectWorkflow: (workflowType: WorkflowType) => void;
  currentWorkflow?: WorkflowType | null;
}

export const WorkflowSelector: React.FC<WorkflowSelectorProps> = ({
  onSelectWorkflow,
  currentWorkflow,
}) => {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = 'transition-all duration-200';
    const colorMap: Record<string, { default: string; hover: string; selected: string }> = {
      blue: {
        default: 'bg-white border-blue-200 hover:border-blue-400 hover:shadow-md',
        hover: 'hover:bg-blue-50',
        selected: 'bg-blue-100 border-blue-500 shadow-lg',
      },
      red: {
        default: 'bg-white border-red-200 hover:border-red-400 hover:shadow-md',
        hover: 'hover:bg-red-50',
        selected: 'bg-red-100 border-red-500 shadow-lg',
      },
      green: {
        default: 'bg-white border-green-200 hover:border-green-400 hover:shadow-md',
        hover: 'hover:bg-green-50',
        selected: 'bg-green-100 border-green-500 shadow-lg',
      },
      orange: {
        default: 'bg-white border-orange-200 hover:border-orange-400 hover:shadow-md',
        hover: 'hover:bg-orange-50',
        selected: 'bg-orange-100 border-orange-500 shadow-lg',
      },
      purple: {
        default: 'bg-white border-purple-200 hover:border-purple-400 hover:shadow-md',
        hover: 'hover:bg-purple-50',
        selected: 'bg-purple-100 border-purple-500 shadow-lg',
      },
    };

    const colors = colorMap[color] || colorMap.blue;
    return `${baseClasses} ${isSelected ? colors.selected : `${colors.default} ${colors.hover}`}`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Select Documentation Type</h2>
        <p className="text-gray-600 text-lg">
          Choose the workflow that matches your current documentation needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflowOptions.map((workflow) => {
          const isSelected = currentWorkflow === workflow.type;

          return (
            <button
              key={workflow.type}
              onClick={() => onSelectWorkflow(workflow.type)}
              className={`p-6 border-2 rounded-xl text-left ${getColorClasses(
                workflow.color,
                isSelected
              )}`}
            >
              <div className="flex items-start gap-4 mb-3">
                <span className="text-4xl">{workflow.icon}</span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{workflow.name}</h3>
                  {isSelected && (
                    <span className="inline-block px-2 py-1 text-xs bg-green-600 text-white rounded-full font-semibold">
                      Active
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{workflow.description}</p>
            </button>
          );
        })}
      </div>

      {currentWorkflow && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p className="text-blue-800">
            <strong>Current Workflow:</strong>{' '}
            {workflowOptions.find((w) => w.type === currentWorkflow)?.name}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Click another workflow above to switch documentation types
          </p>
        </div>
      )}
    </div>
  );
};

export default WorkflowSelector;
