/**
 * Main Workspace Component
 * Displays selected workflow with integrated voice recording controls
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import type { WorkflowType } from './WorkflowSelector';
import { PatientAssessment } from '../workflows/PatientAssessment';
import { VitalSigns } from '../workflows/VitalSigns';
import { MedicationAdministration } from '../workflows/MedicationAdministration';
import { WoundCare } from '../workflows/WoundCare';
import { ShiftHandoff } from '../workflows/ShiftHandoff';
import { PatientSelector } from './PatientSelector';
import type { DocumentationEntry } from '../../../shared/types';

interface MainWorkspaceProps {
  selectedWorkflow: WorkflowType | null;
  onWorkflowComplete: () => void;
}

export const MainWorkspace: React.FC<MainWorkspaceProps> = ({
  selectedWorkflow,
  onWorkflowComplete,
}) => {
  const { currentNurse, selectedPatient, addEntry } = useApp();
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // Workflow-specific transcript storage
  const [workflowTranscripts, setWorkflowTranscripts] = useState<Record<string, string>>({
    'patient-assessment': '',
    'vital-signs': '',
    'medication-administration': '',
    'wound-care': '',
    'shift-handoff': ''
  });

  // Track which workflow is currently active
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowType | null>(null);

  const {
    isRecording,
    isPaused,
    isProcessing,
    currentTranscript,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
    error,
  } = useVoiceRecording({
    continuous: true,
    interimResults: true,
    enableMedicalProcessing: true,
  });

  // Update editable transcript when voice transcript changes
  useEffect(() => {
    if (!isEditingTranscript) {
      setEditableTranscript(currentTranscript);
    }
  }, [currentTranscript, isEditingTranscript]);

  // Save transcript when switching workflows
  useEffect(() => {
    if (activeWorkflow && currentTranscript) {
      setWorkflowTranscripts(prev => ({
        ...prev,
        [activeWorkflow]: currentTranscript
      }));
    }
  }, [currentTranscript, activeWorkflow]);

  // Key to force remount workflow components when needed
  const [workflowKey, setWorkflowKey] = useState(0);

  // Handle workflow switching - always start fresh
  useEffect(() => {
    if (selectedWorkflow !== activeWorkflow) {
      // Clear current recording
      clearTranscript();
      setEditableTranscript('');

      // Clear any stored transcript for the selected workflow to ensure fresh start
      if (selectedWorkflow) {
        setWorkflowTranscripts(prev => ({
          ...prev,
          [selectedWorkflow]: ''
        }));
      }

      // Force remount of workflow component to reset form state
      setWorkflowKey(prev => prev + 1);

      setActiveWorkflow(selectedWorkflow);
    }
  }, [selectedWorkflow, activeWorkflow, clearTranscript]);

  const handleWorkflowSubmit = (data: any) => {
    // Ensure patient is selected
    if (!selectedPatient) {
      alert('Please select a patient before submitting.');
      return;
    }

    // Create documentation entry
    const entry: DocumentationEntry = {
      id: `entry-${Date.now()}`,
      timestamp: new Date().toISOString(),
      nurseId: currentNurse.id,
      nurseName: currentNurse.name,
      patientId: selectedPatient.id,
      patientMRN: selectedPatient.mrn,
      patientName: selectedPatient.name,
      workflowType: selectedWorkflow!,
      voiceTranscript: editableTranscript,
      structuredData: data.structuredData || data,
      status: 'completed',
      lastModified: new Date().toISOString(),
    };

    // Add to state
    addEntry(entry);

    // Clear transcript and stop recording
    stopRecording();
    clearTranscript();
    setEditableTranscript('');
    setIsEditingTranscript(false);

    // Notify parent
    onWorkflowComplete();
  };

  const handleWorkflowCancel = () => {
    if (isRecording) {
      stopRecording();
    }

    // Clear workflow-specific transcript
    if (selectedWorkflow) {
      setWorkflowTranscripts(prev => ({
        ...prev,
        [selectedWorkflow]: ''
      }));
    }

    clearTranscript();
    setEditableTranscript('');
    setIsEditingTranscript(false);
    onWorkflowComplete();
  };

  const handleClearAll = () => {
    if (confirm('Clear all data and transcript?')) {
      stopRecording();
      clearTranscript();
      setEditableTranscript('');
      setIsEditingTranscript(false);

      // Clear stored workflow transcript
      if (selectedWorkflow) {
        setWorkflowTranscripts(prev => ({
          ...prev,
          [selectedWorkflow]: ''
        }));
      }

      // Force remount of workflow component to reset form state
      setWorkflowKey(prev => prev + 1);
    }
  };

  const renderWorkflowForm = () => {
    if (!selectedWorkflow) return null;

    // Use editable transcript for the form
    const transcriptToUse = editableTranscript || currentTranscript;

    const commonProps = {
      transcript: transcriptToUse,
      isRecording,
      onSubmit: handleWorkflowSubmit,
      onCancel: handleWorkflowCancel,
    };

    switch (selectedWorkflow) {
      case 'patient-assessment':
        return <PatientAssessment key={workflowKey} {...commonProps} />;
      case 'vital-signs':
        return <VitalSigns key={workflowKey} {...commonProps} />;
      case 'medication-administration':
        return <MedicationAdministration key={workflowKey} {...commonProps} />;
      case 'wound-care':
        return <WoundCare key={workflowKey} {...commonProps} />;
      case 'shift-handoff':
        return <ShiftHandoff key={workflowKey} {...commonProps} />;
      default:
        return null;
    }
  };

  if (!selectedWorkflow) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">👈</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Select a Workflow to Begin
          </h3>
          <p className="text-gray-600">
            Choose a documentation type from the sidebar to start recording your notes
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold">Step 1</div>
              <div className="text-xs">Select workflow</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold">Step 2</div>
              <div className="text-xs">Click microphone</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold">Step 3</div>
              <div className="text-xs">Speak clearly</div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="font-semibold">Step 4</div>
              <div className="text-xs">Review & submit</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Patient Selector */}
      <PatientSelector />

      {/* Voice Controls Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="p-4">
          {/* Main Recording Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold text-gray-900">Voice Recording</h3>
              {isRecording && (
                <span className="flex items-center gap-2 text-red-600 font-medium animate-pulse">
                  <span className="w-3 h-3 bg-red-600 rounded-full"></span>
                  Recording...
                </span>
              )}
              {isPaused && (
                <span className="flex items-center gap-2 text-yellow-600 font-medium">
                  <span className="w-3 h-3 bg-yellow-600 rounded-full"></span>
                  Paused
                </span>
              )}
              {isProcessing && (
                <span className="flex items-center gap-2 text-blue-600 font-medium">
                  <span className="animate-spin">⟳</span> Processing...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {!isRecording && !isPaused && (
                <button
                  onClick={startRecording}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Start Recording
                </button>
              )}

              {isRecording && (
                <>
                  <button
                    onClick={pauseRecording}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
                  >
                    ⏸ Pause
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                  >
                    ⏹ Stop
                  </button>
                </>
              )}

              {isPaused && (
                <>
                  <button
                    onClick={resumeRecording}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                  >
                    ▶ Resume
                  </button>
                  <button
                    onClick={stopRecording}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                  >
                    ⏹ Stop
                  </button>
                </>
              )}

              {(currentTranscript || editableTranscript) && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-red-600 text-lg">⚠️</span>
                <div className="flex-1">
                  <div className="font-semibold text-red-900">Error</div>
                  <div className="text-sm text-red-800">{error.message}</div>
                </div>
              </div>
            </div>
          )}

          {/* Transcript Display */}
          {(currentTranscript || editableTranscript) && (
            <div className="bg-gray-50 border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">Voice Transcript</h4>
                <button
                  onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {isEditingTranscript ? '✓ Done Editing' : '✏️ Edit Transcript'}
                </button>
              </div>

              {isEditingTranscript ? (
                <textarea
                  value={editableTranscript}
                  onChange={(e) => setEditableTranscript(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={4}
                  placeholder="Edit your transcript here..."
                />
              ) : (
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {editableTranscript || currentTranscript || 'No transcript yet...'}
                </p>
              )}

              <div className="mt-2 text-xs text-gray-600">
                {editableTranscript.length || currentTranscript.length} characters
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Form */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderWorkflowForm()}
      </div>
    </div>
  );
};
