/**
 * Voice Recording Demo Component
 * Demonstrates the useVoiceRecording hook with all features
 */

import React, { useEffect, useState } from 'react';
import { useVoiceRecording } from '../hooks/useVoiceRecording';
import { performCompatibilityCheck } from '../utils/browserCompatibility';

interface CompatibilityInfo {
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  browserName: string;
  browserVersion: string;
}

export const VoiceRecordingDemo: React.FC = () => {
  const [compatibility, setCompatibility] = useState<CompatibilityInfo | null>(null);
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState(true);

  const {
    isRecording,
    isPaused,
    currentTranscript,
    finalTranscript,
    interimTranscript,
    error,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
    resetError,
  } = useVoiceRecording({
    continuous: true,
    interimResults: true,
    language: 'en-US',
    onTranscriptChange: (transcript, isFinal) => {
      console.log('Transcript update:', { transcript, isFinal });
    },
    onError: (error) => {
      console.error('Voice recording error:', error);
    },
    onStart: () => {
      console.log('Recording started');
    },
    onEnd: () => {
      console.log('Recording ended');
    },
  });

  useEffect(() => {
    const checkCompat = async () => {
      const result = await performCompatibilityCheck();
      setCompatibility({
        isCompatible: result.isCompatible,
        issues: result.issues,
        warnings: result.warnings,
        browserName: result.browserInfo.name,
        browserVersion: result.browserInfo.version,
      });
      setIsCheckingCompatibility(false);
    };

    checkCompat();
  }, []);

  const handleStartRecording = async () => {
    resetError();
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  const handlePauseRecording = () => {
    pauseRecording();
  };

  const handleResumeRecording = async () => {
    await resumeRecording();
  };

  const handleClearTranscript = () => {
    clearTranscript();
  };

  if (isCheckingCompatibility) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-700">Checking browser compatibility...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Voice Recording Demo</h2>
        <p className="text-gray-600 mb-2">
          Test the Web Speech API voice-to-text functionality
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Browser:</span>
          <span className="font-medium text-gray-700">
            {compatibility?.browserName} {compatibility?.browserVersion}
          </span>
        </div>
      </div>

      {compatibility && !compatibility.isCompatible && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Compatibility Issues</h3>
          <ul className="list-disc list-inside space-y-1">
            {compatibility.issues.map((issue, index) => (
              <li key={index} className="text-red-700 text-sm">
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {compatibility && compatibility.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-yellow-800 font-semibold mb-2">Warnings</h3>
          <ul className="list-disc list-inside space-y-1">
            {compatibility.warnings.map((warning, index) => (
              <li key={index} className="text-yellow-700 text-sm">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-700 text-sm mb-2">{error.message}</p>
          <button
            onClick={resetError}
            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Controls</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStartRecording}
            disabled={!isSupported || isRecording || isPaused}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              isRecording || isPaused
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            Start Recording
          </button>

          <button
            onClick={handlePauseRecording}
            disabled={!isRecording || isPaused}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !isRecording || isPaused
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            Pause
          </button>

          <button
            onClick={handleResumeRecording}
            disabled={!isPaused}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !isPaused
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Resume
          </button>

          <button
            onClick={handleStopRecording}
            disabled={!isRecording && !isPaused}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !isRecording && !isPaused
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            Stop
          </button>

          <button
            onClick={handleClearTranscript}
            disabled={!currentTranscript}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              !currentTranscript
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            Clear
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'
              }`}
            ></div>
            <span className="text-gray-700">
              {isRecording ? 'Recording' : isPaused ? 'Paused' : 'Stopped'}
            </span>
          </div>
          <div className="text-gray-500">
            Supported: {isSupported ? '✓' : '✗'}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Transcript</h3>
        <div className="bg-gray-50 border border-gray-200 rounded p-4 min-h-[150px]">
          {currentTranscript ? (
            <p className="text-gray-800 whitespace-pre-wrap">{currentTranscript}</p>
          ) : (
            <p className="text-gray-400 italic">
              Start recording to see transcription...
            </p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Final Transcript</h3>
          <div className="bg-green-50 border border-green-200 rounded p-4 min-h-[100px]">
            {finalTranscript ? (
              <p className="text-gray-800 whitespace-pre-wrap">{finalTranscript}</p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                Finalized text will appear here...
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Interim Transcript</h3>
          <div className="bg-blue-50 border border-blue-200 rounded p-4 min-h-[100px]">
            {interimTranscript ? (
              <p className="text-gray-700 italic whitespace-pre-wrap">
                {interimTranscript}
              </p>
            ) : (
              <p className="text-gray-400 italic text-sm">
                Real-time transcription will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Usage Instructions</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">1.</span>
            <span>Click "Start Recording" and allow microphone access when prompted</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">2.</span>
            <span>Speak clearly into your microphone</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">3.</span>
            <span>Watch the transcript appear in real-time</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">4.</span>
            <span>Use "Pause" to temporarily stop recording (transcript is preserved)</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">5.</span>
            <span>Use "Resume" to continue recording</span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-600 font-bold mr-2">6.</span>
            <span>Click "Stop" when finished</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceRecordingDemo;
