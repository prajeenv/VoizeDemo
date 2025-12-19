/**
 * Storage Service for Cross-Window Communication
 *
 * This service provides a clean API for communication between the Nurse App
 * and EHR Dashboard using localStorage and storage events.
 *
 * Key Features:
 * - Event-based updates for real-time synchronization
 * - Data validation and error handling
 * - Automatic cleanup of old entries
 * - Type-safe operations
 */

import type { DocumentationEntry } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'voize_entries';
const MAX_ENTRIES = 50; // Keep last 50 entries

// ============================================================================
// TYPES
// ============================================================================

export interface StorageError {
  code: 'QUOTA_EXCEEDED' | 'VALIDATION_ERROR' | 'PARSE_ERROR' | 'UNKNOWN';
  message: string;
  originalError?: unknown;
}

export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: StorageError;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates a DocumentationEntry before storing
 */
export function validateEntry(entry: DocumentationEntry): StorageResult<DocumentationEntry> {
  if (!entry.id) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Entry must have an id'
      }
    };
  }

  if (!entry.timestamp) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Entry must have a timestamp'
      }
    };
  }

  if (!entry.patientId) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Entry must have a patientId'
      }
    };
  }

  if (!entry.workflowType) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Entry must have a workflowType'
      }
    };
  }

  if (!entry.voiceTranscript) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Entry must have a voiceTranscript'
      }
    };
  }

  return {
    success: true,
    data: entry
  };
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Gets all entries from localStorage
 * @returns Array of DocumentationEntry objects
 */
export function getAllEntries(): StorageResult<DocumentationEntry[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      return {
        success: true,
        data: []
      };
    }

    const entries = JSON.parse(data) as DocumentationEntry[];

    // Sort by timestamp (newest first)
    const sorted = entries.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      success: true,
      data: sorted
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse entries from localStorage',
        originalError: error
      }
    };
  }
}

/**
 * Gets a single entry by ID
 */
export function getEntryById(id: string): StorageResult<DocumentationEntry | null> {
  const result = getAllEntries();

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error
    };
  }

  const entry = result.data.find(e => e.id === id);

  return {
    success: true,
    data: entry || null
  };
}

/**
 * Stores all entries to localStorage with automatic cleanup
 */
function storeEntries(entries: DocumentationEntry[]): StorageResult<void> {
  try {
    // Keep only the last MAX_ENTRIES
    const limitedEntries = entries.slice(0, MAX_ENTRIES);

    const json = JSON.stringify(limitedEntries);
    localStorage.setItem(STORAGE_KEY, json);

    return { success: true };
  } catch (error) {
    // Check if it's a quota exceeded error
    if (error instanceof DOMException && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      return {
        success: false,
        error: {
          code: 'QUOTA_EXCEEDED',
          message: 'localStorage quota exceeded. Try clearing old data.',
          originalError: error
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Failed to store entries in localStorage',
        originalError: error
      }
    };
  }
}

// ============================================================================
// NURSE APP FUNCTIONS
// ============================================================================

/**
 * Sends a documentation entry to the EHR Dashboard
 * Used by Nurse App to save and transmit entries
 *
 * @param entry - The DocumentationEntry to send
 * @returns Result indicating success or failure
 */
export function sendToEHR(entry: DocumentationEntry): StorageResult<DocumentationEntry> {
  // Validate entry first
  const validation = validateEntry(entry);
  if (!validation.success) {
    return validation;
  }

  // Get existing entries
  const existing = getAllEntries();
  if (!existing.success) {
    return {
      success: false,
      error: existing.error
    };
  }

  const entries = existing.data || [];

  // Check if entry already exists (update) or is new (insert)
  const existingIndex = entries.findIndex(e => e.id === entry.id);

  if (existingIndex >= 0) {
    // Update existing entry
    entries[existingIndex] = {
      ...entry,
      lastModified: new Date().toISOString()
    };
  } else {
    // Add new entry at the beginning
    entries.unshift({
      ...entry,
      sentToEHRAt: entry.status === 'sent_to_ehr' ? new Date().toISOString() : undefined
    });
  }

  // Store updated entries
  const storeResult = storeEntries(entries);

  if (!storeResult.success) {
    return {
      success: false,
      error: storeResult.error
    };
  }

  // Dispatch a custom event for same-window listeners
  window.dispatchEvent(new CustomEvent('voize-entry-added', {
    detail: entry
  }));

  // Broadcast to other windows/tabs (including different ports) via BroadcastChannel
  if ('BroadcastChannel' in window) {
    try {
      console.log('📡 Broadcasting entry via BroadcastChannel:', entry.id);
      const channel = new BroadcastChannel('voize-entries');
      channel.postMessage({
        type: 'NEW_ENTRY',
        entry: entry
      });
      console.log('✅ Broadcast successful');
      channel.close();
    } catch (error) {
      console.error('❌ Failed to broadcast entry:', error);
    }
  } else {
    console.warn('⚠️ BroadcastChannel not supported in this browser');
  }

  return {
    success: true,
    data: entry
  };
}

/**
 * Gets all entries stored locally (for Nurse App history view)
 * @returns Array of all stored entries, sorted by timestamp
 */
export function getLocalEntries(): StorageResult<DocumentationEntry[]> {
  return getAllEntries();
}

/**
 * Updates an existing entry
 */
export function updateEntry(entry: DocumentationEntry): StorageResult<DocumentationEntry> {
  return sendToEHR(entry);
}

/**
 * Deletes an entry by ID
 */
export function deleteEntry(id: string): StorageResult<void> {
  const result = getAllEntries();

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error
    };
  }

  const filtered = result.data.filter(e => e.id !== id);
  return storeEntries(filtered);
}

// ============================================================================
// EHR DASHBOARD FUNCTIONS
// ============================================================================

/**
 * Subscribes to new entries from localStorage
 * Used by EHR Dashboard to receive real-time updates
 *
 * IMPORTANT: Uses BroadcastChannel for cross-origin communication between apps
 * on different ports (localhost:5173 and localhost:5184)
 *
 * @param callback - Function to call when a new entry is received
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToNewEntries(
  callback: (entry: DocumentationEntry) => void
): () => void {
  let previousEntries: DocumentationEntry[] = [];

  // Initialize with current entries
  const initial = getAllEntries();
  if (initial.success && initial.data) {
    previousEntries = initial.data;
  }

  // BroadcastChannel for cross-port communication
  let channel: BroadcastChannel | null = null;
  if ('BroadcastChannel' in window) {
    console.log('🔊 Opening BroadcastChannel for listening...');
    channel = new BroadcastChannel('voize-entries');

    channel.onmessage = (event) => {
      console.log('📨 Received BroadcastChannel message:', event.data);
      if (event.data?.type === 'NEW_ENTRY') {
        const entry = event.data.entry as DocumentationEntry;
        console.log('📥 New entry received via BroadcastChannel:', entry.id);

        // Check if we already have this entry
        if (!previousEntries.some(prev => prev.id === entry.id)) {
          console.log('✅ Entry is new, calling callback');
          callback(entry);
          previousEntries.unshift(entry);
        } else {
          console.log('⚠️ Entry already exists, skipping');
        }
      }
    };

    console.log('✅ BroadcastChannel listener established');
  } else {
    console.warn('⚠️ BroadcastChannel not supported, will use polling fallback');
  }

  // Polling fallback for browsers without BroadcastChannel
  let pollingInterval: number | null = null;
  if (!channel) {
    console.warn('BroadcastChannel not supported, using polling fallback');
    pollingInterval = window.setInterval(() => {
      const result = getAllEntries();
      if (result.success && result.data) {
        const newEntries = result.data;

        // Find entries that weren't in previous state
        const addedEntries = newEntries.filter(
          newEntry => !previousEntries.some(prev => prev.id === newEntry.id)
        );

        // Call callback for each new entry
        addedEntries.forEach(entry => callback(entry));

        if (addedEntries.length > 0) {
          previousEntries = newEntries;
        }
      }
    }, 1000); // Poll every second
  }

  // Listen for storage events (same-origin communication)
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    if (!event.newValue) return;

    try {
      const newEntries = JSON.parse(event.newValue) as DocumentationEntry[];

      // Find entries that weren't in previous state
      const addedEntries = newEntries.filter(
        newEntry => !previousEntries.some(prev => prev.id === newEntry.id)
      );

      // Call callback for each new entry
      addedEntries.forEach(entry => callback(entry));

      previousEntries = newEntries;
    } catch (error) {
      console.error('Error parsing storage event:', error);
    }
  };

  // Listen for custom events (same-window communication)
  const handleCustomEvent = (event: Event) => {
    const customEvent = event as CustomEvent<DocumentationEntry>;
    const entry = customEvent.detail;

    if (entry && !previousEntries.some(prev => prev.id === entry.id)) {
      callback(entry);
      previousEntries.unshift(entry);
    }
  };

  window.addEventListener('storage', handleStorageEvent);
  window.addEventListener('voize-entry-added', handleCustomEvent);

  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageEvent);
    window.removeEventListener('voize-entry-added', handleCustomEvent);

    if (channel) {
      channel.close();
    }

    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  };
}

/**
 * Gets all entries for EHR Dashboard display
 * @returns Array of all entries, sorted by timestamp
 */
export function getAllEHREntries(): StorageResult<DocumentationEntry[]> {
  return getAllEntries();
}

/**
 * Gets entries filtered by patient ID
 */
export function getEntriesByPatient(patientId: string): StorageResult<DocumentationEntry[]> {
  const result = getAllEntries();

  if (!result.success || !result.data) {
    return result;
  }

  const filtered = result.data.filter(e => e.patientId === patientId);

  return {
    success: true,
    data: filtered
  };
}

/**
 * Gets entries filtered by workflow type
 */
export function getEntriesByWorkflow(workflowType: string): StorageResult<DocumentationEntry[]> {
  const result = getAllEntries();

  if (!result.success || !result.data) {
    return result;
  }

  const filtered = result.data.filter(e => e.workflowType === workflowType);

  return {
    success: true,
    data: filtered
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Exports all data for demo purposes
 * @returns JSON string of all entries
 */
export function exportAllData(): StorageResult<string> {
  const result = getAllEntries();

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error
    };
  }

  try {
    const json = JSON.stringify(result.data, null, 2);
    return {
      success: true,
      data: json
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Failed to export data',
        originalError: error
      }
    };
  }
}

/**
 * Imports data from JSON string
 */
export function importData(jsonString: string): StorageResult<void> {
  try {
    const entries = JSON.parse(jsonString) as DocumentationEntry[];

    // Validate each entry
    for (const entry of entries) {
      const validation = validateEntry(entry);
      if (!validation.success) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid entry with id ${entry.id}: ${validation.error?.message}`
          }
        };
      }
    }

    return storeEntries(entries);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Failed to parse import data',
        originalError: error
      }
    };
  }
}

/**
 * Clears all entries from localStorage
 */
export function clearAllEntries(): StorageResult<void> {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'UNKNOWN',
        message: 'Failed to clear entries',
        originalError: error
      }
    };
  }
}

/**
 * Gets storage statistics
 */
export function getStorageStats(): {
  totalEntries: number;
  oldestEntry?: string;
  newestEntry?: string;
  storageSize: number;
} {
  const result = getAllEntries();

  if (!result.success || !result.data || result.data.length === 0) {
    return {
      totalEntries: 0,
      storageSize: 0
    };
  }

  const entries = result.data;
  const sorted = [...entries].sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const json = JSON.stringify(entries);
  const storageSize = new Blob([json]).size;

  return {
    totalEntries: entries.length,
    oldestEntry: sorted[0]?.timestamp,
    newestEntry: sorted[sorted.length - 1]?.timestamp,
    storageSize
  };
}
