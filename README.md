# Voize Demo - Voice-to-Text Nursing Documentation

A professional demonstration project showcasing voice-to-text nursing documentation with integration capabilities.

## Project Overview

This project consists of two applications:

1. **Nurse App** - Voice recording and transcription with workflow templates
2. **EHR Dashboard** - Mock Electronic Health Records system receiving data

### Tech Stack

- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- Web Speech API for voice recognition
- localStorage for data transfer between apps

## Project Structure

```
voize-demo/
├── nurse-app/              # Main voice documentation app
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── VoiceRecorder.tsx
│   │   │   ├── WorkflowSelector.tsx
│   │   │   ├── NoteEditor.tsx
│   │   │   └── PatientInfo.tsx
│   │   ├── workflows/      # Workflow templates
│   │   │   └── workflowTemplates.ts
│   │   ├── services/       # Business logic services
│   │   │   ├── speechRecognition.ts
│   │   │   └── dataSync.ts
│   │   └── App.tsx
│   ├── vite.config.ts      # Port: 5173
│   └── tailwind.config.js
├── ehr-dashboard/          # Mock EHR system
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── NotesList.tsx
│   │   │   ├── NoteDetail.tsx
│   │   │   └── PatientList.tsx
│   │   └── App.tsx
│   ├── vite.config.ts      # Port: 5184
│   └── tailwind.config.js
└── shared/
    └── types.ts            # Shared TypeScript types

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

Install dependencies for both apps:

```bash
# Option 1: Install both at once from root
npm run install:all

# Option 2: Install individually
cd nurse-app && npm install
cd ../ehr-dashboard && npm install
```

### Running the Applications

Run both applications in separate terminals:

```bash
# Terminal 1 - Nurse App
npm run dev:nurse

# Terminal 2 - EHR Dashboard
npm run dev:ehr
```

Or navigate to each directory:

```bash
# Terminal 1 - Nurse App
cd nurse-app && npm run dev

# Terminal 2 - EHR Dashboard
cd ehr-dashboard && npm run dev
```

Access the applications:
- Nurse App: http://localhost:5173
- EHR Dashboard: http://localhost:5184

**Note:** If ports are already in use, Vite will automatically assign the next available port.

## Color Scheme

Professional healthcare color palette:
- Primary: Blue (#2563EB)
- Success: Green (#10B981)
- Warning: Amber (#F59E0B)
- Background: Light gray (#F8FAFC)

## Features (To Be Implemented)

### Nurse App
- Voice recording with Web Speech API
- Real-time transcription
- Multiple workflow templates (admission, shift-assessment, medication, discharge, general)
- Note editing and review
- Patient information display
- Data synchronization with EHR dashboard

### EHR Dashboard
- Real-time note reception
- Patient list view
- Note detail view
- Note history and filtering
- Mock EHR system interface

## Workflow Templates

1. **Patient Admission** - Initial admission documentation
2. **Shift Assessment** - Routine patient assessment
3. **Medication Administration** - Medication records
4. **Patient Discharge** - Discharge documentation
5. **General Note** - Free-form notes

## Development Status

Project structure and initial setup complete. Ready for feature implementation.

## Next Steps

Refer to STEP 2 through STEP 6 of the implementation plan for feature development.
