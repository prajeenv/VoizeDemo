/**
 * Recent Entries Panel Component
 * Displays recent documentation entries with quick view/edit capability
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import type { DocumentationEntry, DocumentationStatus } from '../../../shared/types';

const getStatusColor = (status: DocumentationStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'sent_to_ehr':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusIcon = (status: DocumentationStatus) => {
  switch (status) {
    case 'draft':
      return '📝';
    case 'completed':
      return '✓';
    case 'sent_to_ehr':
      return '📤';
    default:
      return '•';
  }
};

const getStatusLabel = (status: DocumentationStatus) => {
  switch (status) {
    case 'draft':
      return 'Draft';
    case 'completed':
      return 'Completed';
    case 'sent_to_ehr':
      return 'Sent to EHR';
    default:
      return status;
  }
};

const getWorkflowIcon = (workflowType: string) => {
  const iconMap: Record<string, string> = {
    'vital-signs': '❤️',
    'patient-assessment': '👤',
    'medication-administration': '💊',
    'wound-care': '🩹',
    'shift-handoff': '🔄',
  };
  return iconMap[workflowType] || '📄';
};

const getWorkflowName = (workflowType: string) => {
  return workflowType
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface RecentEntriesPanelProps {
  onViewEntry?: (entry: DocumentationEntry) => void;
}

export const RecentEntriesPanel: React.FC<RecentEntriesPanelProps> = ({ onViewEntry }) => {
  const { getRecentEntries, sendToEHR } = useApp();
  const recentEntries = getRecentEntries(5);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSendToEHR = (entry: DocumentationEntry) => {
    if (entry.status === 'sent_to_ehr') return;

    if (confirm(`Send this ${getWorkflowName(entry.workflowType)} entry to EHR?`)) {
      sendToEHR(entry.id);
    }
  };

  if (recentEntries.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Recent Entries</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-600">No entries yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Complete a workflow to see it here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Recent Entries</h3>
        <p className="text-xs text-gray-600 mt-1">
          Last {recentEntries.length} documentation entries
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {recentEntries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Workflow Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getWorkflowIcon(entry.workflowType)}
                </div>

                {/* Entry Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">
                      {getWorkflowName(entry.workflowType)}
                    </h4>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                        entry.status
                      )}`}
                    >
                      <span>{getStatusIcon(entry.status)}</span>
                      {getStatusLabel(entry.status)}
                    </span>
                  </div>

                  {entry.patientName && (
                    <p className="text-xs text-gray-600 mb-1">
                      Patient: {entry.patientName}
                      {entry.patientMRN && ` (${entry.patientMRN})`}
                    </p>
                  )}

                  <p className="text-xs text-gray-500">
                    {formatTime(entry.timestamp)} • {entry.nurseName || 'Unknown'}
                  </p>

                  {/* Transcript Preview */}
                  {entry.voiceTranscript && (
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                      "{entry.voiceTranscript.substring(0, 80)}
                      {entry.voiceTranscript.length > 80 ? '...' : ''}"
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-1 flex-shrink-0">
                {onViewEntry && (
                  <button
                    onClick={() => onViewEntry(entry)}
                    className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 transition-colors"
                    title="View entry"
                  >
                    View
                  </button>
                )}

                {entry.status !== 'sent_to_ehr' && (
                  <button
                    onClick={() => handleSendToEHR(entry)}
                    className="px-2 py-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 rounded border border-green-200 transition-colors"
                    title="Send to EHR"
                  >
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
