/**
 * App Context for Nurse Documentation App
 * Manages global state including entries, current nurse, and EHR communication
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DocumentationEntry, Nurse, Patient } from '../../../shared/types';
import { mockPatients } from '../data/mockPatients';
import * as storageService from '../../../shared/services/storageService';

export interface AppState {
  // Current nurse information
  currentNurse: Nurse;

  // All patients
  patients: Patient[];

  // Currently selected patient
  selectedPatient: Patient | null;

  // All documentation entries
  entries: DocumentationEntry[];

  // Selected entry being edited
  selectedEntry: DocumentationEntry | null;

  // Stats
  entriesCompletedToday: number;
  timeSavedEstimate: number; // in minutes
}

export interface AppContextValue extends AppState {
  // Actions
  addEntry: (entry: DocumentationEntry) => void;
  updateEntry: (id: string, updates: Partial<DocumentationEntry>) => void;
  deleteEntry: (id: string) => void;
  sendToEHR: (id: string) => void;
  selectEntry: (entry: DocumentationEntry | null) => void;
  selectPatient: (patient: Patient | null) => void;

  // Getters
  getRecentEntries: (limit?: number) => DocumentationEntry[];
  getTodayEntries: () => DocumentationEntry[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Mock current nurse (in production, this would come from authentication)
const MOCK_NURSE: Nurse = {
  id: 'nurse-001',
  name: 'Nurse Johnson',
  licenseNumber: 'RN-123456',
  credentials: 'RN, BSN',
  department: 'Medical-Surgical',
  role: 'RN',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentNurse] = useState<Nurse>(MOCK_NURSE);
  const [patients] = useState<Patient[]>(mockPatients);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(mockPatients[0]);
  const [entries, setEntries] = useState<DocumentationEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DocumentationEntry | null>(null);

  // Load entries from storageService on mount
  useEffect(() => {
    const result = storageService.getLocalEntries();
    if (result.success && result.data) {
      setEntries(result.data);
    } else if (result.error) {
      console.error('Failed to load entries:', result.error.message);
    }
  }, []);

  const addEntry = useCallback((entry: DocumentationEntry) => {
    // Add to local state
    setEntries((prev) => [entry, ...prev]);

    // Save to storageService
    const result = storageService.sendToEHR(entry);
    if (!result.success && result.error) {
      console.error('Failed to save entry:', result.error.message);
    }
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<DocumentationEntry>) => {
    const updatedEntry = entries.find((e) => e.id === id);
    if (!updatedEntry) return;

    const newEntry = {
      ...updatedEntry,
      ...updates,
      lastModified: new Date().toISOString()
    };

    // Update local state
    setEntries((prev) =>
      prev.map((entry) => (entry.id === id ? newEntry : entry))
    );

    // Update in storageService
    const result = storageService.updateEntry(newEntry);
    if (!result.success && result.error) {
      console.error('Failed to update entry:', result.error.message);
    }
  }, [entries]);

  const deleteEntry = useCallback((id: string) => {
    // Remove from local state
    setEntries((prev) => prev.filter((entry) => entry.id !== id));

    // Clear selection if deleted
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }

    // Delete from storageService
    const result = storageService.deleteEntry(id);
    if (!result.success && result.error) {
      console.error('Failed to delete entry:', result.error.message);
    }
  }, [selectedEntry]);

  const sendToEHR = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) {
      console.error('❌ Entry not found:', id);
      return;
    }

    console.log('📤 [NURSE APP] Preparing to send entry to EHR:', {
      id: entry.id,
      patientName: entry.patientName,
      workflowType: entry.workflowType
    });

    // Update entry status
    const updatedEntry: DocumentationEntry = {
      ...entry,
      status: 'sent_to_ehr',
      sentToEHRAt: new Date().toISOString(),
    };

    // Update local state
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? updatedEntry : e))
    );

    // Send to EHR via storageService
    console.log('📤 [NURSE APP] Calling storageService.sendToEHR...');
    const result = storageService.sendToEHR(updatedEntry);

    if (result.success) {
      console.log('✅ [NURSE APP] Sent to EHR successfully!');
      console.log('📊 [NURSE APP] Entry data sent:', updatedEntry);
    } else if (result.error) {
      console.error('❌ [NURSE APP] Failed to send to EHR:', result.error.message);
    }
  }, [entries]);

  const selectEntry = useCallback((entry: DocumentationEntry | null) => {
    setSelectedEntry(entry);
  }, []);

  const selectPatient = useCallback((patient: Patient | null) => {
    setSelectedPatient(patient);
  }, []);

  const getRecentEntries = useCallback(
    (limit: number = 5) => {
      return entries.slice(0, limit);
    },
    [entries]
  );

  const getTodayEntries = useCallback(() => {
    const today = new Date().toDateString();
    return entries.filter(
      (entry) => new Date(entry.timestamp).toDateString() === today
    );
  }, [entries]);

  // Calculate stats
  const entriesCompletedToday = getTodayEntries().length;

  // Estimate time saved (assume 5 minutes saved per entry)
  const timeSavedEstimate = entriesCompletedToday * 5;

  const value: AppContextValue = {
    currentNurse,
    patients,
    selectedPatient,
    entries,
    selectedEntry,
    entriesCompletedToday,
    timeSavedEstimate,
    addEntry,
    updateEntry,
    deleteEntry,
    sendToEHR,
    selectEntry,
    selectPatient,
    getRecentEntries,
    getTodayEntries,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
