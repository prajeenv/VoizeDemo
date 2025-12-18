/**
 * Browser Compatibility Utilities
 * Checks and provides information about Web Speech API support
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isSupported: boolean;
  features: {
    speechRecognition: boolean;
    mediaDevices: boolean;
    getUserMedia: boolean;
  };
}

/**
 * Detect browser name and version
 */
export function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let name = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edg')) {
    name = 'Edge';
    const match = userAgent.match(/Edg\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  return { name, version };
}

/**
 * Check if Web Speech API is supported
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Check if MediaDevices API is supported
 */
export function isMediaDevicesSupported(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Get comprehensive browser compatibility information
 */
export function getBrowserInfo(): BrowserInfo {
  const browser = detectBrowser();
  const speechRecognition = isSpeechRecognitionSupported();
  const mediaDevices = isMediaDevicesSupported();

  return {
    name: browser.name,
    version: browser.version,
    isSupported: speechRecognition && mediaDevices,
    features: {
      speechRecognition,
      mediaDevices,
      getUserMedia: mediaDevices,
    },
  };
}

/**
 * Get user-friendly error message for unsupported browsers
 */
export function getUnsupportedBrowserMessage(): string {
  const browserInfo = getBrowserInfo();

  if (browserInfo.isSupported) {
    return '';
  }

  const { name, features } = browserInfo;

  if (!features.speechRecognition) {
    if (name === 'Firefox') {
      return 'Firefox does not support Web Speech API. Please use Chrome, Edge, or Safari for voice recording features.';
    }
    return `Your browser does not support Web Speech API. Please use Chrome (version 25+), Edge (version 79+), or Safari (version 14.1+) for voice recording.`;
  }

  if (!features.mediaDevices) {
    return 'Your browser does not support microphone access. Please update to a modern browser version.';
  }

  return 'Voice recording is not supported in your browser. Please use a modern browser like Chrome, Edge, or Safari.';
}

/**
 * Check if HTTPS is required and if current connection is secure
 */
export function checkSecureContext(): {
  isSecure: boolean;
  message: string;
} {
  const isSecure = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  if (!isSecure) {
    return {
      isSecure: false,
      message: 'Voice recording requires a secure connection (HTTPS). The current page is not secure.',
    };
  }

  return {
    isSecure: true,
    message: 'Secure connection established.',
  };
}

/**
 * Request microphone permissions and check status
 */
export async function checkMicrophonePermission(): Promise<{
  granted: boolean;
  message: string;
}> {
  if (!navigator.permissions) {
    return {
      granted: false,
      message: 'Permission API not supported. Will request permission on recording start.',
    };
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });

    switch (result.state) {
      case 'granted':
        return {
          granted: true,
          message: 'Microphone permission granted.',
        };
      case 'prompt':
        return {
          granted: false,
          message: 'Microphone permission will be requested when you start recording.',
        };
      case 'denied':
        return {
          granted: false,
          message: 'Microphone permission denied. Please enable microphone access in your browser settings.',
        };
      default:
        return {
          granted: false,
          message: 'Unable to determine microphone permission status.',
        };
    }
  } catch (error) {
    return {
      granted: false,
      message: 'Unable to check microphone permission. Will request on recording start.',
    };
  }
}

/**
 * Comprehensive compatibility check
 */
export async function performCompatibilityCheck(): Promise<{
  isCompatible: boolean;
  issues: string[];
  warnings: string[];
  browserInfo: BrowserInfo;
}> {
  const issues: string[] = [];
  const warnings: string[] = [];

  const browserInfo = getBrowserInfo();
  const secureContext = checkSecureContext();
  const micPermission = await checkMicrophonePermission();

  // Critical issues that prevent usage
  if (!browserInfo.features.speechRecognition) {
    issues.push(getUnsupportedBrowserMessage());
  }

  if (!browserInfo.features.mediaDevices) {
    issues.push('MediaDevices API is not supported in your browser.');
  }

  if (!secureContext.isSecure) {
    issues.push(secureContext.message);
  }

  // Warnings that might affect usage
  if (!micPermission.granted && micPermission.message.includes('denied')) {
    warnings.push(micPermission.message);
  }

  const isCompatible = issues.length === 0;

  return {
    isCompatible,
    issues,
    warnings,
    browserInfo,
  };
}

export default {
  detectBrowser,
  isSpeechRecognitionSupported,
  isMediaDevicesSupported,
  getBrowserInfo,
  getUnsupportedBrowserMessage,
  checkSecureContext,
  checkMicrophonePermission,
  performCompatibilityCheck,
};
