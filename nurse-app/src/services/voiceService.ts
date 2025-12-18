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
}

export interface VoiceRecognitionState {
  isRecording: boolean;
  isPaused: boolean;
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
}

class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private isInitialized = false;
  private isPaused = false;
  private finalTranscript = '';
  private interimTranscript = '';
  private callbacks: VoiceRecognitionCallbacks = {};

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
    recognition.maxAlternatives = config.maxAlternatives ?? 1;

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
      this.isPaused = false;
      this.callbacks.onStart?.();
    };

    this.recognition.onend = () => {
      // If not paused and was recording, restart (for continuous mode)
      if (!this.isPaused && this.recognition && this.isInitialized) {
        try {
          // Don't auto-restart, let the user control it
          this.callbacks.onEnd?.();
        } catch (error) {
          console.error('Recognition ended', error);
        }
      } else {
        this.callbacks.onEnd?.();
      }
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        this.finalTranscript += final;
        this.interimTranscript = '';
        this.callbacks.onTranscriptUpdate?.(this.finalTranscript.trim(), true);
      } else if (interim) {
        this.interimTranscript = interim;
        const currentText = (this.finalTranscript + ' ' + interim).trim();
        this.callbacks.onTranscriptUpdate?.(currentText, false);
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
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
      this.callbacks.onSpeechEnd?.();
    };
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
  async startRecording(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('VoiceService not initialized. Call initialize() first.');
    }

    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      this.isPaused = false;
      this.finalTranscript = '';
      this.interimTranscript = '';
      this.recognition.start();
    } catch (error) {
      const voiceError: VoiceRecognitionError = {
        type: 'permission-denied',
        message: 'Failed to access microphone. Please grant permission.',
        originalError: error as Error,
      };
      this.callbacks.onError?.(voiceError);
      throw voiceError;
    }
  }

  /**
   * Stop recording
   */
  stopRecording(): void {
    if (!this.recognition) return;

    this.isPaused = false;
    this.isInitialized = false;
    this.recognition.stop();
  }

  /**
   * Pause recording (stop but maintain state)
   */
  pauseRecording(): void {
    if (!this.recognition) return;

    this.isPaused = true;
    this.recognition.stop();
  }

  /**
   * Resume recording after pause
   */
  async resumeRecording(): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (!this.isPaused) {
      console.warn('Recording is not paused');
      return;
    }

    try {
      this.isPaused = false;
      this.recognition.start();
    } catch (error) {
      const voiceError: VoiceRecognitionError = {
        type: 'unknown',
        message: 'Failed to resume recording',
        originalError: error as Error,
      };
      this.callbacks.onError?.(voiceError);
      throw voiceError;
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
      this.recognition.stop();
      this.recognition = null;
    }
    this.isInitialized = false;
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
