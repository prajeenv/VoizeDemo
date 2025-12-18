# Microphone Permission Troubleshooting Guide

## Common Issues and Solutions

### Browser Permission Issues

The Web Speech API requires microphone access. Here's how to grant permissions in different browsers:

#### Chrome / Edge
1. Click the **lock icon** or **camera icon** in the address bar
2. Find "Microphone" in the permissions list
3. Set it to **"Allow"**
4. Refresh the page

#### Safari
1. Go to **Safari** > **Settings for This Website** (or **Preferences** > **Websites** > **Microphone**)
2. Find your website in the list
3. Change permission to **"Allow"**
4. Refresh the page

#### Firefox
1. Click the **lock icon** in the address bar
2. Click the arrow next to "Connection secure"
3. Click **"More information"**
4. Go to the **Permissions** tab
5. Find "Use the Microphone" and uncheck **"Use Default"**
6. Select **"Allow"**
7. Refresh the page

### HTTPS Requirement

**Important:** The Web Speech API requires a secure context (HTTPS) in production.

- **Development:** `localhost` and `127.0.0.1` work with HTTP
- **Production:** Must use HTTPS

If you're getting permission errors on a deployed site, ensure you're using HTTPS.

### Testing Microphone Access

To verify your microphone is working:

1. **Check system settings:**
   - **Windows:** Settings > Privacy > Microphone
   - **macOS:** System Preferences > Security & Privacy > Microphone
   - **Linux:** System Settings > Privacy > Microphone

2. **Test in browser console:**
   ```javascript
   navigator.mediaDevices.getUserMedia({ audio: true })
     .then(stream => {
       console.log('Microphone access granted!');
       stream.getTracks().forEach(track => track.stop());
     })
     .catch(err => console.error('Microphone access denied:', err));
   ```

3. **Check browser permissions:**
   - Chrome: `chrome://settings/content/microphone`
   - Edge: `edge://settings/content/microphone`
   - Firefox: `about:preferences#privacy` > Permissions > Microphone

### Common Error Messages

#### "Failed to access microphone. Please grant permission."
- The browser blocked microphone access
- Click the microphone icon in the address bar and allow access
- Refresh the page and try again

#### "Web Speech API is not supported in this browser"
- Your browser doesn't support the Web Speech API
- Try using Chrome, Edge, or Safari (latest versions)

#### "No microphone was found"
- No microphone is connected to your device
- Check that your microphone is plugged in and recognized by your OS
- Try a different microphone

#### "Network error occurred"
- Web Speech API requires internet connection (uses cloud-based recognition)
- Check your internet connection
- Try again when connection is restored

### Reset Permissions

If permissions seem stuck:

1. **Clear site permissions:**
   - Chrome/Edge: Settings > Privacy and security > Site Settings > View permissions and data stored across sites
   - Find your site and click "Clear data"

2. **Hard refresh:**
   - Windows/Linux: `Ctrl + Shift + R`
   - macOS: `Cmd + Shift + R`

3. **Clear browser cache:**
   - This can help reset permission states

### Browser Compatibility

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 25+     | ✅ Full |
| Edge    | 79+     | ✅ Full |
| Safari  | 14.1+   | ✅ Full |
| Firefox | ❌      | Not supported |
| Opera   | 27+     | ✅ Full |

### Development Tips

1. **Always test on HTTPS in production** - HTTP won't work except on localhost
2. **Request permissions early** - The Web Speech API handles permission requests automatically when you call `start()`
3. **Handle permission denials gracefully** - Show clear error messages to users
4. **Provide fallback options** - Allow manual text entry if voice recording fails

### Security Considerations

- Microphone access is a powerful permission - only request it when needed
- The Web Speech API sends audio to cloud services for processing
- Users should be informed that audio is processed remotely
- Consider privacy implications for sensitive medical data
- In production, ensure secure transmission (HTTPS)

## Implementation in This App

The voice service automatically handles permissions:

```typescript
import { useVoiceRecording } from './hooks/useVoiceRecording';

function MyComponent() {
  const { startRecording, error } = useVoiceRecording({
    onError: (error) => {
      if (error.type === 'permission-denied') {
        // Show user-friendly permission instructions
        alert('Please allow microphone access to use voice recording');
      }
    }
  });

  return (
    <button onClick={startRecording}>
      Start Recording
    </button>
  );
}
```

When you click "Start Recording", the browser will automatically prompt for microphone permission if it hasn't been granted yet.
