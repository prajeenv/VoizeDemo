# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voize Demo is a voice-to-text nursing documentation system consisting of two React applications that communicate via localStorage:

- **Nurse App** (port 5173/5176): Voice recording, transcription, and workflow-based documentation
- **EHR Dashboard** (port 5174/5187): Mock Electronic Health Records system that receives entries in real-time

## Commands

### Development
```bash
# Install all dependencies
npm run install:all

# Run both apps (in separate terminals)
npm run dev:nurse      # Nurse App
npm run dev:ehr        # EHR Dashboard

# Or from individual directories
cd nurse-app && npm run dev
cd ehr-dashboard && npm run dev
```

### Build & Lint
```bash
# Build (from app directory)
cd nurse-app && npm run build
cd ehr-dashboard && npm run build

# Lint
cd nurse-app && npm run lint
cd ehr-dashboard && npm run lint
```

## Architecture

### Cross-App Communication
The apps communicate via `shared/services/storageService.ts` using localStorage and storage events. Key patterns:
- `sendToEHR(entry)` - Saves entry to localStorage and triggers storage event
- `subscribeToChanges(callback)` - Listens for storage events for real-time updates
- Both apps use the same `STORAGE_KEY = 'voize_entries'`

### Shared Types (`shared/types.ts`)
Central type definitions used by both apps:
- `WorkflowType`: 'vital-signs', 'medication-administration', 'patient-assessment', 'wound-care', 'intake-output', 'shift-handoff'
- `DocumentationEntry`: Core data structure for nursing notes
- `StructuredData`: Contains VitalSigns, Medication, Assessment data
- LOINC codes included for vital signs standardization

### Nurse App Services (`nurse-app/src/services/`)
- **voiceService.ts**: Web Speech API wrapper for voice-to-text with medical terminology optimization
- **parseService.ts**: NLP-powered transcript parser that extracts structured data (vital signs, medications, assessments) with confidence scoring
- Medical abbreviation dictionary for route/frequency normalization

### State Management
Nurse App uses React Context (`nurse-app/src/contexts/AppContext.tsx`) to manage:
- Current patient selection
- Documentation entries
- EHR synchronization

### EHR Export Formats (`ehr-dashboard/src/utils/exportFormats.ts`)
Supports FHIR R4, HL7 v2, and CSV export formats with LOINC codes.

## Demo Features

The Nurse App includes demo controls for:
- Loading sample patient data (6 patients, 14 historical notes)
- Auto-populating workflow forms
- Parser demo mode
- Voice recording demo mode
- Microphone diagnostics

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Web Speech API for voice recognition
- localStorage + storage events for cross-app communication
