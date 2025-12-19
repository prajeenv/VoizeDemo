# Cross-Port Communication Debugging Guide

## Problem
After clicking "Send to EHR" in the nurse app (port 5173), the reading is not appearing in the EHR dashboard (port 5184).

## Changes Made
Added comprehensive debugging logs to track the entire communication flow between apps.

## Testing Steps

### 1. Open Both Apps
1. **Nurse App**: Open `http://localhost:5173` in one browser tab
2. **EHR Dashboard**: Open `http://localhost:5184` in another browser tab

### 2. Open Browser Console for Both Tabs
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux) / `Cmd+Option+I` (Mac)
- Go to the "Console" tab in DevTools

### 3. Check Initial Logs

#### In EHR Dashboard (5184), you should see:
```
🔊 EHR Dashboard: Loading entries from storageService
✅ Loaded [X] entries
🔊 EHR Dashboard: Subscribing to new entries
🔊 Opening BroadcastChannel for listening...
✅ BroadcastChannel listener established
✅ Subscription active
```

#### In Nurse App (5173), you should see:
```
(Initial setup logs)
```

### 4. Create and Send an Entry
1. In the **Nurse App**, create a new documentation entry:
   - Select a patient
   - Choose a workflow type
   - Record or type some documentation
   - Click "Send to EHR"

### 5. Watch the Console Logs

#### In Nurse App Console, you should see:
```
📤 [NURSE APP] Preparing to send entry to EHR: {...}
📤 [NURSE APP] Calling storageService.sendToEHR...
📡 Broadcasting entry via BroadcastChannel: [entry-id]
✅ Broadcast successful
✅ [NURSE APP] Sent to EHR successfully!
📊 [NURSE APP] Entry data sent: {...}
```

#### In EHR Dashboard Console, you should see:
```
📨 Received BroadcastChannel message: {type: 'NEW_ENTRY', entry: {...}}
📥 New entry received via BroadcastChannel: [entry-id]
✅ Entry is new, calling callback
📥 New entry received: {...}
✅ Adding new entry to list
```

## Troubleshooting

### Issue 1: "BroadcastChannel not supported"
**Symptom**: You see `⚠️ BroadcastChannel not supported in this browser`

**Solution**:
- Update your browser (BroadcastChannel is supported in Chrome 54+, Firefox 38+, Edge 79+)
- The system will fall back to polling (checks every 1 second)

### Issue 2: Broadcast sent but not received
**Symptom**:
- Nurse app shows: `✅ Broadcast successful`
- EHR dashboard shows: No "📨 Received BroadcastChannel message"

**Possible Causes**:
1. **Different browser instances**: BroadcastChannel only works within the same browser
   - ✅ WORKS: Two tabs in the same Chrome window
   - ❌ DOESN'T WORK: One tab in Chrome, one in Firefox
   - ❌ DOESN'T WORK: Two separate Chrome processes

2. **Incognito/Private mode**: Each incognito window is isolated
   - Solution: Use regular browser windows, not incognito

3. **Browser extensions blocking**: Ad blockers or privacy extensions might interfere
   - Solution: Try disabling extensions temporarily

### Issue 3: Entry received but not displayed
**Symptom**:
- EHR dashboard shows: `📥 New entry received via BroadcastChannel`
- But the entry doesn't appear in the UI

**Possible Causes**:
1. Patient mismatch: Entry is for a different patient
   - Solution: Make sure you've selected the same patient in EHR dashboard

2. Duplicate detection: Entry already exists
   - You'll see: `⚠️ Entry already exists, skipping`
   - Solution: Create a new entry instead

### Issue 4: No logs appear at all
**Symptom**: No console logs appear in either app

**Possible Causes**:
1. Apps not running: Make sure both dev servers are running
2. Wrong ports: Verify the correct URLs (5173 for nurse, 5184 for EHR)
3. Console filtered: Check console filter settings (should show "All levels")

## Expected Behavior After Fix

When you click "Send to EHR":
1. ✅ Entry appears in nurse app's history
2. ✅ Green notification appears at top of EHR dashboard
3. ✅ Entry appears in the selected patient's documentation list
4. ✅ Red badge count updates on patient card (if within 2 hours)
5. ✅ Dashboard stats update (entries today, time saved, etc.)

## Manual Verification

### Check localStorage
Open console in **either** app and run:
```javascript
JSON.parse(localStorage.getItem('voize_entries'))
```

This should show all stored entries. If entries are here but not displaying:
- The storage is working
- The issue is with the UI subscription/rendering

### Force Refresh
In EHR dashboard:
1. Press `Ctrl+Shift+R` (hard refresh)
2. Check if entries appear
3. If they do, the BroadcastChannel is the issue

## Next Steps

After following these steps, report back with:
1. What logs you see in the Nurse App console
2. What logs you see in the EHR Dashboard console
3. Any error messages or warnings
4. Which symptom from "Troubleshooting" matches your situation

This will help identify the exact cause of the communication failure.
