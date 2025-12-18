/**
 * Parser Demo Component
 * Interactive demo for testing the intelligent transcript parser
 */

import React, { useState } from 'react';
import { parseTranscript } from '../services/parseService';
import type { WorkflowType } from '../../../shared/types';

// Example transcripts for testing
const EXAMPLE_TRANSCRIPTS: Record<WorkflowType, string[]> = {
  'vital-signs': [
    'BP one twenty over eighty, heart rate seventy two, temp ninety eight point six, oxygen sat ninety eight percent',
    'Blood pressure 135/85, pulse 88 bpm, respiratory rate 16, temperature 99.2 degrees',
    'Vitals: BP 118/76, HR 65, RR 14, SpO2 97%, temp 98.4, pain level 3 out of 10',
  ],
  'medication-administration': [
    'Gave patient Smith ten milligrams of morphine IV at fourteen thirty',
    'Administered 500mg of Tylenol PO to patient Jones at 10:30 AM',
    'Patient received 10 units of insulin subcutaneous at lunch time',
  ],
  'patient-assessment': [
    'Patient alert and oriented times three, ambulatory with assistance, pain level five out of ten',
    'Patient confused, bedbound, requires assistance with all activities of daily living',
    'Alert patient, oriented to person place and time, walking independently',
  ],
  'wound-care': [],
  'shift-handoff': [],
  'admission': [],
  'discharge': [],
  'general-note': [],
};

export default function ParserDemo() {
  const [workflowType, setWorkflowType] = useState<WorkflowType>('vital-signs');
  const [transcript, setTranscript] = useState(EXAMPLE_TRANSCRIPTS['vital-signs'][0]);
  const [parseResult, setParseResult] = useState<any>(null);

  const handleParse = () => {
    const result = parseTranscript(transcript, workflowType);
    setParseResult(result);
  };

  const loadExample = (index: number) => {
    const examples = EXAMPLE_TRANSCRIPTS[workflowType];
    if (examples && examples[index]) {
      setTranscript(examples[index]);
      setParseResult(null);
    }
  };

  const handleWorkflowChange = (newWorkflow: WorkflowType) => {
    setWorkflowType(newWorkflow);
    const examples = EXAMPLE_TRANSCRIPTS[newWorkflow];
    if (examples && examples.length > 0) {
      setTranscript(examples[0]);
    } else {
      setTranscript('');
    }
    setParseResult(null);
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Intelligent Parser Demo
            </h1>
            <p className="text-gray-600">
              Test the voice transcript parser with different workflow types and see how it extracts structured data
            </p>
          </div>

          {/* Workflow Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow Type
            </label>
            <select
              value={workflowType}
              onChange={(e) => handleWorkflowChange(e.target.value as WorkflowType)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vital-signs">Vital Signs</option>
              <option value="medication-administration">Medication Administration</option>
              <option value="patient-assessment">Patient Assessment</option>
              <option value="wound-care">Wound Care</option>
              <option value="shift-handoff">Shift Handoff</option>
              <option value="admission">Admission</option>
              <option value="discharge">Discharge</option>
              <option value="general-note">General Note</option>
            </select>
          </div>

          {/* Example Buttons */}
          {EXAMPLE_TRANSCRIPTS[workflowType].length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Load Example
              </label>
              <div className="flex gap-2">
                {EXAMPLE_TRANSCRIPTS[workflowType].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => loadExample(index)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Example {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Transcript
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={4}
              placeholder="Enter a voice transcript to parse..."
              className="block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Parse Button */}
          <button
            onClick={handleParse}
            disabled={!transcript.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors mb-6"
          >
            Parse Transcript
          </button>

          {/* Results */}
          {parseResult && (
            <div className="space-y-6">
              {/* Structured Data */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">📊</span>
                  Structured Data
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <pre className="text-sm overflow-x-auto">
                    {JSON.stringify(parseResult.structuredData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Confidence Scores */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Confidence Scores
                </h2>
                {Object.keys(parseResult.confidence).length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(parseResult.confidence).map(([field, confidence]: [string, any]) => (
                        <div key={field} className="flex items-center justify-between bg-white p-3 rounded border">
                          <span className="font-medium text-gray-700">{field}</span>
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getConfidenceColor(confidence)}`}>
                              {(confidence * 100).toFixed(0)}%
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                              confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {getConfidenceLabel(confidence)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-gray-500">
                    No confidence scores available
                  </div>
                )}
              </div>

              {/* Needs Review */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">⚠️</span>
                  Needs Review
                </h2>
                {parseResult.needsReview.length > 0 ? (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <ul className="space-y-2">
                      {parseResult.needsReview.map((field: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">▸</span>
                          <span className="text-yellow-800 font-medium">{field}</span>
                          <span className="text-yellow-600 text-sm ml-auto">
                            Low confidence - manual verification recommended
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-700 flex items-center gap-2">
                      <span className="text-xl">✓</span>
                      All extracted fields have sufficient confidence
                    </p>
                  </div>
                )}
              </div>

              {/* Visual Summary */}
              {parseResult.structuredData.vitalSigns && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💊</span>
                    Vital Signs Summary
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {parseResult.structuredData.vitalSigns.bloodPressure && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="text-sm text-blue-600 mb-1">Blood Pressure</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {parseResult.structuredData.vitalSigns.bloodPressure}
                        </div>
                        <div className="text-xs text-blue-500 mt-1">mmHg</div>
                      </div>
                    )}
                    {parseResult.structuredData.vitalSigns.heartRate && (
                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <div className="text-sm text-red-600 mb-1">Heart Rate</div>
                        <div className="text-2xl font-bold text-red-900">
                          {parseResult.structuredData.vitalSigns.heartRate}
                        </div>
                        <div className="text-xs text-red-500 mt-1">bpm</div>
                      </div>
                    )}
                    {parseResult.structuredData.vitalSigns.temperature && (
                      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                        <div className="text-sm text-orange-600 mb-1">Temperature</div>
                        <div className="text-2xl font-bold text-orange-900">
                          {parseResult.structuredData.vitalSigns.temperature}°F
                        </div>
                      </div>
                    )}
                    {parseResult.structuredData.vitalSigns.oxygenSaturation && (
                      <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                        <div className="text-sm text-teal-600 mb-1">O₂ Saturation</div>
                        <div className="text-2xl font-bold text-teal-900">
                          {parseResult.structuredData.vitalSigns.oxygenSaturation}%
                        </div>
                      </div>
                    )}
                    {parseResult.structuredData.vitalSigns.respiratoryRate && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="text-sm text-purple-600 mb-1">Respiratory Rate</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {parseResult.structuredData.vitalSigns.respiratoryRate}
                        </div>
                        <div className="text-xs text-purple-500 mt-1">breaths/min</div>
                      </div>
                    )}
                    {parseResult.structuredData.vitalSigns.painLevel !== undefined && (
                      <div className="bg-pink-50 rounded-lg p-4 border border-pink-200">
                        <div className="text-sm text-pink-600 mb-1">Pain Level</div>
                        <div className="text-2xl font-bold text-pink-900">
                          {parseResult.structuredData.vitalSigns.painLevel}/10
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Medications Summary */}
              {parseResult.structuredData.medications && parseResult.structuredData.medications.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">💉</span>
                    Medications Administered
                  </h2>
                  <div className="space-y-3">
                    {parseResult.structuredData.medications.map((med: any, index: number) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-lg font-bold text-purple-900">{med.name}</div>
                            <div className="text-sm text-purple-700 mt-1">
                              {med.dose} {med.route && `• ${med.route}`} {med.timeAdministered && `• ${new Date(med.timeAdministered).toLocaleTimeString()}`}
                            </div>
                          </div>
                          {!med.route && (
                            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                              Route Missing
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assessment Summary */}
              {parseResult.structuredData.assessment && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">🏥</span>
                    Patient Assessment
                  </h2>
                  <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                    {parseResult.structuredData.assessment.levelOfConsciousness && (
                      <div className="mb-2">
                        <span className="font-medium text-indigo-900">Consciousness: </span>
                        <span className="text-indigo-700">{parseResult.structuredData.assessment.levelOfConsciousness}</span>
                      </div>
                    )}
                    {parseResult.structuredData.assessment.orientation && (
                      <div className="mb-2">
                        <span className="font-medium text-indigo-900">Orientation: </span>
                        <span className="text-indigo-700">{parseResult.structuredData.assessment.orientation}</span>
                      </div>
                    )}
                    {parseResult.structuredData.assessment.musculoskeletal?.mobility && (
                      <div>
                        <span className="font-medium text-indigo-900">Mobility: </span>
                        <span className="text-indigo-700">{parseResult.structuredData.assessment.musculoskeletal.mobility}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Test Cases Reference */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Parser Capabilities</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Vital Signs Patterns:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>"BP one twenty over eighty" → 120/80</li>
                <li>"temp ninety eight point six" → 98.6°F</li>
                <li>"pulse seventy two" → 72 bpm</li>
                <li>"oxygen sat ninety eight percent" → 98%</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Medication Patterns:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>"gave patient Smith ten milligrams of morphine IV"</li>
                <li>"administered 500mg of Tylenol PO at 10:30"</li>
                <li>"patient received 10 units of insulin subcutaneous"</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Assessment Patterns:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-2">
                <li>"patient alert and oriented times three"</li>
                <li>"patient ambulatory with assistance"</li>
                <li>"pain level five out of ten"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
