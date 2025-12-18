# Quick Troubleshooting Steps

If you're getting the error **"Failed to start recording. Please ensure microphone access is allowed"**, follow these steps:

## Step 1: Run the Diagnostic Tool

1. Click the **"Run Diagnostics"** button in the top right corner of the app
2. Click **"Run Diagnostic Tests"**
3. **Allow microphone access** when prompted
4. Review the test results to identify the specific issue

## Step 2: Check Your Browser

The Web Speech API is only supported in:
- ✅ **Chrome 25+**
- ✅ **Edge 79+**
- ✅ **Safari 14.1+**
- ❌ **Firefox** (not supported)

## Step 3: Grant Microphone Permissions

### Chrome / Edge
1. Look for the **camera/microphone icon** in the address bar (right side)
2. Click it
3. Select **"Always allow"** for microphone
4. Refresh the page

### Safari
1. Go to **Safari** menu > **Settings for This Website**
2. Find **Microphone** setting
3. Change to **"Allow"**
4. Refresh the page

## Step 4: Check System Permissions

### Windows 10/11
1. Go to **Settings** > **Privacy** > **Microphone**
2. Make sure **"Allow apps to access your microphone"** is ON
3. Make sure your browser is allowed

### macOS
1. Go to **System Preferences** > **Security & Privacy** > **Microphone**
2. Check the box next to your browser (Chrome/Safari/Edge)

## Step 5: Verify HTTPS

- **Development:** localhost/127.0.0.1 work with HTTP ✅
- **Production:** Must use HTTPS ❌ HTTP won't work

Check your URL bar - it should show:
- `http://localhost:5173` ✅ OK for development
- `http://192.168.x.x:5173` ❌ Won't work - use HTTPS
- `https://your-domain.com` ✅ OK for production

## Step 6: Check Microphone Availability

1. Make sure your microphone is **plugged in** and **recognized by the system**
2. Close other apps that might be using the microphone (Zoom, Teams, Discord, etc.)
3. Try a different microphone if available

## Step 7: Clear Browser Cache & Permissions

1. **Chrome/Edge:**
   - Go to `chrome://settings/content/siteDetails?site=http://localhost:5173`
   - Click **"Clear data"**
   - Refresh the page and allow permissions again

2. **Safari:**
   - Safari > Preferences > Privacy > Manage Website Data
   - Find localhost and remove
   - Refresh the page

## Step 8: Test with Console

Open browser console (F12) and run:

```javascript
// Test 1: Check if Speech Recognition exists
console.log('SpeechRecognition:', window.SpeechRecognition || window.webkitSpeechRecognition);

// Test 2: Try to get microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    console.log('✅ Microphone access granted!');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Microphone access denied:', err));

// Test 3: Try to start speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.onstart = () => {
    console.log('✅ Speech Recognition started!');
    recognition.stop();
  };
  recognition.onerror = (e) => console.error('❌ Speech Recognition error:', e.error);
  recognition.start();
}
```

## Common Error Messages

### "not-allowed" or "permission-denied"
- **Cause:** Browser blocked microphone access
- **Fix:** Click camera icon in address bar, allow access, refresh

### "audio-capture"
- **Cause:** No microphone found or microphone in use
- **Fix:** Check microphone is connected, close other apps using it

### "network"
- **Cause:** No internet connection
- **Fix:** Web Speech API requires internet - check connection

### "no-speech"
- **Cause:** No speech detected
- **Fix:** This is normal if you're not speaking - just a warning

### "not-supported"
- **Cause:** Browser doesn't support Web Speech API
- **Fix:** Use Chrome, Edge, or Safari

## Still Not Working?

1. **Restart your browser** completely (close all windows)
2. **Restart your computer** (fixes system-level permission issues)
3. **Try a different browser** (Chrome is most reliable)
4. **Check the console** for additional error messages (F12)
5. **Review the full [Microphone Permissions Guide](./MICROPHONE_PERMISSIONS_GUIDE.md)**

## Working? Next Steps

Once the diagnostics show all tests passing:
1. Click **"Show Demo"** to go back to the voice recording interface
2. Click **"Start Recording"**
3. Speak clearly into your microphone
4. See your words appear in real-time!
