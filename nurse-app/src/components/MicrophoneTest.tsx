/**
 * Microphone Permission Test Component
 * Helps diagnose microphone and Web Speech API permission issues
 */

import React, { useState } from 'react';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'running';
  message: string;
  details?: string;
}

export const MicrophoneTest: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateResult = (name: string, status: TestResult['status'], message: string, details?: string) => {
    setResults(prev => {
      const existing = prev.findIndex(r => r.name === name);
      const newResult = { name, status, message, details };
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newResult;
        return updated;
      }
      return [...prev, newResult];
    });
  };

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Check if Web Speech API is available
    updateResult('Web Speech API', 'running', 'Checking...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      updateResult('Web Speech API', 'success', 'Web Speech API is available',
        `Found: ${(window as any).SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition'}`);
    } else {
      updateResult('Web Speech API', 'error', 'Web Speech API not supported',
        'This browser does not support the Web Speech API. Try Chrome, Edge, or Safari.');
      setIsRunning(false);
      return;
    }

    // Test 2: Check MediaDevices API
    updateResult('MediaDevices API', 'running', 'Checking...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const hasMediaDevices = !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
    if (hasMediaDevices) {
      updateResult('MediaDevices API', 'success', 'MediaDevices API is available');
    } else {
      updateResult('MediaDevices API', 'error', 'MediaDevices API not available',
        'This might indicate HTTPS is required or the browser is too old.');
    }

    // Test 3: Check HTTPS/localhost
    updateResult('Secure Context', 'running', 'Checking...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const isSecure = window.isSecureContext;
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    if (isSecure) {
      updateResult('Secure Context', 'success', 'Running in secure context',
        `Protocol: ${protocol}, Host: ${hostname}`);
    } else {
      updateResult('Secure Context', 'error', 'Not in secure context',
        'Web APIs require HTTPS in production (localhost/127.0.0.1 work with HTTP)');
    }

    // Test 4: Request microphone permission via MediaDevices
    updateResult('Microphone Permission', 'running', 'Requesting permission...');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      updateResult('Microphone Permission', 'success', 'Microphone permission granted',
        `Tracks: ${stream.getTracks().length}, Active: ${stream.active}`);
      // Stop all tracks immediately
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      updateResult('Microphone Permission', 'error', 'Microphone permission denied or unavailable',
        `Error: ${err.name} - ${err.message}`);
    }

    // Test 5: Initialize Speech Recognition
    updateResult('Speech Recognition Init', 'running', 'Initializing...');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      updateResult('Speech Recognition Init', 'success', 'Speech Recognition initialized successfully');

      // Test 6: Try to start and immediately stop
      updateResult('Speech Recognition Start', 'running', 'Attempting to start...');

      let started = false;
      let errorOccurred = false;

      recognition.onstart = () => {
        started = true;
        updateResult('Speech Recognition Start', 'success', 'Speech Recognition started successfully',
          'Recognition engine is working. You can use voice recording!');
        recognition.stop();
      };

      recognition.onerror = (event: any) => {
        errorOccurred = true;
        let errorDetail = `Error type: ${event.error}`;

        switch (event.error) {
          case 'not-allowed':
          case 'permission-denied':
            errorDetail += ' - Microphone permission was denied. Click the camera/microphone icon in your browser\'s address bar and allow access.';
            break;
          case 'no-speech':
            errorDetail += ' - No speech detected (this is OK for a test)';
            break;
          case 'audio-capture':
            errorDetail += ' - No microphone found or microphone is in use by another application';
            break;
          case 'network':
            errorDetail += ' - Network error (Speech Recognition requires internet connection)';
            break;
        }

        updateResult('Speech Recognition Start', 'error', `Failed to start: ${event.error}`, errorDetail);
      };

      recognition.onend = () => {
        if (!started && !errorOccurred) {
          updateResult('Speech Recognition Start', 'error', 'Recognition ended before starting',
            'This might indicate a permission issue or the microphone is in use.');
        }
        setIsRunning(false);
      };

      // Start recognition
      recognition.start();

    } catch (err: any) {
      updateResult('Speech Recognition Init', 'error', 'Failed to initialize Speech Recognition',
        `Error: ${err.name} - ${err.message}`);
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'running':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'running':
        return '⟳';
      default:
        return '○';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Microphone & Speech API Diagnostics</h2>
        <p className="text-gray-600 mb-6">
          This test will check your browser's compatibility and microphone permissions.
        </p>

        <button
          onClick={runTests}
          disabled={isRunning}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isRunning ? 'Running Tests...' : 'Run Diagnostic Tests'}
        </button>

        {results.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-lg font-semibold text-gray-800">Test Results:</h3>
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl font-bold flex-shrink-0">
                    {getStatusIcon(result.status)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1">{result.name}</h4>
                    <p className="text-sm mb-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs opacity-90 mt-2 font-mono bg-white/50 p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-blue-900 font-semibold mb-2">Common Issues:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>If microphone permission is denied, click the camera icon in your address bar and allow access</li>
            <li>Make sure no other application is using your microphone</li>
            <li>Try refreshing the page after granting permissions</li>
            <li>Production sites must use HTTPS (development works on localhost)</li>
            <li>Web Speech API requires an internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MicrophoneTest;
