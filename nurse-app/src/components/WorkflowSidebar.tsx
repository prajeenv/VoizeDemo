/**
 * Workflow Sidebar Component
 * Sidebar for selecting documentation workflows
 */

import React from 'react';
import type { WorkflowType } from './WorkflowSelector';

export interface WorkflowOption {
  type: WorkflowType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const workflowOptions: WorkflowOption[] = [
  {
    type: 'vital-signs',
    name: 'Vitals',
    description: 'Record vital signs',
    icon: '❤️',
    color: 'red',
  },
  {
    type: 'patient-assessment',
    name: 'Assessment',
    description: 'Patient assessment',
    icon: '👤',
    color: 'blue',
  },
  {
    type: 'medication-administration',
    name: 'Medication',
    description: 'Med administration',
    icon: '💊',
    color: 'green',
  },
  {
    type: 'wound-care',
    name: 'Wound Care',
    description: 'Wound documentation',
    icon: '🩹',
    color: 'orange',
  },
  {
    type: 'shift-handoff',
    name: 'Handoff',
    description: 'Shift handoff (SBAR)',
    icon: '🔄',
    color: 'purple',
  },
];

interface WorkflowSidebarProps {
  selectedWorkflow: WorkflowType | null;
  onSelectWorkflow: (workflow: WorkflowType) => void;
}

export const WorkflowSidebar: React.FC<WorkflowSidebarProps> = ({
  selectedWorkflow,
  onSelectWorkflow,
}) => {
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; hover: string; selected: string }> = {
      red: {
        bg: 'bg-red-50',
        border: 'border-red-300',
        hover: 'hover:bg-red-100 hover:border-red-400',
        selected: 'bg-red-100 border-red-500 shadow-md',
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-300',
        hover: 'hover:bg-blue-100 hover:border-blue-400',
        selected: 'bg-blue-100 border-blue-500 shadow-md',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-300',
        hover: 'hover:bg-green-100 hover:border-green-400',
        selected: 'bg-green-100 border-green-500 shadow-md',
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        hover: 'hover:bg-orange-100 hover:border-orange-400',
        selected: 'bg-orange-100 border-orange-500 shadow-md',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        hover: 'hover:bg-purple-100 hover:border-purple-400',
        selected: 'bg-purple-100 border-purple-500 shadow-md',
      },
    };

    const colors = colorMap[color] || colorMap.blue;
    return isSelected
      ? `${colors.selected}`
      : `${colors.bg} ${colors.border} ${colors.hover}`;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Workflows</h2>
        <p className="text-xs text-gray-600 mt-1">Select documentation type</p>
      </div>

      {/* Workflow Options */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {workflowOptions.map((workflow) => {
          const isSelected = selectedWorkflow === workflow.type;

          return (
            <button
              key={workflow.type}
              onClick={() => onSelectWorkflow(workflow.type)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${getColorClasses(
                workflow.color,
                isSelected
              )}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{workflow.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">
                    {workflow.name}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {workflow.description}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-700">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Active
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          <p className="font-semibold mb-1">Quick Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Select workflow first</li>
            <li>Click mic to record</li>
            <li>Speak clearly</li>
            <li>Review before submit</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
