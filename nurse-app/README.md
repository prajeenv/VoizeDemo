# Voize Nurse Documentation App

Voice-to-text nursing workflow assistant built with React, TypeScript, and Vite.

## 🎯 Recent Voice Recognition Improvements

**Three critical issues fixed:**
1. ✅ **"No speech detected" errors eliminated** - Auto-restart prevents timeout interruptions during natural pauses
2. ✅ **Faster, more accurate transcription** - Intelligent selection from 3 alternatives with medical pattern detection
3. ✅ **Correct medical numbers** - "BP 120 80" transcribes accurately instead of "BP 2018"

📖 **See [VOICE_RECOGNITION_FIXES.md](VOICE_RECOGNITION_FIXES.md) for complete technical details**

## Project Overview

A demo application showcasing voice recording and speech-to-text functionality for nursing documentation workflows. The system supports real-time transcription optimized for medical terminology with post-processing fixes for common medical phrases.

## Features

### Voice Recording & Transcription
- ✅ Real-time voice-to-text transcription optimized for medical terminology
- ✅ Browser compatibility detection (Chrome, Edge, Safari)
- ✅ Pause/Resume recording functionality
- ✅ Error handling and user feedback
- ✅ Medical pattern detection (vitals, medications, assessments)

### Workflow Templates (NEW in Step 4)
- ✅ **Patient Assessment** - LOC, mobility, pain, skin condition
- ✅ **Vital Signs** - BP, HR, temp, RR, SpO2 with auto-fill
- ✅ **Medication Administration** - Drug name, dosage, route, response
- ✅ **Wound Care** - Location, size, drainage, treatment
- ✅ **Shift Handoff** - SBAR format documentation

### Auto-fill & Validation
- ✅ Intelligent field auto-population from voice transcript
- ✅ Visual indicators for auto-filled fields
- ✅ Form validation with error messages
- ✅ Editable transcripts with re-parsing
- ✅ Range validation for vital signs

### Technical Foundation
- ✅ Comprehensive TypeScript type system with medical standards (LOINC, FHIR, HL7)
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Medical vocabulary processing
- ✅ Structured data extraction from natural speech

## Project Structure

```
nurse-app/
├── src/
│   ├── components/
│   │   ├── WorkflowContainer.tsx     # Main workflow integration (NEW)
│   │   ├── WorkflowSelector.tsx      # Workflow selection UI (NEW)
│   │   ├── VoiceRecordingDemo.tsx    # Demo component with full UI
│   │   ├── MicrophoneTest.tsx        # Diagnostics tool
│   │   └── ...
│   ├── workflows/                    # Workflow templates (NEW)
│   │   ├── WorkflowBase.tsx          # Shared components & utilities
│   │   ├── transcriptParser.ts       # Voice parsing utilities
│   │   ├── PatientAssessment.tsx     # Patient assessment workflow
│   │   ├── VitalSigns.tsx            # Vital signs workflow
│   │   ├── MedicationAdministration.tsx  # Medication workflow
│   │   ├── WoundCare.tsx             # Wound care workflow
│   │   ├── ShiftHandoff.tsx          # Shift handoff workflow
│   │   └── index.ts                  # Workflow exports
│   ├── hooks/
│   │   └── useVoiceRecording.ts      # React hook for voice recording
│   ├── services/
│   │   └── voiceService.ts           # Core Web Speech API service
│   ├── utils/
│   │   ├── medicalVocabulary.ts      # Medical term processing
│   │   └── browserCompatibility.ts   # Browser detection utilities
│   └── App.tsx                       # Main app component
├── VOICE_SERVICE_README.md           # Voice service documentation
└── README.md                         # This file
```

## Development Progress

### ✅ STEP 1: Project Setup & Architecture
- React + TypeScript + Vite
- Tailwind CSS configuration
- Project structure

### ✅ STEP 2: Shared Types & Data Models
- Medical workflow types (8 types)
- LOINC code integration
- FHIR/HL7 compliant structures
- Comprehensive TypeScript interfaces

### ✅ STEP 3: Voice Recording & Speech-to-Text Service
- Web Speech API integration
- `voiceService.ts` - Core service class
- `useVoiceRecording` - React hook
- Browser compatibility utilities
- Real-time transcription
- Error handling
- Pause/Resume functionality
- Demo component with full UI
- Medical vocabulary processing

### ✅ STEP 4: Workflow Template Components
- 5 complete workflow forms with voice integration
- Intelligent auto-fill from voice transcripts
- Visual indicators for auto-filled fields
- Form validation with error handling
- Editable transcripts with re-parsing
- Workflow selector with 5 documentation types
- Comprehensive transcript parsing utilities
- Structured data extraction

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Modern browser (Chrome 25+, Edge 79+, or Safari 14.1+)
- HTTPS connection (or localhost for development)

### Installation

```bash
cd nurse-app
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

### Workflow Documentation

1. **Select a Workflow**: Choose from 5 documentation types on the home screen
2. **Start Recording**: Click "Start Recording" and speak your documentation
3. **Auto-fill Magic**: Watch fields populate automatically from your voice
4. **Review & Edit**: Edit auto-filled values or transcript as needed
5. **Submit**: Complete the form and submit

### Example Voice Input

**Vital Signs:**
> "Blood pressure 120 over 80. Heart rate 72 beats per minute. Temperature 98.6 degrees. Respiratory rate 16. Oxygen saturation 98 percent."

**Result**: Auto-fills BP (120/80), HR (72), Temp (98.6°F), RR (16), SpO2 (98%)

**Medication:**
> "Patient PT54321. Administered aspirin 500 milligrams by mouth at 14:30."

**Result**: Auto-fills Patient ID, Medication Name (aspirin), Dosage (500 mg), Route (PO)

### Voice Recording Hook Usage

```tsx
import { useVoiceRecording } from './hooks/useVoiceRecording';

function MyComponent() {
  const {
    isRecording,
    currentTranscript,
    startRecording,
    stopRecording,
  } = useVoiceRecording({
    continuous: true,
    interimResults: true,
    enableMedicalProcessing: true,
  });

  return (
    <div>
      <button onClick={startRecording}>Start</button>
      <button onClick={stopRecording}>Stop</button>
      <p>{currentTranscript}</p>
    </div>
  );
}
```

For detailed API documentation, see [VOICE_SERVICE_README.md](./VOICE_SERVICE_README.md)

## Browser Support

| Browser | Version | Voice Recording |
|---------|---------|-----------------|
| Chrome  | 25+     | ✅ Fully supported |
| Edge    | 79+     | ✅ Fully supported |
| Safari  | 14.1+   | ✅ Fully supported |
| Firefox | All     | ❌ Not supported |

## Technologies

- **React 19** - UI framework
- **TypeScript 5.6** - Type safety
- **Vite 7** - Build tool & dev server
- **Tailwind CSS 3** - Styling
- **Web Speech API** - Voice recognition

## Medical Standards Compliance

The application includes TypeScript types for:
- **LOINC Codes** - Laboratory observation identifiers
- **FHIR** - Fast Healthcare Interoperability Resources
- **HL7** - Health Level 7 standards
- **8 Workflow Types** - Nursing documentation workflows

## Configuration

### Voice Service Configuration

Edit [src/services/voiceService.ts:89-107](src/services/voiceService.ts#L89-L107) to customize:

```typescript
{
  continuous: true,          // Keep listening after pauses
  interimResults: true,      // Show real-time results
  language: 'en-US',         // Recognition language
  maxAlternatives: 1         // Number of alternatives
}
```

### Tailwind Configuration

Edit [tailwind.config.js](../tailwind.config.js) for theme customization.

## Security Considerations

1. **HTTPS Required** - Production must use HTTPS
2. **Microphone Permission** - User consent required
3. **Client-Side Processing** - All transcription happens in browser
4. **No Server Storage** - Privacy-focused design

## Troubleshooting

### Microphone Permission Issues

**For detailed troubleshooting, see [MICROPHONE_PERMISSIONS_GUIDE.md](./MICROPHONE_PERMISSIONS_GUIDE.md)**

Quick fixes:
- **Allow microphone access** when browser prompts
- Click the **lock/camera icon** in address bar to manage permissions
- Ensure no other app is using the microphone
- Reload the page after granting permissions
- Production requires **HTTPS** (localhost works with HTTP)

### Poor Transcription Quality
- Use a quality microphone
- Reduce background noise
- Speak clearly at moderate pace
- Ensure stable internet connection

### Browser Compatibility
- Check [src/utils/browserCompatibility.ts:117](src/utils/browserCompatibility.ts#L117)
- Test with demo component
- Use supported browsers (Chrome, Edge, Safari)

## Testing

The [VoiceRecordingDemo](src/components/VoiceRecordingDemo.tsx) component provides:
- Browser compatibility check
- Full recording controls
- Real-time transcript display
- Final vs interim transcript separation
- Error display
- Usage instructions

## Next Steps

- [ ] Workflow selection UI
- [ ] Note template system
- [ ] Data persistence (localStorage/backend)
- [ ] Export functionality
- [ ] Integration with EHR Dashboard
- [ ] Multi-language support

## Documentation

- [Voice Service API Documentation](./VOICE_SERVICE_README.md)
- [Microphone Permissions Guide](./MICROPHONE_PERMISSIONS_GUIDE.md)
- [Shared Types Documentation](../../SHARED_TYPES.md) (if exists)
- [Web Speech API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## Contributing

This is a demo project. For production use:
1. Add comprehensive error logging
2. Implement backend integration
3. Add user authentication
4. Enhance medical terminology recognition
5. Add data persistence layer

## License

Part of the Voize Demo project for nursing documentation.

---

## React + Vite Template Info

This template uses:
- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) - Babel for Fast Refresh

For production applications, consider:
- Type-aware ESLint rules
- React Compiler (see Vite docs)
- Additional React plugins
