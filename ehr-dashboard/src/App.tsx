import { useState, useEffect, useCallback } from 'react';
import type { Patient, DocumentationEntry } from '../../shared/types';
import { mockPatients, mockDocumentationEntries } from './data/mockPatients';
import { toFHIRFormat, toHL7Format, toCSVFormat, downloadAsFile } from './utils/exportFormats';
import * as storageService from '../../shared/services/storageService';
import { getCompleteDemoData } from '../../shared/mockData';

type ExportFormat = 'human' | 'fhir' | 'hl7' | 'csv';

function App() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0]);
  const [allEntries, setAllEntries] = useState<DocumentationEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DocumentationEntry | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('human');
  const [newEntryNotification, setNewEntryNotification] = useState<DocumentationEntry | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Get current time for header
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate unread counts for each patient
  const calculateUnreadCounts = useCallback((entries: DocumentationEntry[]) => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const counts: Record<string, number> = {};

    patients.forEach((patient) => {
      counts[patient.id] = entries.filter(
        (entry) =>
          entry.patientId === patient.id && new Date(entry.timestamp) > twoHoursAgo
      ).length;
    });

    setUnreadCounts(counts);
  }, [patients]);

  // Load all entries from storageService on mount
  useEffect(() => {
    console.log('🔊 EHR Dashboard: Loading entries from storageService');
    const result = storageService.getAllEHREntries();

    if (result.success && result.data && result.data.length > 0) {
      console.log('✅ Loaded', result.data.length, 'entries from storage');
      setAllEntries(result.data);
    } else {
      console.log('📦 Loading demo data from mockData service');
      // Try to load demo data from localStorage first
      const demoNotesJson = localStorage.getItem('voize_demo_notes');

      if (demoNotesJson) {
        try {
          const demoNotes = JSON.parse(demoNotesJson);
          // Convert to DocumentationEntry format
          const convertedEntries: DocumentationEntry[] = demoNotes.map((note: any) => ({
            id: note.id,
            timestamp: note.timestamp,
            nurseId: note.nurseName.toLowerCase().replace(/\s+/g, '-'),
            nurseName: note.nurseName,
            patientId: note.patientId,
            patientMRN: note.patientId,
            patientName: patients.find(p => p.mrn === note.patientId)?.name || 'Unknown',
            workflowType: note.workflowType,
            voiceTranscript: note.rawTranscript,
            structuredData: note.structuredData || {},
            status: 'sent_to_ehr',
            sentToEHRAt: note.updatedAt,
            transcriptConfidence: note.confidence
          }));
          console.log('✅ Loaded', convertedEntries.length, 'demo entries from localStorage');
          setAllEntries(convertedEntries);
        } catch (error) {
          console.error('❌ Failed to parse demo notes:', error);
          setAllEntries(mockDocumentationEntries);
        }
      } else {
        // Fall back to default mock data
        console.log('📋 Using default mock documentation entries');
        setAllEntries(mockDocumentationEntries);
      }
    }
  }, [patients]);

  useEffect(() => {
    calculateUnreadCounts(allEntries);
  }, [allEntries, calculateUnreadCounts]);

  // Subscribe to new entries from Nurse App via storageService
  useEffect(() => {
    console.log('🔊 EHR Dashboard: Subscribing to new entries');

    const unsubscribe = storageService.subscribeToNewEntries((newEntry) => {
      console.log('📥 New entry received:', newEntry);

      // Add to entries
      setAllEntries((prev) => {
        // Avoid duplicates
        if (prev.some((e) => e.id === newEntry.id)) {
          console.log('⚠️ Duplicate entry detected, skipping');
          return prev;
        }
        console.log('✅ Adding new entry to list');
        return [newEntry, ...prev];
      });

      // Show notification
      setNewEntryNotification(newEntry);
      setTimeout(() => setNewEntryNotification(null), 5000);
    });

    console.log('✅ Subscription active');

    return () => {
      unsubscribe();
      console.log('🔇 Unsubscribed from new entries');
    };
  }, []);

  // Get entries for selected patient
  const patientEntries = selectedPatient
    ? allEntries.filter((entry) => entry.patientId === selectedPatient.id)
    : [];

  // Get workflow type color
  const getWorkflowColor = (workflowType: string): string => {
    const colors: Record<string, string> = {
      'vital-signs': 'bg-blue-100 text-blue-800 border-blue-300',
      'medication-administration': 'bg-orange-100 text-orange-800 border-orange-300',
      'patient-assessment': 'bg-green-100 text-green-800 border-green-300',
      'wound-care': 'bg-purple-100 text-purple-800 border-purple-300',
      'shift-handoff': 'bg-red-100 text-red-800 border-red-300',
      admission: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      discharge: 'bg-pink-100 text-pink-800 border-pink-300',
      'general-note': 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[workflowType] || colors['general-note'];
  };

  // Format workflow type for display
  const formatWorkflowType = (type: string): string => {
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Export entry in selected format
  const handleExport = (entry: DocumentationEntry, format: ExportFormat) => {
    let content = '';
    let filename = '';
    let mimeType = '';

    switch (format) {
      case 'fhir':
        content = toFHIRFormat(entry);
        filename = `${entry.id}-fhir.json`;
        mimeType = 'application/json';
        break;
      case 'hl7':
        content = toHL7Format(entry);
        filename = `${entry.id}-hl7.txt`;
        mimeType = 'text/plain';
        break;
      case 'csv':
        content = toCSVFormat(entry);
        filename = `${entry.id}-data.csv`;
        mimeType = 'text/csv';
        break;
      default:
        return;
    }

    downloadAsFile(content, filename, mimeType);
  };

  // Calculate today's stats
  const todayEntries = allEntries.filter((entry) => {
    const today = new Date().toDateString();
    return new Date(entry.timestamp).toDateString() === today;
  });

  const entriesByType = todayEntries.reduce(
    (acc, entry) => {
      acc[entry.workflowType] = (acc[entry.workflowType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const timeSavedEstimate = todayEntries.length * 5; // 5 minutes per entry

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Memorial General Hospital</h1>
              <p className="text-blue-200 text-sm">EHR System v12.5 - Nursing Documentation</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-blue-200">Current Time</p>
                <p className="text-lg font-mono">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-green-600 px-4 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Connected to Voize</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* New Entry Notification */}
      {newEntryNotification && (
        <div className="bg-green-500 text-white px-6 py-3 shadow-lg animate-slide-down">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="font-medium">
                New documentation received for {newEntryNotification.patientName} -{' '}
                {formatWorkflowType(newEntryNotification.workflowType)}
              </span>
            </div>
            <button
              onClick={() => setNewEntryNotification(null)}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dashboard Stats Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="grid grid-cols-5 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{todayEntries.length}</p>
              <p className="text-sm text-gray-600">Entries Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{patients.length}</p>
              <p className="text-sm text-gray-600">Active Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{timeSavedEstimate} min</p>
              <p className="text-sm text-gray-600">Time Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {Object.keys(entriesByType).length}
              </p>
              <p className="text-sm text-gray-600">Workflow Types</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {todayEntries.length > 0
                  ? Math.round((todayEntries.length / (new Date().getHours() || 1)) * 10) / 10
                  : 0}
              </p>
              <p className="text-sm text-gray-600">Avg/Hour</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Patient List Panel */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Patient List</h2>
            <p className="text-sm text-gray-600">Select a patient to view documentation</p>
          </div>
          <div className="divide-y divide-gray-200">
            {patients.map((patient) => {
              const unreadCount = unreadCounts[patient.id] || 0;
              const isSelected = selectedPatient?.id === patient.id;

              return (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  className={`w-full text-left p-4 hover:bg-blue-50 transition-colors ${
                    isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">Room {patient.room}</p>
                      <p className="text-xs text-gray-500 mt-1">MRN: {patient.mrn}</p>
                      {patient.primaryDiagnosis && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                          {patient.primaryDiagnosis}
                        </p>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div className="ml-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
                          {unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patient Details Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedPatient ? (
            <>
              {/* Patient Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">MRN:</span>{' '}
                        <span className="font-medium">{selectedPatient.mrn}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">DOB:</span>{' '}
                        <span className="font-medium">
                          {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Room:</span>{' '}
                        <span className="font-medium">{selectedPatient.room}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Code Status:</span>{' '}
                        <span className="font-medium">{selectedPatient.codeStatus}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-gray-600">Diagnosis:</span>{' '}
                      <span className="font-medium">{selectedPatient.primaryDiagnosis}</span>
                    </div>
                    {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Allergies:</span>{' '}
                        {selectedPatient.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="inline-block ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documentation Entries */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Recent Documentation ({patientEntries.length})
                  </h3>
                </div>

                {patientEntries.length === 0 ? (
                  <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                    <p>No documentation entries for this patient yet.</p>
                    <p className="text-sm mt-2">
                      Entries from the Nurse App will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Entry Header */}
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getWorkflowColor(
                                entry.workflowType
                              )}`}
                            >
                              {formatWorkflowType(entry.workflowType)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(entry.timestamp).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span className="text-sm text-gray-600">by {entry.nurseName}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                              </svg>
                              Received via Voize
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedEntry(selectedEntry?.id === entry.id ? null : entry)
                            }
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedEntry?.id === entry.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>

                        {/* Entry Content */}
                        <div className="p-4">
                          {/* Voice Transcript */}
                          <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">
                              Voice Transcript:
                            </h4>
                            <p className="text-gray-800 italic bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                              "{entry.voiceTranscript}"
                            </p>
                          </div>

                          {/* Structured Data Summary */}
                          {entry.structuredData.vitalSigns && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Vital Signs:
                              </h4>
                              <div className="grid grid-cols-3 gap-3">
                                {entry.structuredData.vitalSigns.bloodPressure && (
                                  <div className="bg-blue-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">Blood Pressure</p>
                                    <p className="font-semibold text-blue-900">
                                      {entry.structuredData.vitalSigns.bloodPressure} mmHg
                                    </p>
                                  </div>
                                )}
                                {entry.structuredData.vitalSigns.heartRate && (
                                  <div className="bg-red-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">Heart Rate</p>
                                    <p className="font-semibold text-red-900">
                                      {entry.structuredData.vitalSigns.heartRate} bpm
                                    </p>
                                  </div>
                                )}
                                {entry.structuredData.vitalSigns.temperature && (
                                  <div className="bg-orange-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">Temperature</p>
                                    <p className="font-semibold text-orange-900">
                                      {entry.structuredData.vitalSigns.temperature}°F
                                    </p>
                                  </div>
                                )}
                                {entry.structuredData.vitalSigns.respiratoryRate && (
                                  <div className="bg-green-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">Respiratory Rate</p>
                                    <p className="font-semibold text-green-900">
                                      {entry.structuredData.vitalSigns.respiratoryRate} /min
                                    </p>
                                  </div>
                                )}
                                {entry.structuredData.vitalSigns.oxygenSaturation && (
                                  <div className="bg-purple-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">O2 Saturation</p>
                                    <p className="font-semibold text-purple-900">
                                      {entry.structuredData.vitalSigns.oxygenSaturation}%
                                    </p>
                                  </div>
                                )}
                                {entry.structuredData.vitalSigns.painLevel !== undefined && (
                                  <div className="bg-yellow-50 p-2 rounded">
                                    <p className="text-xs text-gray-600">Pain Level</p>
                                    <p className="font-semibold text-yellow-900">
                                      {entry.structuredData.vitalSigns.painLevel}/10
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Medications */}
                          {entry.structuredData.medications &&
                            entry.structuredData.medications.length > 0 && (
                              <div className="mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Medications Administered:
                                </h4>
                                {entry.structuredData.medications.map((med, idx) => (
                                  <div key={idx} className="bg-orange-50 p-3 rounded mb-2">
                                    <p className="font-semibold text-orange-900">
                                      {med.name} - {med.dose} ({med.route})
                                    </p>
                                    {med.reason && (
                                      <p className="text-sm text-gray-700 mt-1">
                                        Reason: {med.reason}
                                      </p>
                                    )}
                                    {med.response && (
                                      <p className="text-sm text-gray-700 mt-1">
                                        Response: {med.response}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}

                          {/* Assessment */}
                          {entry.structuredData.assessment && (
                            <div className="mb-3">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                Assessment:
                              </h4>
                              <div className="bg-green-50 p-3 rounded space-y-2">
                                {entry.structuredData.assessment.levelOfConsciousness && (
                                  <p className="text-sm">
                                    <span className="font-medium">LOC:</span>{' '}
                                    {entry.structuredData.assessment.levelOfConsciousness}
                                  </p>
                                )}
                                {entry.structuredData.assessment.orientation && (
                                  <p className="text-sm">
                                    <span className="font-medium">Orientation:</span>{' '}
                                    {entry.structuredData.assessment.orientation}
                                  </p>
                                )}
                                {entry.structuredData.assessment.cardiovascular && (
                                  <p className="text-sm">
                                    <span className="font-medium">Cardiovascular:</span>{' '}
                                    {entry.structuredData.assessment.cardiovascular.rhythm}
                                  </p>
                                )}
                                {entry.structuredData.assessment.respiratory && (
                                  <p className="text-sm">
                                    <span className="font-medium">Respiratory:</span>{' '}
                                    {entry.structuredData.assessment.respiratory.breathSounds}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Export Buttons - Only show when expanded */}
                          {selectedEntry?.id === entry.id && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Export Formats:
                              </h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleExport(entry, 'fhir')}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium transition-colors"
                                >
                                  Download FHIR JSON
                                </button>
                                <button
                                  onClick={() => handleExport(entry, 'hl7')}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded font-medium transition-colors"
                                >
                                  Download HL7 v2
                                </button>
                                <button
                                  onClick={() => handleExport(entry, 'csv')}
                                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded font-medium transition-colors"
                                >
                                  Download CSV
                                </button>
                              </div>

                              {/* Format Preview */}
                              <div className="mt-4">
                                <div className="flex gap-2 mb-2">
                                  <button
                                    onClick={() => setExportFormat('human')}
                                    className={`px-3 py-1 text-sm rounded ${
                                      exportFormat === 'human'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    Human Readable
                                  </button>
                                  <button
                                    onClick={() => setExportFormat('fhir')}
                                    className={`px-3 py-1 text-sm rounded ${
                                      exportFormat === 'fhir'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    FHIR JSON
                                  </button>
                                  <button
                                    onClick={() => setExportFormat('hl7')}
                                    className={`px-3 py-1 text-sm rounded ${
                                      exportFormat === 'hl7'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    HL7 v2
                                  </button>
                                  <button
                                    onClick={() => setExportFormat('csv')}
                                    className={`px-3 py-1 text-sm rounded ${
                                      exportFormat === 'csv'
                                        ? 'bg-gray-800 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                  >
                                    CSV
                                  </button>
                                </div>
                                <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto max-h-96 overflow-y-auto font-mono">
                                  {exportFormat === 'fhir' && toFHIRFormat(entry)}
                                  {exportFormat === 'hl7' && toHL7Format(entry)}
                                  {exportFormat === 'csv' && toCSVFormat(entry)}
                                  {exportFormat === 'human' && (
                                    <div className="text-white">
                                      <div>Entry ID: {entry.id}</div>
                                      <div>
                                        Timestamp:{' '}
                                        {new Date(entry.timestamp).toLocaleString()}
                                      </div>
                                      <div>Patient: {entry.patientName}</div>
                                      <div>MRN: {entry.patientMRN}</div>
                                      <div>Nurse: {entry.nurseName}</div>
                                      <div>Workflow: {formatWorkflowType(entry.workflowType)}</div>
                                      <div className="mt-2">
                                        Transcript: "{entry.voiceTranscript}"
                                      </div>
                                      <div className="mt-2">
                                        Structured Data:{' '}
                                        {JSON.stringify(entry.structuredData, null, 2)}
                                      </div>
                                    </div>
                                  )}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="mt-4 text-lg font-medium">Select a patient to view documentation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
