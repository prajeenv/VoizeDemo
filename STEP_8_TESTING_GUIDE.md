# STEP 8: Testing Guide - Communication Bridge

## Applications Running

✅ **Nurse App**: [http://localhost:5178](http://localhost:5178)
✅ **EHR Dashboard**: [http://localhost:5184](http://localhost:5184)

## Quick Start Test

### Test 1: Basic Communication (Same Browser)
1. Open **Nurse App** at http://localhost:5178
2. Select a patient (e.g., "Sarah Johnson")
3. Choose a workflow (e.g., "Vital Signs")
4. Record or type vitals data
5. Click "Complete & Send to EHR"
6. Open **EHR Dashboard** at http://localhost:5184 in a new tab
7. ✅ You should see the entry appear immediately with a green notification banner

### Test 2: Real-Time Cross-Window Communication
1. Open **EHR Dashboard** in one browser window: http://localhost:5184
2. Open **Nurse App** in another browser window: http://localhost:5178
3. Position windows side-by-side
4. In Nurse App: Create and send a new entry
5. ✅ Watch EHR Dashboard update in real-time
6. ✅ Green notification should appear at the top
7. ✅ Unread count badge should update on patient card

### Test 3: Data Persistence
1. Create 3-4 entries in Nurse App
2. Close both browser windows completely
3. Reopen Nurse App
4. ✅ All entries should still be visible in the recent entries panel
5. Open EHR Dashboard
6. ✅ All entries should be visible in the dashboard

### Test 4: Multiple Patients
1. In Nurse App, create entries for different patients:
   - Sarah Johnson: Vital Signs
   - Michael Chen: Medication Administration
   - Emily Rodriguez: Patient Assessment
2. Send all to EHR
3. In EHR Dashboard, click through each patient
4. ✅ Each patient should show only their own entries
5. ✅ Unread counts should reflect entries per patient

## Features to Verify

### Nurse App Features
- ✅ Voice recording works
- ✅ Voice transcript appears
- ✅ Parser extracts structured data
- ✅ Send to EHR button updates entry status
- ✅ Recent entries panel shows history
- ✅ Can edit and update entries
- ✅ Stats show correct counts

### EHR Dashboard Features
- ✅ Real-time entry notifications
- ✅ Patient list with unread badges
- ✅ Entry cards show workflow type with colored badges
- ✅ Voice transcript displayed
- ✅ Structured data (vitals, meds, etc.) displayed
- ✅ Export buttons work (FHIR, HL7, CSV)
- ✅ Format preview toggles work
- ✅ "Received via Voize" indicator shows

### Communication Features
- ✅ Same-window communication works
- ✅ Cross-window communication works
- ✅ No duplicate entries
- ✅ Entries sorted by timestamp (newest first)
- ✅ Data persists across page refreshes

## Advanced Testing

### Test 5: Storage Service API
Open browser console on either app and test:

```javascript
// Get storage statistics
import { getStorageStats } from './shared/services/storageService';
console.log(getStorageStats());

// Export all data
import { exportAllData } from './shared/services/storageService';
const result = exportAllData();
console.log(result.data);

// Get entries by patient
import { getEntriesByPatient } from './shared/services/storageService';
const result = getEntriesByPatient('patient-001');
console.log(result.data);
```

### Test 6: Error Handling
1. Open browser DevTools → Application → Local Storage
2. Clear 'voize_entries'
3. Reload apps
4. ✅ Apps should handle empty storage gracefully
5. Create new entries
6. ✅ Should rebuild entry list

### Test 7: Validation
Try to manually create invalid entry in console:
```javascript
import { sendToEHR } from './shared/services/storageService';

// Missing required fields - should fail
const result = sendToEHR({ id: 'test' });
console.log(result);
// ✅ Should return { success: false, error: { ... } }
```

## Browser Console Logs to Check

### Nurse App Console
When sending an entry, you should see:
```
📤 Sending to EHR: { ... }
✅ Sent to EHR successfully
```

### EHR Dashboard Console
When receiving an entry, you should see:
```
🔊 EHR Dashboard: Loading entries from storageService
✅ Loaded X entries
🔊 EHR Dashboard: Subscribing to new entries
✅ Subscription active
📥 New entry received: { ... }
✅ Adding new entry to list
```

## Demo Workflow

**Complete Demo Flow (5 minutes):**

1. **Setup** (30 seconds)
   - Open EHR Dashboard: http://localhost:5184
   - Open Nurse App in new window: http://localhost:5178
   - Arrange windows side-by-side

2. **Vital Signs Entry** (1 minute)
   - In Nurse App, select "Sarah Johnson"
   - Click "Vital Signs" workflow
   - Say or type: "Blood pressure 120 over 80, heart rate 72, temperature 98.6, oxygen saturation 98%"
   - Click "Complete & Send to EHR"
   - ✅ Watch it appear in EHR Dashboard instantly

3. **Medication Administration** (1 minute)
   - Select "Michael Chen"
   - Click "Medication Administration"
   - Say or type: "Administered Lisinopril 10 milligrams orally at 9 AM for blood pressure control"
   - Click "Complete & Send to EHR"
   - ✅ Watch it appear in EHR Dashboard

4. **Patient Assessment** (1 minute)
   - Select "Emily Rodriguez"
   - Click "Patient Assessment"
   - Say or type: "Patient is alert and oriented. Lungs are clear, heart rhythm is regular"
   - Click "Complete & Send to EHR"
   - ✅ Watch it appear in EHR Dashboard

5. **View in EHR** (1.5 minutes)
   - In EHR Dashboard, click through each patient
   - Expand entry details
   - Toggle between format previews (Human/FHIR/HL7/CSV)
   - Try export buttons
   - ✅ Verify all data displays correctly

## Troubleshooting

### Issue: Entries not appearing in EHR Dashboard
**Solution:**
- Check browser console for errors
- Verify both apps are open in the same browser
- Check localStorage in DevTools (Application → Local Storage)
- Try refreshing both apps

### Issue: Duplicate entries appearing
**Solution:**
- Clear localStorage: `localStorage.clear()`
- Refresh both apps
- This shouldn't happen with the duplicate detection, report if it does

### Issue: "QuotaExceededError"
**Solution:**
- The system keeps only 50 entries automatically
- If you see this, clear old data:
  ```javascript
  import { clearAllEntries } from './shared/services/storageService';
  clearAllEntries();
  ```

### Issue: Voice recording not working
**Solution:**
- Check microphone permissions in browser
- Use Chrome/Edge/Safari (Firefox has limited support)
- See STEP_3_SUMMARY.md for voice service details

## Performance Metrics

Expected performance:
- Entry appears in EHR: < 100ms (same window) or < 500ms (cross-window)
- Storage write: < 50ms
- Storage read: < 20ms
- Parse JSON: < 10ms

## Data Structure Verification

Check localStorage in DevTools:
```
Application → Local Storage → http://localhost:5178

Key: voize_entries
Value: [
  {
    "id": "...",
    "timestamp": "2024-01-15T14:30:00.000Z",
    "nurseId": "nurse-001",
    "nurseName": "Nurse Johnson",
    "patientId": "patient-001",
    "patientMRN": "MRN-12345",
    "patientName": "Sarah Johnson",
    "workflowType": "vital-signs",
    "voiceTranscript": "...",
    "structuredData": { ... },
    "status": "sent_to_ehr",
    "sentToEHRAt": "2024-01-15T14:30:05.000Z"
  },
  ...
]
```

## Success Criteria

Step 8 is successful if:
- ✅ Entries created in Nurse App appear in EHR Dashboard
- ✅ Real-time updates work in both same-window and cross-window scenarios
- ✅ Data persists across page refreshes
- ✅ No duplicate entries
- ✅ Error handling works correctly
- ✅ Export functions work
- ✅ All validations pass
- ✅ Console shows no errors
- ✅ UI updates are smooth and instant

## Next Steps After Testing

If all tests pass:
1. ✅ Step 8 is complete!
2. The communication bridge is working correctly
3. Both apps can communicate in real-time
4. Data persistence is functioning
5. Ready for additional features or production preparation

If issues are found:
1. Check console logs for detailed error messages
2. Verify storage permissions
3. Check network tab for any blocked requests
4. Review STEP_8_SUMMARY.md for implementation details

---

**Happy Testing! 🎉**

The Voize Demo system now has a fully functional communication bridge between the Nurse App and EHR Dashboard, enabling real-time documentation flow in a realistic clinical workflow simulation.
