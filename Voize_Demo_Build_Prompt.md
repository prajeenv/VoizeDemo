# Voize US Demo - Step-by-Step Build Prompt for Claude Code

## Project Overview
Build a professional voice-to-text nursing documentation demo with two applications:
1. **Nurse App** - Voice recording and transcription with workflow templates
2. **Mock EHR Dashboard** - Simulates hospital EHR system receiving data

**Tech Stack:** React (Vite), Web Speech API, localStorage for data transfer, TailwindCSS
**Goal:** Demonstrate integration capability and understanding of nursing workflows

---

## STEP 1: Project Setup & Architecture

**Prompt for Claude Code:**

```
I need to create a professional voice-to-text nursing documentation demo. This will be a learning project to demonstrate understanding of healthcare workflows and integration capabilities.

STEP 1: Create the project structure and setup

Requirements:
1. Create a React + Vite project with TypeScript
2. Install TailwindCSS for styling
3. Set up the following folder structure:
   ```
   voize-demo/
   ├── nurse-app/          (Main voice documentation app)
   │   ├── src/
   │   │   ├── components/
   │   │   ├── workflows/
   │   │   ├── services/
   │   │   └── App.tsx
   │   └── index.html
   ├── ehr-dashboard/      (Mock EHR system)
   │   ├── src/
   │   │   ├── components/
   │   │   └── App.tsx
   │   └── index.html
   └── shared/
       └── types.ts        (Shared TypeScript types)
   ```

4. Configure both apps to run on different ports:
   - Nurse App: http://localhost:5173
   - EHR Dashboard: http://localhost:5174

5. Set up TailwindCSS with a professional healthcare color scheme:
   - Primary: Blue (#2563EB)
   - Success: Green (#10B981)
   - Warning: Amber (#F59E0B)
   - Background: Light gray (#F8FAFC)

Please create the initial project structure with all configuration files (package.json, vite.config.ts, tailwind.config.js) and empty component files.
```

**Wait for completion before proceeding to Step 2**

---

## STEP 2: Shared Types & Data Models

**Prompt for Claude Code:**

```
STEP 2: Define shared TypeScript types and data models

Create a comprehensive type system in shared/types.ts that includes:

1. Workflow Types:
   - PatientAssessment
   - MedicationAdministration
   - WoundCare
   - VitalSigns
   - ShiftHandoff

2. Core Interfaces:
   ```typescript
   interface DocumentationEntry {
     id: string;
     timestamp: string;
     nurseId: string;
     patientId: string;
     workflowType: WorkflowType;
     voiceTranscript: string;
     structuredData: StructuredData;
     status: 'draft' | 'completed' | 'sent_to_ehr';
   }

   interface StructuredData {
     // Fields depend on workflow type
     vitalSigns?: VitalSigns;
     medications?: Medication[];
     assessment?: Assessment;
     woundDetails?: WoundDetails;
     // etc.
   }
   ```

3. EHR Integration Types:
   - EHRMessage (what gets sent to EHR)
   - FHIRObservation (simulated FHIR format)
   - HL7Message (simulated HL7 format)

Include realistic nursing terminology and medical codes (LOINC codes for vitals, etc.).

Create detailed TypeScript interfaces with JSDoc comments explaining each field.
```

**Wait for completion and review types before proceeding**

---

## STEP 3: Voice Recording Service

**Prompt for Claude Code:**

```
STEP 3: Create the voice recording and speech-to-text service

Build a service in nurse-app/src/services/voiceService.ts that:

1. Uses Web Speech API (SpeechRecognition)
2. Handles browser compatibility (Chrome, Edge, Safari)
3. Provides the following functionality:
   - startRecording()
   - stopRecording()
   - pauseRecording()
   - resumeRecording()
   - Real-time transcript updates
   - Error handling

4. Configuration options:
   - Continuous recording mode
   - Interim results (show transcription in real-time)
   - Language: English (en-US)
   - Medical terminology optimization

5. State management:
   - isRecording
   - isPaused
   - currentTranscript
   - finalTranscript
   - error

Include TypeScript interfaces and proper error handling for:
- Browser not supporting Speech Recognition
- Microphone permission denied
- Network issues

Make it a React hook: useVoiceRecording()
```

**Test the voice recording before proceeding**

---

## STEP 4: Workflow Templates Component

**Prompt for Claude Code:**

```
STEP 4: Create workflow template components

Build workflow template components in nurse-app/src/workflows/ for:

1. PatientAssessment.tsx
   Fields to capture:
   - Patient ID, Room number
   - Level of consciousness (Alert, Responsive, Unresponsive)
   - Mobility status (Ambulatory, Assisted, Bedbound)
   - Pain level (0-10 scale)
   - Skin condition
   - General observations
   - Voice transcript section

2. VitalSigns.tsx
   Fields:
   - Blood Pressure (systolic/diastolic)
   - Heart Rate (BPM)
   - Temperature (F/C)
   - Respiratory Rate
   - Oxygen Saturation (SpO2)
   - Timestamp (auto-populated)
   - Voice transcript section

3. MedicationAdministration.tsx
   Fields:
   - Patient ID
   - Medication name
   - Dosage
   - Route (Oral, IV, IM, etc.)
   - Time administered
   - Patient response/reaction
   - Voice transcript section

4. WoundCare.tsx
   Fields:
   - Wound location
   - Wound size (length x width x depth)
   - Wound type (surgical, pressure, etc.)
   - Drainage (type, amount)
   - Treatment provided
   - Voice transcript section

5. ShiftHandoff.tsx
   Fields:
   - Outgoing nurse
   - Incoming nurse
   - Shift time
   - Patient summary (free text)
   - Pending tasks
   - Critical alerts
   - Voice transcript section

Each component should:
- Display the form fields
- Have a section showing the voice transcript
- Include an "Edit" mode to correct transcript data
- Auto-populate fields based on voice transcript where possible
- Show which fields are auto-filled vs manual entry
- Include validation

Use consistent styling with TailwindCSS.
```

**Review each workflow component before proceeding**

---

## STEP 5: Voice-to-Structured Data Parser

**Prompt for Claude Code:**

```
STEP 5: Create an intelligent parser to convert voice transcript to structured data

Build nurse-app/src/services/parseService.ts that:

1. Takes raw voice transcript and workflow type as input
2. Extracts structured data using pattern matching and NLP techniques
3. Returns a StructuredData object

Key parsing capabilities:

For Vital Signs:
- Extract: "BP one twenty over eighty" → {systolic: 120, diastolic: 80}
- Extract: "temp ninety eight point six" → {temperature: 98.6, unit: 'F'}
- Extract: "pulse seventy two" → {heartRate: 72}
- Extract: "oxygen sat ninety eight percent" → {spO2: 98}

For Medications:
- Extract: "gave patient Smith ten milligrams of morphine IV at fourteen thirty"
  → {patient: 'Smith', medication: 'Morphine', dose: '10mg', route: 'IV', time: '14:30'}

For Patient Assessment:
- Extract: "patient alert and oriented times three"
  → {consciousness: 'Alert', oriented: 'x3'}
- Extract: "patient ambulatory with assistance"
  → {mobility: 'Assisted'}
- Extract: "pain level five out of ten"
  → {painLevel: 5}

Implementation approach:
- Use regex patterns for common medical phrases
- Create a medical terminology dictionary
- Handle various ways nurses describe the same thing
- Include confidence scores for each extracted field
- Flag uncertain extractions for nurse review

The parser should:
- Be extensible for new workflows
- Handle multiple patients mentioned in one session
- Support common nursing abbreviations (PRN, BID, etc.)
- Handle both numeric and word formats ("10" or "ten")

Return format:
```typescript
{
  structuredData: StructuredData,
  confidence: { [field: string]: number },
  needsReview: string[]  // Fields that need manual verification
}
```
```

**Test parsing with sample nurse phrases before proceeding**

---

## STEP 6: Nurse App Main Interface

**Prompt for Claude Code:**

```
STEP 6: Build the main Nurse App interface

Create nurse-app/src/App.tsx with the following layout and features:

Layout Structure:
```
┌─────────────────────────────────────────────┐
│  Header: Voize US - Nurse Documentation    │
│  [Profile] [Settings]                       │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────────────┐│
│  │  Workflow    │  │                      ││
│  │  Selection   │  │   Main Workspace     ││
│  │              │  │                      ││
│  │ □ Vitals     │  │  [Selected Workflow  ││
│  │ □ Assessment │  │   Component]         ││
│  │ □ Medication │  │                      ││
│  │ □ Wound Care │  │  ┌─────────────────┐ ││
│  │ □ Handoff    │  │  │ Voice Transcript│ ││
│  │              │  │  │ [Recording...]  │ ││
│  │              │  │  └─────────────────┘ ││
│  │              │  │                      ││
│  │              │  │  [🎤 Start/Stop]     ││
│  │              │  │  [✓ Complete Entry]  ││
│  └──────────────┘  │  [📤 Send to EHR]    ││
│                    └──────────────────────┘│
└─────────────────────────────────────────────┘
```

Features:
1. Workflow selector sidebar with icons
2. Voice recording controls:
   - Large microphone button (Start/Stop)
   - Visual feedback when recording (animated icon)
   - Real-time transcript display
   - Pause/Resume capability

3. Main workspace shows:
   - Selected workflow form
   - Auto-populated fields from voice (highlighted)
   - Manual edit fields
   - Validation indicators

4. Action buttons:
   - "Complete Entry" (saves locally)
   - "Send to EHR" (sends to mock EHR via localStorage)
   - "Clear" (reset form)
   - "Edit Transcript" (manual corrections)

5. Recent Entries panel (bottom or right side):
   - List of last 5 documentation entries
   - Quick view/edit capability
   - Status indicators (Draft, Completed, Sent)

6. Header features:
   - Current nurse name (mock: "Nurse Johnson")
   - Current time
   - Shift information
   - Quick stats (entries today, time saved estimate)

State Management:
- Use React Context or useState for app state
- Store entries in localStorage
- Broadcast to EHR via localStorage events

Styling:
- Clean, professional healthcare UI
- Large touch-friendly buttons for mobile use
- High contrast for readability
- Responsive design

Include proper TypeScript typing and component composition.
```

**Test the full nurse interface before proceeding**

---

## STEP 7: Mock EHR Dashboard

**Prompt for Claude Code:**

```
STEP 7: Build the Mock EHR Dashboard application

Create ehr-dashboard/src/App.tsx with a professional EHR-style interface:

Layout Structure:
```
┌─────────────────────────────────────────────┐
│  EHR System - Nursing Documentation        │
│  [Epic-style or Generic Hospital System]   │
├─────────────────────────────────────────────┤
│  Patient List                  │ Details    │
│  ┌──────────────────┐         │            │
│  │ □ Smith, John    │         │ [Patient   │
│  │   Room 204       │    ───→ │  Chart]    │
│  │   [2 new]        │         │            │
│  │                  │         │ Recent Docs:│
│  │ □ Davis, Mary    │         │ • Vitals   │
│  │   Room 206       │         │   14:30    │
│  │   [1 new]        │         │ • Meds     │
│  │                  │         │   15:15    │
│  │ □ Johnson, Bob   │         │ • Assessment│
│  │   Room 208       │         │   16:00    │
│  │   [0 new]        │         │            │
│  └──────────────────┘         │ [View Full │
│                                │  Chart]    │
└─────────────────────────────────────────────┘
```

Features:

1. Patient List Panel (Left):
   - List of patients (mock data: 5-6 patients)
   - Show unread documentation count
   - Room numbers
   - Highlight when new data arrives
   - Click to view patient details

2. Patient Details Panel (Right):
   - Patient demographics (name, DOB, MRN)
   - Recent documentation entries (timestamped)
   - Expandable entries showing full details
   - Color-coded by type:
     * Vitals: Blue
     * Medications: Orange
     * Assessments: Green
     * Wound Care: Purple
     * Handoff: Red

3. Real-time Data Reception:
   - Listen to localStorage events from Nurse App
   - Show animated notification when new data arrives
   - Play subtle sound (optional)
   - Badge count updates

4. Documentation View:
   - Show both original voice transcript
   - Show structured/parsed data
   - Display in EHR-style forms
   - Timestamp and nurse name
   - "Received via Voize" indicator

5. Export Formats Display:
   - Toggle button to show data in different formats:
     * Human-readable (default)
     * FHIR JSON (formatted)
     * HL7 v2 (simulated message)
     * CSV export

6. Header:
   - Mock hospital name: "Memorial General Hospital"
   - System name: "EHR System v12.5"
   - Current time
   - "Connected to Voize" status indicator

7. Dashboard Stats:
   - Total entries received today
   - Entries by type (pie chart or simple counts)
   - Average time per entry
   - "Time saved" metric

Mock Data:
Include 3-4 sample patients with existing documentation so the dashboard looks realistic from the start.

Styling:
- Professional EHR aesthetic (clean, clinical)
- Data tables with proper spacing
- Subtle animations for new data arrival
- Responsive layout

The key is to make this LOOK like a real EHR system receiving data from the Voize app in real-time.
```

**Test the EHR dashboard and data flow before proceeding**

---

## STEP 8: LocalStorage Communication Bridge

**Prompt for Claude Code:**

```
STEP 8: Create the communication bridge between Nurse App and EHR Dashboard

Build shared/services/storageService.ts that:

1. Provides a clean API for cross-window communication via localStorage
2. Implements event-based updates
3. Handles data serialization/deserialization

Key functions:

```typescript
// In Nurse App
export const sendToEHR = (entry: DocumentationEntry) => {
  // Write to localStorage with timestamp
  // Trigger storage event
  // Return success confirmation
}

export const getLocalEntries = (): DocumentationEntry[] => {
  // Get all entries stored locally
  // Return sorted by timestamp
}

// In EHR Dashboard
export const subscribeToNewEntries = (
  callback: (entry: DocumentationEntry) => void
) => {
  // Listen for localStorage changes
  // Parse incoming data
  // Call callback with new entry
  // Return unsubscribe function
}

export const getAllEHREntries = (): DocumentationEntry[] => {
  // Get all entries from localStorage
  // Return as array
}
```

localStorage Structure:
```
voize_entries: [
  {
    id: "uuid",
    timestamp: "2024-01-15T14:30:00",
    nurseId: "nurse_123",
    patientId: "MRN_001",
    workflowType: "VitalSigns",
    voiceTranscript: "...",
    structuredData: {...},
    status: "sent_to_ehr",
    metadata: {
      confidence: {...},
      needsReview: [...]
    }
  },
  ...
]
```

Additional features:
- Data validation before writing
- Error handling for storage quota exceeded
- Automatic cleanup of old entries (keep last 50)
- Export all data function (for demo purposes)

Include comprehensive error handling and TypeScript types.
```

**Test the communication between both apps**

---

## STEP 9: Sample Data & Realistic Content

**Prompt for Claude Code:**

```
STEP 9: Create realistic sample data and demo content

Build a data generation service in shared/mockData.ts with:

1. Sample Patients:
   ```typescript
   {
     patientId: "MRN_001",
     name: "Smith, John",
     room: "204",
     age: 67,
     admitDate: "2024-01-10",
     diagnosis: "Post-op hip replacement"
   }
   // Create 5-6 sample patients
   ```

2. Sample Nursing Phrases (for testing voice parsing):
   - Vital signs: "BP one twenty over eighty, pulse seventy two, temp ninety eight point six, patient is comfortable"
   - Medication: "Administered ten milligrams morphine IV push at fourteen thirty, patient reports pain decreased to level three"
   - Assessment: "Patient Smith in room two oh four, alert and oriented times three, ambulatory with walker, denies pain, skin warm and dry, wound dressing clean dry intact"
   - Wound care: "Stage two pressure ulcer on right heel, measures three centimeters by two centimeters, minimal serous drainage, cleaned with normal saline, dressed with foam dressing"
   - Handoff: "Patient Davis is post-op day two from appendectomy, vitals stable, pain controlled, taking clear liquids, awaiting surgery clearance for discharge tomorrow"

3. Pre-populate EHR Dashboard:
   - Add 3-4 historical entries for each patient
   - Mix of different workflow types
   - Timestamps spread throughout the day
   - This makes the dashboard look realistic from the start

4. Demo Mode:
   - Add a "Load Demo Data" button in Nurse App
   - Add "Clear All Data" button
   - Add "Auto-populate" feature that fills form with realistic data

5. Nursing Terminology Dictionary:
   - Common abbreviations and their meanings
   - Medical terminology for parsing
   - LOINC codes for vital signs
   - Common medication names and routes

Make the data realistic enough for a professional demo but clearly marked as "DEMO DATA" where appropriate.
```

**Populate and test with realistic data**

---

## STEP 10: Polish & Demo Features

**Prompt for Claude Code:**

```
STEP 10: Add polish, demo features, and final touches

Implement the following enhancements:

1. Visual Feedback:
   - Add loading states during voice recording
   - Animated microphone icon when recording
   - Toast notifications for actions (Entry saved, Sent to EHR, etc.)
   - Smooth transitions between workflows
   - Highlight newly received data in EHR dashboard

2. Demo Control Panel (add to Nurse App):
   - Button: "Quick Demo Mode" - auto-fills with realistic data
   - Button: "Simulate Voice Input" - types out a sample transcript gradually
   - Slider: "Simulation Speed" - controls typing speed
   - Dropdown: "Sample Scenarios" - preloaded nursing scenarios

3. Export/Share Features:
   - "Export Demo Data" (download JSON)
   - "Generate Demo Report" (summary of entries)
   - "Copy Integration Specs" (show API format)

4. Documentation Mode:
   - Add tooltips explaining features
   - Info icons with explanations of medical terms
   - "How it works" modal explaining the data flow

5. Professional Touches:
   - Favicon for both apps
   - Loading screens
   - Error boundaries
   - 404 pages
   - Professional font (Inter or similar)
   - Consistent spacing and alignment
   - Accessibility (ARIA labels, keyboard navigation)

6. Mobile Responsiveness:
   - Ensure both apps work on tablets (iPad size minimum)
   - Touch-friendly button sizes
   - Proper viewport settings

7. Performance:
   - Optimize re-renders
   - Debounce voice input parsing
   - Lazy load workflow components

8. README Documentation:
   Create a README.md with:
   - Project overview
   - Setup instructions
   - How to run both apps simultaneously
   - Demo walkthrough steps
   - Architecture diagram (ASCII art is fine)
   - Technology stack explanation
   - Future enhancements section

Include a "Demo Script" section in README with:
- Recommended presentation flow
- Sample phrases to use for voice demo
- Key points to highlight during demo
```

**Final testing and polish**

---

## STEP 11: Testing & Validation

**Prompt for Claude Code:**

```
STEP 11: Create a testing checklist and validate all features

Create a testing document (TESTING.md) that covers:

1. Functional Testing Checklist:
   □ Voice recording starts/stops correctly
   □ Transcript appears in real-time
   □ Parser correctly extracts data from transcript
   □ All workflow forms display correctly
   □ Data validation works
   □ Entries save to localStorage
   □ EHR dashboard receives data in real-time
   □ Patient list updates with new entries
   □ Export formats display correctly (FHIR, HL7)
   □ Demo mode functions work
   □ Clear/reset functions work
   □ Mobile responsive layout works

2. Browser Compatibility:
   - Test on Chrome (primary)
   - Test on Edge
   - Note Safari limitations with Web Speech API
   - Document any browser-specific issues

3. Edge Cases:
   - What happens when localStorage is full?
   - What happens if voice recognition fails?
   - What happens with very long transcripts?
   - What happens if nurse closes app mid-recording?

4. Demo Scenario Testing:
   Test each workflow with sample nurse phrases:
   - Vital signs documentation
   - Medication administration
   - Patient assessment
   - Wound care
   - Shift handoff

5. Performance Testing:
   - Test with 50+ entries in localStorage
   - Test real-time updates with rapid entries
   - Check memory usage

Create a validation script that automatically checks:
- All localStorage keys are present
- Data structure matches TypeScript types
- No console errors
- All components render without errors

Also create a "Demo Rehearsal Checklist":
1. Open Nurse App in one browser window
2. Open EHR Dashboard in another window (arrange side-by-side)
3. Load demo data
4. Select Patient Assessment workflow
5. Click microphone button
6. Say sample phrase
7. Verify parsing
8. Click "Send to EHR"
9. Verify data appears in EHR dashboard
10. Show export formats
```

---

## Final Deliverable Checklist

When all steps are complete, you should have:

- ✅ **Nurse App** - Fully functional voice documentation interface
- ✅ **EHR Dashboard** - Professional mock EHR receiving data
- ✅ **Real-time communication** - Data flows between apps instantly
- ✅ **5 workflow templates** - Patient Assessment, Vitals, Meds, Wound, Handoff
- ✅ **Intelligent parsing** - Voice converts to structured data
- ✅ **Professional UI** - Healthcare-appropriate design
- ✅ **Demo features** - Easy to present and explain
- ✅ **Documentation** - README, testing guide, demo script
- ✅ **Mobile responsive** - Works on tablets
- ✅ **Export formats** - FHIR, HL7 examples

---

## Tips for Using This Prompt with Claude Code

1. **Execute step-by-step** - Don't skip ahead
2. **Test after each step** - Verify functionality before moving on
3. **Ask for clarifications** - If something isn't working, ask Claude Code to debug
4. **Request modifications** - Feel free to ask for UI changes, additional features
5. **Save frequently** - Make sure code is committed/saved after each major step

## Presentation Tips

When demoing this to Marcel:
1. Have both apps open side-by-side on one screen or two monitors
2. Start with EHR dashboard visible but empty
3. Walk through selecting a workflow in Nurse app
4. Use a realistic nursing phrase (prepare 2-3 in advance)
5. Show real-time data appearing in EHR
6. Click to show FHIR/HL7 export formats
7. Emphasize: "This demonstrates understanding of nursing workflows, voice AI challenges, and EHR integration requirements"

Good luck! 🚀
