/**
 * App Context for Nurse Documentation App
 * Manages global state including entries, current nurse, and EHR communication
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { DocumentationEntry, Nurse } from '../../../shared/types';

export interface AppState {
  // Current nurse information
  currentNurse: Nurse;

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

  // Getters
  getRecentEntries: (limit?: number) => DocumentationEntry[];
  getTodayEntries: () => DocumentationEntry[];
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  ENTRIES: 'voize_nurse_entries',
  CURRENT_NURSE: 'voize_current_nurse',
};

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
  const [entries, setEntries] = useState<DocumentationEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<DocumentationEntry | null>(null);

  // Load entries from localStorage on mount
  useEffect(() => {
    const storedEntries = localStorage.getItem(STORAGE_KEYS.ENTRIES);
    if (storedEntries) {
      try {
        setEntries(JSON.parse(storedEntries));
      } catch (error) {
        console.error('Failed to load entries from localStorage:', error);
      }
    }
  }, []);

  // Save entries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }, [entries]);

  // Listen for entries sent to EHR (from other tabs or windows)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'voize_ehr_new_entry') {
        // EHR received a new entry, we could show a notification
        console.log('Entry sent to EHR:', event.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addEntry = useCallback((entry: DocumentationEntry) => {
    setEntries((prev) => [entry, ...prev]);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<DocumentationEntry>) => {
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, ...updates, lastModified: new Date().toISOString() }
          : entry
      )
    );
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  }, [selectedEntry]);

  const sendToEHR = useCallback((id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (!entry) return;

    // Update entry status
    const updatedEntry: DocumentationEntry = {
      ...entry,
      status: 'sent_to_ehr',
      sentToEHRAt: new Date().toISOString(),
    };

    setEntries((prev) =>
      prev.map((e) => (e.id === id ? updatedEntry : e))
    );

    // Send to EHR via localStorage (simulating cross-app communication)
    const ehrMessage = {
      messageId: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      entry: updatedEntry,
    };

    localStorage.setItem('voize_ehr_new_entry', JSON.stringify(ehrMessage));

    // Broadcast event for same-tab communication
    window.dispatchEvent(
      new CustomEvent('voize:ehr-entry', { detail: ehrMessage })
    );
  }, [entries]);

  const selectEntry = useCallback((entry: DocumentationEntry | null) => {
    setSelectedEntry(entry);
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
    entries,
    selectedEntry,
    entriesCompletedToday,
    timeSavedEstimate,
    addEntry,
    updateEntry,
    deleteEntry,
    sendToEHR,
    selectEntry,
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
