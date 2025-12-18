/**
 * React Hook for Voice Recording
 * Provides easy-to-use interface for voice-to-text functionality
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { voiceService } from '../services/voiceService';
import type {
  VoiceServiceConfig,
  VoiceRecognitionState,
  VoiceRecognitionError,
  VoiceRecognitionCallbacks,
} from '../services/voiceService';

export interface UseVoiceRecordingOptions extends VoiceServiceConfig {
  onTranscriptChange?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: VoiceRecognitionError) => void;
  onStart?: () => void;
  onEnd?: () => void;
  autoInitialize?: boolean;
}

export interface UseVoiceRecordingReturn extends VoiceRecognitionState {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => Promise<void>;
  clearTranscript: () => void;
  resetError: () => void;
}

/**
 * Custom hook for voice recording with Web Speech API
 *
 * @example
 * ```tsx
 * const {
 *   isRecording,
 *   currentTranscript,
 *   startRecording,
 *   stopRecording,
 *   error
 * } = useVoiceRecording({
 *   continuous: true,
 *   interimResults: true,
 *   onTranscriptChange: (text) => console.log(text)
 * });
 * ```
 */
export function useVoiceRecording(
  options: UseVoiceRecordingOptions = {}
): UseVoiceRecordingReturn {
  const {
    continuous = true,
    interimResults = true,
    language = 'en-US',
    maxAlternatives = 1,
    onTranscriptChange,
    onError,
    onStart,
    onEnd,
    autoInitialize = true,
  } = options;

  const [state, setState] = useState<VoiceRecognitionState>({
    isRecording: false,
    isPaused: false,
    currentTranscript: '',
    finalTranscript: '',
    interimTranscript: '',
    error: null,
    isSupported: voiceService.isSupported(),
  });

  const isInitializedRef = useRef(false);
  const callbacksRef = useRef<VoiceRecognitionCallbacks>({});

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onTranscriptUpdate: (transcript: string, isFinal: boolean) => {
        setState((prev) => ({
          ...prev,
          currentTranscript: transcript,
          finalTranscript: isFinal ? transcript : prev.finalTranscript,
          interimTranscript: isFinal ? '' : transcript.slice(prev.finalTranscript.length).trim(),
        }));
        onTranscriptChange?.(transcript, isFinal);
      },
      onStart: () => {
        setState((prev) => ({ ...prev, isRecording: true, isPaused: false, error: null }));
        onStart?.();
      },
      onEnd: () => {
        setState((prev) => ({ ...prev, isRecording: false }));
        onEnd?.();
      },
      onError: (error: VoiceRecognitionError) => {
        setState((prev) => ({ ...prev, error, isRecording: false, isPaused: false }));
        onError?.(error);
      },
    };
  }, [onTranscriptChange, onError, onStart, onEnd]);

  // Initialize voice service
  useEffect(() => {
    if (!autoInitialize || !state.isSupported || isInitializedRef.current) {
      return;
    }

    try {
      voiceService.initialize(
        {
          continuous,
          interimResults,
          language,
          maxAlternatives,
        },
        callbacksRef.current
      );
      isInitializedRef.current = true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as VoiceRecognitionError,
      }));
    }

    return () => {
      if (isInitializedRef.current) {
        voiceService.destroy();
        isInitializedRef.current = false;
      }
    };
  }, [continuous, interimResults, language, maxAlternatives, autoInitialize, state.isSupported]);

  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      const error: VoiceRecognitionError = {
        type: 'not-supported',
        message: 'Web Speech API is not supported in this browser',
      };
      setState((prev) => ({ ...prev, error }));
      onError?.(error);
      return;
    }

    if (!isInitializedRef.current) {
      try {
        voiceService.initialize(
          {
            continuous,
            interimResults,
            language,
            maxAlternatives,
          },
          callbacksRef.current
        );
        isInitializedRef.current = true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as VoiceRecognitionError,
        }));
        return;
      }
    }

    try {
      await voiceService.startRecording();
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as VoiceRecognitionError,
        isRecording: false,
      }));
    }
  }, [state.isSupported, continuous, interimResults, language, maxAlternatives, onError]);

  const stopRecording = useCallback(() => {
    voiceService.stopRecording();
    setState((prev) => ({ ...prev, isRecording: false, isPaused: false }));
  }, []);

  const pauseRecording = useCallback(() => {
    voiceService.pauseRecording();
    setState((prev) => ({ ...prev, isPaused: true, isRecording: false }));
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      await voiceService.resumeRecording();
      setState((prev) => ({ ...prev, isPaused: false, isRecording: true }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as VoiceRecognitionError,
        isPaused: false,
        isRecording: false,
      }));
    }
  }, []);

  const clearTranscript = useCallback(() => {
    voiceService.clearTranscripts();
    setState((prev) => ({
      ...prev,
      currentTranscript: '',
      finalTranscript: '',
      interimTranscript: '',
    }));
  }, []);

  const resetError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearTranscript,
    resetError,
  };
}

export default useVoiceRecording;
