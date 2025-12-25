/**
 * Voice Recording Service
 * Implements Web Speech API for real-time voice-to-text transcription
 * Optimized for medical terminology and nursing documentation
 */

export interface VoiceServiceConfig {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  grammars?: SpeechGrammarList;
}

export interface VoiceRecognitionState {
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  currentTranscript: string;
  finalTranscript: string;
  interimTranscript: string;
  error: VoiceRecognitionError | null;
  isSupported: boolean;
}

export interface VoiceRecognitionError {
  type: 'not-supported' | 'permission-denied' | 'network' | 'no-speech' | 'aborted' | 'audio-capture' | 'unknown';
  message: string;
  originalError?: Error;
}

export type VoiceRecognitionEventType =
  | 'start'
  | 'end'
  | 'result'
  | 'error'
  | 'nomatch'
  | 'soundstart'
  | 'soundend'
  | 'speechstart'
  | 'speechend';

export interface VoiceRecognitionCallbacks {
  onTranscriptUpdate?: (transcript: string, isFinal: boolean) => void;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: VoiceRecognitionError) => void;
  onSoundStart?: () => void;
  onSoundEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onProcessingStart?: () => void;
  onProcessingEnd?: () => void;
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isInitialized = false;
  private isPaused = false;
  private isRecording = false;
  private isProcessing = false;
  private finalTranscript = '';
  private interimTranscript = '';
  private callbacks: VoiceRecognitionCallbacks = {};
  private processingTimeout: number | null = null;

  constructor() {
    this.checkBrowserSupport();
  }

  /**
   * Check if browser supports Web Speech API
   */
  private checkBrowserSupport(): boolean {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    return !!SpeechRecognition;
  }

  /**
   * Detect if a transcript contains medical numeric patterns
   * Helps prioritize alternatives that contain vital signs, dosages, etc.
   */
  private isMedicalNumericPattern(transcript: string): boolean {
    // Common medical numeric patterns
    const patterns = [
      /\b\d{2,3}\s*\/\s*\d{2,3}\b/i, // Blood pressure: 120/80
      /\b\d{2,3}\s+\d{2,3}\b/, // Separated numbers: 120 80
      /\b\d+\s*(mg|ml|mcg|units?|cc)\b/i, // Dosages: 10 mg
      /\b\d+\.?\d*\s*degrees?\b/i, // Temperature: 98.6 degrees
      /\b\d+\s*(bpm|beats)\b/i, // Heart rate: 72 bpm
      /\bBP\s*\d/i, // BP followed by number
      /\b(systolic|diastolic)\s*\d/i, // Systolic/Diastolic numbers
    ];

    return patterns.some(pattern => pattern.test(transcript));
  }

  /**
   * Check if Web Speech API is supported
   */
  isSupported(): boolean {
    return this.checkBrowserSupport();
  }

  /**
   * Initialize the speech recognition service
   */
  initialize(config: VoiceServiceConfig = {}, callbacks: VoiceRecognitionCallbacks = {}): void {
    if (!this.checkBrowserSupport()) {
      const error: VoiceRecognitionError = {
        type: 'not-supported',
        message: 'Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.',
      };
      callbacks.onError?.(error);
      throw new Error(error.message);
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    this.recognition = recognition;
    this.callbacks = callbacks;

    // Configure recognition
    recognition.continuous = config.continuous ?? true;
    recognition.interimResults = config.interimResults ?? true;
    recognition.lang = config.language ?? 'en-US';
    recognition.maxAlternatives = config.maxAlternatives ?? 1; // Use single best result for faster processing

    // Add custom grammars if provided (for medical terminology and numbers)
    if (config.grammars) {
      recognition.grammars = config.grammars;
    }

    // Set up event handlers
    this.setupEventHandlers();
    this.isInitialized = true;
  }

  /**
   * Set up all event handlers for speech recognition
   */
  private setupEventHandlers(): void {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.isPaused = false;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.callbacks.onEnd?.();
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];

        // Try to find the best alternative, especially for medical terms and numbers
        let bestTranscript = result[0].transcript;
        let highestConfidence = result[0].confidence;

        // Check all alternatives if available
        for (let j = 0; j < result.length; j++) {
          const alternative = result[j];

          // Prefer alternatives that contain numeric patterns for vital signs
          if (this.isMedicalNumericPattern(alternative.transcript)) {
            bestTranscript = alternative.transcript;
            break;
          }

          // Otherwise use highest confidence
          if (alternative.confidence > highestConfidence) {
            bestTranscript = alternative.transcript;
            highestConfidence = alternative.confidence;
          }
        }

        if (result.isFinal) {
          final += bestTranscript + ' ';
        } else {
          interim += bestTranscript;
        }
      }

      if (final) {
        this.finalTranscript += final;
        this.interimTranscript = '';
        // Stop processing indicator when final result arrives
        this.stopProcessing();
        this.callbacks.onTranscriptUpdate?.(this.finalTranscript.trim(), true);
      } else if (interim) {
        this.interimTranscript = interim;
        const currentText = (this.finalTranscript + ' ' + interim).trim();
        this.callbacks.onTranscriptUpdate?.(currentText, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Ignore 'no-speech' errors if we already have some transcript
      // This prevents the common timeout issue when user pauses between words
      if (event.error === 'no-speech' && this.finalTranscript.trim().length > 0) {
        console.log('No speech detected but continuing (already have transcript)');
        return;
      }

      // Reset recording and processing state on error
      this.isRecording = false;
      this.stopProcessing();

      const error = this.handleRecognitionError(event);
      this.callbacks.onError?.(error);
    };

    this.recognition.onnomatch = () => {
      console.log('No speech was recognized');
    };

    this.recognition.onsoundstart = () => {
      this.callbacks.onSoundStart?.();
    };

    this.recognition.onsoundend = () => {
      this.callbacks.onSoundEnd?.();
    };

    this.recognition.onspeechstart = () => {
      this.callbacks.onSpeechStart?.();
    };

    this.recognition.onspeechend = () => {
      // Start processing indicator when speech ends (waiting for network response)
      this.startProcessing();
      this.callbacks.onSpeechEnd?.();
    };
  }

  /**
   * Start processing indicator (called when speech ends, waiting for final result)
   */
  private startProcessing(): void {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.callbacks.onProcessingStart?.();

    // Clear any existing timeout
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
    }

    // Auto-clear processing state after 5 seconds if no result
    this.processingTimeout = window.setTimeout(() => {
      this.stopProcessing();
    }, 5000);
  }

  /**
   * Stop processing indicator (called when final result arrives)
   */
  private stopProcessing(): void {
    if (!this.isProcessing) return;

    this.isProcessing = false;
    this.callbacks.onProcessingEnd?.();

    // Clear timeout
    if (this.processingTimeout) {
      clearTimeout(this.processingTimeout);
      this.processingTimeout = null;
    }
  }

  /**
   * Handle recognition errors and convert to structured error format
   */
  private handleRecognitionError(event: SpeechRecognitionErrorEvent): VoiceRecognitionError {
    let errorType: VoiceRecognitionError['type'] = 'unknown';
    let message = 'An unknown error occurred';

    switch (event.error) {
      case 'not-allowed':
      case 'permission-denied':
        errorType = 'permission-denied';
        message = 'Microphone permission denied. Please allow microphone access to use voice recording.';
        break;
      case 'no-speech':
        errorType = 'no-speech';
        message = 'No speech was detected. Please try again.';
        break;
      case 'aborted':
        errorType = 'aborted';
        message = 'Speech recognition was aborted.';
        break;
      case 'audio-capture':
        errorType = 'audio-capture';
        message = 'No microphone was found. Please ensure a microphone is connected.';
        break;
      case 'network':
        errorType = 'network';
        message = 'Network error occurred. Please check your internet connection.';
        break;
      default:
        message = `Speech recognition error: ${event.error}`;
    }

    return {
      type: errorType,
      message,
      originalError: new Error(event.error),
    };
  }

  /**
   * Start recording
   */
  startRecording(): void {
    if (!this.isInitialized) {
      throw new Error('VoiceService not initialized. Call initialize() first.');
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    // Prevent starting if already recording
    if (this.isRecording) {
      console.warn('Speech recognition is already running');
      return;
    }

    // Clear transcripts from previous recording session
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.isPaused = false;

    try {
      // The error event handler will catch any permission or other errors
      this.recognition.start();
    } catch (error) {
      // Handle the case where start() is called on already started recognition
      console.error('Failed to start recognition:', error);
      this.isRecording = false;
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (!this.recognition) return;

    if (!this.isRecording && !this.isPaused) {
      console.warn('Speech recognition is not running');
      return;
    }

    this.isPaused = false;
    this.isRecording = false;
    this.stopProcessing();
    this.recognition.stop();
  }

  /**
   * Pause recording (stop but maintain state)
   */
  pauseRecording(): void {
    if (!this.recognition) return;

    if (!this.isRecording) {
      console.warn('Cannot pause - speech recognition is not running');
      return;
    }

    this.isPaused = true;
    this.isRecording = false;
    this.recognition.stop();
  }

  /**
   * Resume recording after pause
   */
  resumeRecording(): void {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (!this.isPaused) {
      console.warn('Recording is not paused');
      return;
    }

    if (this.isRecording) {
      console.warn('Speech recognition is already running');
      return;
    }

    this.isPaused = false;

    try {
      // The error event handler will catch any permission or other errors
      this.recognition.start();
    } catch (error) {
      console.error('Failed to resume recognition:', error);
      this.isRecording = false;
      this.isPaused = false;
      throw error;
    }
  }

  /**
   * Get current transcript (final + interim)
   */
  getCurrentTranscript(): string {
    return (this.finalTranscript + ' ' + this.interimTranscript).trim();
  }

  /**
   * Get final transcript only
   */
  getFinalTranscript(): string {
    return this.finalTranscript.trim();
  }

  /**
   * Get interim transcript only
   */
  getInterimTranscript(): string {
    return this.interimTranscript;
  }

  /**
   * Clear all transcripts
   */
  clearTranscripts(): void {
    this.finalTranscript = '';
    this.interimTranscript = '';
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.recognition) {
      if (this.isRecording) {
        this.recognition.stop();
      }
      this.recognition = null;
    }
    this.stopProcessing();
    this.isInitialized = false;
    this.isRecording = false;
    this.isPaused = false;
    this.finalTranscript = '';
    this.interimTranscript = '';
    this.callbacks = {};
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Export class for testing or multiple instances
export default VoiceService;
