# Voice Recording Service Documentation

## Overview

The Voice Recording Service provides a comprehensive solution for voice-to-text transcription using the Web Speech API. It's designed for medical and nursing documentation with real-time transcription, error handling, and browser compatibility checks.

## Features

- ✅ Real-time speech-to-text transcription
- ✅ Browser compatibility detection (Chrome, Edge, Safari)
- ✅ Continuous recording mode
- ✅ Pause/Resume functionality
- ✅ Interim and final transcript separation
- ✅ Comprehensive error handling
- ✅ TypeScript support with full type safety
- ✅ React hooks for easy integration
- ✅ Medical terminology optimization

## Architecture

### Core Components

1. **voiceService.ts** - Core service using Web Speech API
2. **useVoiceRecording.ts** - React hook for easy integration
3. **browserCompatibility.ts** - Browser detection and compatibility checks
4. **VoiceRecordingDemo.tsx** - Demo component showing all features

## Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 25+     | ✅ Full |
| Edge    | 79+     | ✅ Full |
| Safari  | 14.1+   | ✅ Full |
| Firefox | All     | ❌ Not supported |

### Requirements

- **HTTPS**: Required for production (localhost works with HTTP)
- **Microphone Permission**: User must grant microphone access
- **Secure Context**: Must run in a secure context

## Usage

### Basic Usage with React Hook

```tsx
import { useVoiceRecording } from './hooks/useVoiceRecording';

function MyComponent() {
  const {
    isRecording,
    currentTranscript,
    error,
    startRecording,
    stopRecording,
  } = useVoiceRecording({
    continuous: true,
    interimResults: true,
    onTranscriptChange: (transcript, isFinal) => {
      console.log('Transcript:', transcript);
      if (isFinal) {
        console.log('Final:', transcript);
      }
    },
  });

  return (
    <div>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <p>{currentTranscript}</p>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Advanced Usage with Voice Service

```tsx
import { voiceService } from './services/voiceService';

// Initialize
voiceService.initialize({
  continuous: true,
  interimResults: true,
  language: 'en-US',
}, {
  onTranscriptUpdate: (transcript, isFinal) => {
    console.log('Transcript:', transcript);
  },
  onError: (error) => {
    console.error('Error:', error);
  },
});

// Start recording
await voiceService.startRecording();

// Pause recording
voiceService.pauseRecording();

// Resume recording
await voiceService.resumeRecording();

// Stop recording
voiceService.stopRecording();

// Get transcript
const transcript = voiceService.getCurrentTranscript();
```

### Browser Compatibility Check

```tsx
import { performCompatibilityCheck } from './utils/browserCompatibility';

const result = await performCompatibilityCheck();

if (!result.isCompatible) {
  console.error('Issues:', result.issues);
}

console.log('Browser:', result.browserInfo.name);
console.log('Version:', result.browserInfo.version);
```

## API Reference

### useVoiceRecording Hook

#### Options

```typescript
interface UseVoiceRecordingOptions {
  continuous?: boolean;          // Default: true
  interimResults?: boolean;       // Default: true
  language?: string;              // Default: 'en-US'
  maxAlternatives?: number;       // Default: 1
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
  autoInitialize?: boolean;       // Default: true
}
```

#### Return Value

```typescript
interface UseVoiceRecordingReturn {
  isRecording: boolean;
  isPaused: boolean;
  currentTranscript: string;
  finalTranscript: string;
  interimTranscript: string;
  error: VoiceRecognitionError | null;
  isSupported: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  clearTranscript: () => void;
  resetError: () => void;
}
```

### VoiceService Class

#### Methods

- `isSupported(): boolean` - Check if Web Speech API is supported
- `initialize(config, callbacks): void` - Initialize the service
- `startRecording(): Promise<void>` - Start voice recording
- `stopRecording(): void` - Stop recording
- `pauseRecording(): void` - Pause recording (maintains state)
- `resumeRecording(): Promise<void>` - Resume paused recording
- `getCurrentTranscript(): string` - Get current transcript
- `getFinalTranscript(): string` - Get only finalized text
- `getInterimTranscript(): string` - Get only interim text
- `clearTranscripts(): void` - Clear all transcripts
- `destroy(): void` - Clean up resources

#### Configuration

```typescript
interface VoiceServiceConfig {
  continuous?: boolean;        // Keep recognizing after pauses
  interimResults?: boolean;    // Show real-time results
  language?: string;           // Recognition language
  maxAlternatives?: number;    // Number of alternatives
}
```

#### Callbacks

```typescript
interface VoiceRecognitionCallbacks {
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: VoiceRecognitionError) => void;
  onSoundStart?: () => void;
  onSoundEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
}
```

### Error Types

```typescript
type ErrorType =
  | 'not-supported'       // Browser doesn't support Web Speech API
  | 'permission-denied'   // Microphone access denied
  | 'network'            // Network error
  | 'no-speech'          // No speech detected
  | 'aborted'            // Recognition aborted
  | 'audio-capture'      // Audio capture failed
  | 'unknown';           // Unknown error

interface VoiceRecognitionError {
  type: ErrorType;
  message: string;
  originalError?: Error;
}
```

## Best Practices

### 1. Always Check Browser Support

```tsx
const { isSupported, error } = useVoiceRecording();

if (!isSupported) {
  return <div>Your browser doesn't support voice recording</div>;
}
```

### 2. Handle Errors Gracefully

```tsx
const { error } = useVoiceRecording({
  onError: (error) => {
    switch (error.type) {
      case 'permission-denied':
        alert('Please grant microphone permission');
        break;
      case 'no-speech':
        console.log('No speech detected, continuing...');
        break;
      default:
        console.error('Error:', error.message);
    }
  },
});
```

### 3. Provide User Feedback

```tsx
const { isRecording, isPaused } = useVoiceRecording();

return (
  <div>
    <div className={isRecording ? 'recording-indicator' : ''}>
      {isRecording ? '🔴 Recording' : isPaused ? '⏸️ Paused' : '⏹️ Stopped'}
    </div>
  </div>
);
```

### 4. Clean Up on Unmount

The hook automatically cleans up on unmount, but if using the service directly:

```tsx
useEffect(() => {
  voiceService.initialize(config, callbacks);

  return () => {
    voiceService.destroy();
  };
}, []);
```

## Medical Terminology Optimization

The service is configured for English (en-US) which includes medical terminology support. For best results:

1. Speak clearly and at a moderate pace
2. Use standard medical terminology
3. Pause briefly between sentences
4. Spell out unusual abbreviations

## Troubleshooting

### Issue: Microphone Permission Denied

**Solution**: Check browser settings and ensure:
- Microphone is not blocked for the site
- Browser has permission to access microphone
- No other app is using the microphone

### Issue: Recognition Stops Unexpectedly

**Solution**:
- This is normal behavior after periods of silence
- Use continuous mode: `continuous: true`
- Handle the `onEnd` callback to restart if needed

### Issue: Poor Transcription Accuracy

**Solution**:
- Ensure good microphone quality
- Reduce background noise
- Speak clearly and at moderate pace
- Check microphone input levels

### Issue: Network Errors

**Solution**:
- Web Speech API requires internet connection
- Check network connectivity
- Ensure stable internet connection

## Testing

### Running the Demo

```bash
cd nurse-app
npm run dev
```

Navigate to the app and test:
1. Start recording
2. Speak into microphone
3. Observe real-time transcription
4. Test pause/resume
5. Test stop and clear

### Manual Testing Checklist

- [ ] Browser compatibility detected correctly
- [ ] Microphone permission requested
- [ ] Recording starts successfully
- [ ] Real-time transcription appears
- [ ] Interim results update smoothly
- [ ] Final transcript captures correctly
- [ ] Pause/resume works as expected
- [ ] Stop clears recording state
- [ ] Clear removes transcript
- [ ] Errors display properly
- [ ] Works in different browsers (Chrome, Edge, Safari)

## Security Considerations

1. **HTTPS Required**: Production must use HTTPS
2. **Microphone Access**: User consent required
3. **Data Privacy**: Transcripts processed by browser's speech API
4. **No Server Storage**: All processing happens client-side

## Future Enhancements

Potential improvements for future versions:

- [ ] Offline speech recognition
- [ ] Custom medical vocabulary
- [ ] Multiple language support
- [ ] Speaker diarization
- [ ] Punctuation improvements
- [ ] Custom wake words
- [ ] Voice activity detection
- [ ] Audio level monitoring
- [ ] Export transcript functionality
- [ ] Integration with EHR systems

## Support

For issues or questions:
1. Check browser compatibility
2. Review error messages
3. Check console logs
4. Test with demo component

## License

Part of the Voize Demo project for nursing documentation.
