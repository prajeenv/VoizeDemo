# Debugging Guide - Send to EHR Feature

## Current Status
Both apps have been updated with detailed console logging to help diagnose the issue.

## Apps Running
- **Nurse App**: http://localhost:5183/
- **EHR Dashboard**: http://localhost:5179/

## Step-by-Step Testing with Console Monitoring

### 1. Open Both Apps in SEPARATE BROWSER TABS
**Important**: They must be in different tabs, not different windows, for localStorage events to work properly.

### 2. Open Browser Developer Tools in BOTH tabs
- Press `F12` or right-click → "Inspect"
- Go to the "Console" tab in both

### 3. In the EHR Dashboard Console, you should see:
```
🔊 EHR Dashboard: Setting up event listeners
✅ Event listeners registered
```

### 4. In the Nurse App (http://localhost:5183/):

1. **Select a Patient**
   - At the top, select "Smith, John" from the dropdown
   - You should see patient details displayed below

2. **Select a Workflow**
   - Click "Vital Signs" from the left sidebar

3. **Enter Data**
   - Either record voice or type: "Blood pressure 128 over 82, heart rate 88, temperature 98.4"
   - The form should auto-fill

4. **Submit the Workflow**
   - Click "Record Vital Signs" button
   - Entry should appear in "Recent Entries" panel on the right

5. **Send to EHR**
   - In the Recent Entries panel, click the green "Send" button
   - **Check the Console** - you should see:
     ```
     📤 Sending to EHR: {messageId: "msg-...", timestamp: "...", entry: {...}}
     ✅ Sent to EHR successfully
     ```

### 5. In the EHR Dashboard Console, you should see:
```
📥 Storage event received: voize_ehr_new_entry {message data}
✅ Parsed new entry: {entry data}
✅ Adding new entry to list
```

### 6. In the EHR Dashboard UI:
- Green notification banner should appear at the top
- Entry should appear in the patient's documentation list

## Common Issues and Solutions

### Issue 1: "Entry not found" in Nurse App Console
**Cause**: The entry wasn't created properly
**Solution**: Check if patient was selected before submitting

### Issue 2: No console logs in EHR Dashboard when clicking "Send"
**Cause**: localStorage events don't fire in the same tab that made the change
**Solution**:
- Make sure apps are in **different browser tabs**
- If both are in the same tab (iframe scenario), the custom event should fire instead

### Issue 3: "Duplicate entry detected, skipping" in EHR Dashboard
**Cause**: You're clicking "Send" multiple times
**Solution**: This is expected behavior - refresh the page and try again

### Issue 4: Seeing "Storage event received" but with wrong key
**Cause**: Other localStorage changes are happening
**Solution**: Ignore these - only events with key "voize_ehr_new_entry" matter

## Manual Testing via Console

You can manually test the communication by running this in the Nurse App console:

```javascript
const testEntry = {
  messageId: `msg-${Date.now()}`,
  timestamp: new Date().toISOString(),
  entry: {
    id: `test-${Date.now()}`,
    timestamp: new Date().toISOString(),
    nurseId: 'nurse-001',
    nurseName: 'Test Nurse',
    patientId: 'patient-001',
    patientMRN: 'MRN-2024-001',
    patientName: 'Smith, John',
    workflowType: 'vital-signs',
    voiceTranscript: 'Test vital signs',
    structuredData: {
      vitalSigns: {
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 98.6
      }
    },
    status: 'sent_to_ehr',
    lastModified: new Date().toISOString()
  }
};

localStorage.setItem('voize_ehr_new_entry', JSON.stringify(testEntry));
console.log('Test message sent!');
```

Then check the EHR Dashboard console for the storage event.

## What to Look For

### Success Indicators:
✅ Patient selector shows patient details
✅ Workflow form auto-fills from voice/text
✅ Entry appears in Recent Entries panel
✅ Console shows "Sending to EHR" message
✅ Console shows "Sent to EHR successfully"
✅ EHR Dashboard console shows "Storage event received"
✅ EHR Dashboard console shows "Adding new entry to list"
✅ Green notification appears in EHR Dashboard
✅ Entry appears in patient's documentation list

### Failure Indicators:
❌ No patient selector visible → Refresh the Nurse App
❌ "Please select a patient" alert → Select a patient first
❌ No console logs → Open Developer Tools (F12)
❌ "Entry not found" → Entry wasn't created, check previous steps
❌ No storage event in EHR Dashboard → Check if apps are in different tabs

## Next Steps After Testing

Once you've tested and can see the console logs, share:
1. What you see in the Nurse App console
2. What you see in the EHR Dashboard console
3. Whether the entry appears in the EHR Dashboard UI

This will help identify exactly where the flow is breaking.
