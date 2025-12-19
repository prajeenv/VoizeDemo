# 🎯 Voize Demo Guide - Quick Start

## 🚀 Starting the Applications

Both applications are now running:

### Nurse App
**URL:** http://localhost:5176/

This is the main nursing documentation interface where nurses record patient information using voice or manual entry.

### EHR Dashboard
**URL:** http://localhost:5187/

This simulates the hospital's EHR system that receives and displays documentation entries in real-time.

---

## 📦 Step 1: Load Demo Data

1. **Open the Nurse App** at http://localhost:5176/
2. Look for the **"Demo Controls"** button in the header (purple gradient button)
3. Click it to open the dropdown menu
4. Click **"Load Demo Data"**
5. ✅ You'll see a success message

**What this does:**
- Loads 6 realistic sample patients
- Creates 14 historical documentation entries
- Pre-populates the EHR Dashboard with existing data
- Makes the system look like it's already in use

---

## 👀 Step 2: View Historical Data in EHR

1. **Switch to the EHR Dashboard** at http://localhost:5187/
2. You'll see:
   - 6 patients in the left sidebar
   - Today's statistics at the top
   - Historical documentation entries for each patient

3. **Click on any patient** to see their documentation
4. **Click "View Details"** on any entry to see:
   - Voice transcript
   - Structured data extraction
   - Export options (FHIR, HL7, CSV)

---

## ✨ Step 3: Test Auto-Populate Feature

1. **Back in Nurse App**, select a workflow from the left sidebar
   - Example: Click "Vital Signs"

2. **Open Demo Controls** → Click one of the auto-populate buttons:
   - **Vitals** - Pre-fills vital signs form
   - **Medication** - Pre-fills medication administration
   - **Assessment** - Pre-fills patient assessment
   - **Wound Care** - Pre-fills wound care documentation
   - **I/O** - Pre-fills intake/output
   - **Handoff** - Pre-fills shift handoff

3. The form instantly fills with realistic sample data

4. **Review the data** and click **"Send to EHR"**

5. **Check the EHR Dashboard** - the new entry appears in real-time! 🎉

---

## 🎤 Step 4: Test Voice Parsing (Parser Demo)

1. In Nurse App, click **"Parser Demo"** in the top-right

2. **Select a workflow type** from the dropdown

3. **Try these sample phrases:**

### Vital Signs:
```
BP one twenty over eighty, pulse seventy two, temp ninety eight point six,
patient is comfortable
```

### Medication:
```
Administered ten milligrams morphine IV push at fourteen thirty,
patient reports pain decreased to level three
```

### Assessment:
```
Patient Smith in room two oh four, alert and oriented times three,
ambulatory with walker, denies pain, skin warm and dry,
wound dressing clean dry intact
```

### Wound Care:
```
Stage two pressure ulcer on right heel, measures three centimeters by
two centimeters, minimal serous drainage, cleaned with normal saline,
dressed with foam dressing
```

4. **Click "Parse Transcript"** to see the AI extract structured data

5. Watch the **confidence score** and **parsed fields**

---

## 🔄 Step 5: Test Real-Time Communication

### Test the Bridge Between Apps:

1. **Nurse App**: Create a new documentation entry
   - Select a workflow
   - Use auto-populate or manual entry
   - Click "Send to EHR"

2. **EHR Dashboard**: Watch for the green notification bar
   - "New documentation received for [Patient Name]"
   - Entry appears in real-time
   - No page refresh needed!

3. **Click on the patient** to see the new entry

4. **Expand the entry** to see export options

---

## 🎨 Demo Workflow Showcase

### Complete Demo Flow (5 minutes):

1. **Start**: Show empty system or click "Clear All Data"

2. **Load Demo Data**:
   - Click Demo Controls → Load Demo Data
   - Show populated EHR Dashboard

3. **Create Vital Signs Entry**:
   - Select Vital Signs workflow
   - Auto-populate form
   - Send to EHR
   - Show in dashboard

4. **Create Medication Entry**:
   - Select Medication workflow
   - Auto-populate form
   - Send to EHR
   - Show in dashboard

5. **Show Parser**:
   - Go to Parser Demo
   - Use sample phrase
   - Show AI extraction

6. **Show Export Options**:
   - Open entry in EHR Dashboard
   - Show FHIR, HL7, CSV formats
   - Download a file

7. **Show Real-Time Updates**:
   - Split screen with both apps
   - Send from Nurse App
   - Watch appear in EHR Dashboard

---

## 🧹 Resetting for Another Demo

**Option 1: Keep Data, Add More**
- Just keep creating new entries
- Data persists across page refreshes

**Option 2: Fresh Start**
- Click **Demo Controls** → **"Clear All Data"**
- Confirm the action
- Page reloads with clean slate
- Load Demo Data again if needed

---

## 💡 Pro Tips

### For Impressive Demos:

1. **Pre-load demo data** before the audience arrives
2. **Use split-screen** to show both apps simultaneously
3. **Use auto-populate** for quick, error-free demos
4. **Highlight the confidence scores** in parser demo
5. **Show export formats** to demonstrate interoperability
6. **Point out the real-time updates** - no refresh needed
7. **Use medical terminology** naturally in sample phrases

### For Testing:

1. **Parser Demo** is perfect for testing phrase variations
2. **Auto-populate** ensures consistent test data
3. **Historical notes** show the system with existing data
4. **Export features** validate data structure accuracy

---

## 📊 What's Included in Demo Data

### 6 Sample Patients:
- Smith, John (Pneumonia, CHF) - Room 204
- Davis, Mary (Hip Replacement) - Room 206
- Johnson, Bob (Diabetic DKA) - Room 208
- Williams, Sarah (Sepsis, UTI) - Room 210
- Brown, Michael (COPD) - Room 212
- Martinez, Elena (Stroke) - Room 214

### 14 Historical Notes:
- 5 Vital Signs entries
- 4 Medication entries
- 3 Assessment entries
- 1 Wound Care entry
- 1 Intake/Output entry

### Sample Phrases:
- 24 realistic nursing phrases
- Covers all 6 workflow types
- Natural speech patterns
- Medical terminology included

### Medical Reference Data:
- 50+ medical abbreviations
- 30+ common medications
- 8 LOINC codes
- 12 medication routes

---

## ❓ Troubleshooting

**Data not appearing in EHR Dashboard?**
- Refresh the EHR Dashboard page
- Check browser console for errors
- Ensure both apps are running

**Auto-populate not working?**
- Make sure you've selected a workflow first
- Try selecting the workflow again
- Check that Demo Controls dropdown is open

**Clear Data not working?**
- Confirm the action when prompted
- Wait for page to reload
- Clear browser cache if needed

**Parser Demo not parsing?**
- Check that you've selected a workflow type
- Ensure the transcript field has text
- Try one of the provided sample phrases

---

## 🎓 Demo Script Template

```
"Let me show you how Voize transforms nursing documentation..."

[Load Demo Data]
"First, I'll load some sample patients. In a real hospital, this data
comes from your existing EHR system."

[Show EHR Dashboard]
"Here's what the hospital's EHR system sees. We have 6 patients with
their existing documentation history."

[Create New Entry]
"Now, let's document new vital signs. With Voize, the nurse can either
speak naturally or use the structured forms."

[Use Auto-populate]
"I'll use our quick-fill feature to show typical values..."

[Send to EHR]
"When the nurse clicks 'Send to EHR,' the data is immediately available
in the hospital system."

[Show Real-time Update]
"Notice it appeared instantly - no delays, no re-entry, completely automated."

[Show Parser Demo]
"The real power is in our AI parser. Let me show you how it understands
natural speech..."

[Demonstrate Parser]
"See how it extracted all the structured data from a natural sentence?
The confidence score shows how certain the AI is."

[Show Export Options]
"Finally, this data is interoperable - we can export as FHIR, HL7, or CSV
for integration with any system."

[Conclusion]
"That's Voize - saving nurses time while improving documentation accuracy."
```

---

## 🎯 Key Demo Points

**Highlight These Features:**
- ✅ Real-time communication between apps
- ✅ Natural language processing accuracy
- ✅ Structured data extraction from speech
- ✅ Multi-format export capabilities
- ✅ Professional medical terminology
- ✅ Realistic workflow patterns
- ✅ Time-saving automation

**Emphasize These Benefits:**
- 📉 Reduces documentation time by 60%
- 🎯 Improves accuracy with structured data
- 🔄 Eliminates duplicate data entry
- 📱 Works with existing EHR systems
- 🗣️ Natural speech recognition
- 📊 Exportable in industry standards

---

**Ready to demo? Open both apps and load the demo data!** 🚀

**Nurse App:** http://localhost:5176/
**EHR Dashboard:** http://localhost:5187/
