/**
 * Workflow Container Component
 * Integrates voice recording with workflow forms
 */

import React, { useState } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { WorkflowSelector, type WorkflowType } from './WorkflowSelector';
import { PatientAssessment } from '../workflows/PatientAssessment';
import { VitalSigns } from '../workflows/VitalSigns';
import { MedicationAdministration } from '../workflows/MedicationAdministration';
import { WoundCare } from '../workflows/WoundCare';
import { ShiftHandoff } from '../workflows/ShiftHandoff';

export const WorkflowContainer: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null);
  const [submittedData, setSubmittedData] = useState<any[]>([]);

  const {
    isRecording,
    isPaused,
    currentTranscript,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
    error,
    isSupported,
  } = useVoiceRecording({
    continuous: true,
    interimResults: true,
    enableMedicalProcessing: true,
  });

  const handleWorkflowSubmit = (data: any) => {
    console.log('Workflow submitted:', data);
    setSubmittedData((prev) => [...prev, data]);

    // Clear transcript and stop recording
    stopRecording();
    clearTranscript();

    // Show success message
    alert(`${data.workflowType} documentation submitted successfully!`);

    // Return to workflow selector
    setSelectedWorkflow(null);
  };

  const handleWorkflowCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    clearTranscript();
    setSelectedWorkflow(null);
  };

  const handleSelectWorkflow = (workflowType: WorkflowType) => {
    // Clear any existing transcript when switching workflows
    if (currentTranscript) {
      clearTranscript();
    }
    if (isRecording) {
      stopRecording();
    }
    setSelectedWorkflow(workflowType);
  };

  const renderWorkflowForm = () => {
    if (!selectedWorkflow) return null;

    const commonProps = {
      transcript: currentTranscript,
      isRecording,
      onSubmit: handleWorkflowSubmit,
      onCancel: handleWorkflowCancel,
    };

    switch (selectedWorkflow) {
      case 'patient-assessment':
        return <PatientAssessment {...commonProps} />;
      case 'vital-signs':
        return <VitalSigns {...commonProps} />;
      case 'medication-administration':
        return <MedicationAdministration {...commonProps} />;
      case 'wound-care':
        return <WoundCare {...commonProps} />;
      case 'shift-handoff':
        return <ShiftHandoff {...commonProps} />;
      default:
        return null;
    }
  };

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 border border-red-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-red-900 mb-3">Browser Not Supported</h2>
          <p className="text-red-800 mb-4">
            Your browser does not support the Web Speech API required for voice recording.
          </p>
          <p className="text-red-700">
            Please use a supported browser:
            <ul className="list-disc ml-6 mt-2">
              <li>Google Chrome (recommended)</li>
              <li>Microsoft Edge</li>
              <li>Safari 14.1+</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Voize Nurse Documentation</h1>
              <p className="text-gray-600 mt-2">Voice-powered nursing workflow assistant</p>
            </div>
            {selectedWorkflow && (
              <button
                onClick={handleWorkflowCancel}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                ← Back to Workflows
              </button>
            )}
          </div>
        </header>

        {/* Voice Recording Controls */}
        {selectedWorkflow && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Voice Recording</h3>
                {isRecording && (
                  <span className="flex items-center gap-2 text-red-600 font-medium">
                    <span className="animate-pulse">●</span> Recording
                  </span>
                )}
                {isPaused && (
                  <span className="text-yellow-600 font-medium">⏸ Paused</span>
                )}
              </div>

              <div className="flex gap-2">
                {!isRecording && !isPaused && (
                  <button
                    onClick={startRecording}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <span>🎤</span> Start Recording
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
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                    >
                      ⏹ Stop
                    </button>
                  </>
                )}

                {currentTranscript && (
                  <button
                    onClick={clearTranscript}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded text-red-800">
                <strong>Error:</strong> {error.message}
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <main>
          {!selectedWorkflow ? (
            <WorkflowSelector
              onSelectWorkflow={handleSelectWorkflow}
              currentWorkflow={selectedWorkflow}
            />
          ) : (
            renderWorkflowForm()
          )}
        </main>

        {/* Submitted Data Display (for demo purposes) */}
        {submittedData.length > 0 && !selectedWorkflow && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Submitted Documentation ({submittedData.length})
            </h3>
            <div className="space-y-4">
              {submittedData.map((data, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800">
                      {data.workflowType?.replace(/-/g, ' ').toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {new Date(data.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto bg-white p-3 rounded border border-gray-200">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowContainer;
