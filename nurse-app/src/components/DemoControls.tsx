/**
 * STEP 9: Demo Controls Component
 *
 * Provides controls for loading demo data, clearing data, and auto-populating forms
 */

import { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { getCompleteDemoData, getAutoFillData } from '../../../shared/mockData';
import type { WorkflowType } from '../../../shared/types';

export function DemoControls() {
  const { addEntry } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLoadDemoData = async () => {
    try {
      const demoData = getCompleteDemoData();

      // Store demo data in localStorage for persistence
      localStorage.setItem('voize_demo_patients', JSON.stringify(demoData.patients));
      localStorage.setItem('voize_demo_notes', JSON.stringify(demoData.historicalNotes));

      // Convert NurseNote to DocumentationEntry and add to entries
      demoData.historicalNotes.forEach(note => {
        const entry = {
          id: note.id,
          timestamp: note.timestamp,
          nurseId: note.nurseId || 'nurse-001',
          nurseName: note.nurseName,
          patientId: note.patientId,
          patientMRN: note.patientMRN,
          patientName: note.patientName,
          workflowType: note.noteType,
          voiceTranscript: note.transcription,
          structuredData: {
            vitalSigns: note.vitalSigns,
            additionalNotes: note.transcription
          },
          status: note.status === 'submitted' ? 'sent_to_ehr' as const : note.status as any,
          lastModified: note.timestamp
        };
        addEntry(entry as any);
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      console.log('✅ Demo data loaded:', {
        patients: demoData.patients.length,
        notes: demoData.historicalNotes.length
      });
    } catch (error) {
      console.error('Error loading demo data:', error);
      alert('Failed to load demo data. Check console for details.');
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // Clear localStorage
      localStorage.removeItem('voize_demo_patients');
      localStorage.removeItem('voize_demo_notes');
      localStorage.removeItem('voize_recent_notes');
      localStorage.removeItem('voize_nurse_entries');

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      console.log('✅ All data cleared');

      // Reload page to reset state
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleAutoPopulate = (workflowType: WorkflowType) => {
    const autoFillData = getAutoFillData(workflowType);
    const newEntry = {
      id: `entry_${Date.now()}`,
      ...autoFillData,
      confidence: 0.95,
      status: 'draft' as const,
      timestamp: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    addEntry(newEntry as any);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    console.log('✅ Auto-populated:', workflowType);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
        title="Demo Controls"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Demo Controls
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
              <h3 className="font-semibold text-lg">Demo Controls</h3>
              <p className="text-xs opacity-90 mt-1">Manage demo data and test features</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Success Message */}
              {showSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Action completed successfully!
                </div>
              )}

              {/* Load Demo Data */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Data Management</h4>
                <button
                  onClick={handleLoadDemoData}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Load Demo Data
                </button>
                <p className="text-xs text-gray-500">
                  Loads 6 sample patients and 14 historical notes
                </p>
              </div>

              {/* Auto-populate Forms */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Auto-Populate Forms</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAutoPopulate('vital-signs')}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Vitals
                  </button>
                  <button
                    onClick={() => handleAutoPopulate('medication')}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Medication
                  </button>
                  <button
                    onClick={() => handleAutoPopulate('assessment')}
                    className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Assessment
                  </button>
                  <button
                    onClick={() => handleAutoPopulate('wound-care')}
                    className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Wound Care
                  </button>
                  <button
                    onClick={() => handleAutoPopulate('intake-output')}
                    className="px-3 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    I/O
                  </button>
                  <button
                    onClick={() => handleAutoPopulate('handoff')}
                    className="px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Handoff
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  Fills current form with realistic sample data
                </p>
              </div>

              {/* Clear Data */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <button
                  onClick={handleClearAllData}
                  className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear All Data
                </button>
                <p className="text-xs text-gray-500">
                  Removes all patients, notes, and demo data
                </p>
              </div>

              {/* Info Section */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1">
                <p className="font-semibold text-gray-700">💡 Demo Tips:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Load demo data first for realistic examples</li>
                  <li>Auto-populate to quickly test workflows</li>
                  <li>Check EHR Dashboard to see results</li>
                  <li>Use Parser Demo to test voice transcripts</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
