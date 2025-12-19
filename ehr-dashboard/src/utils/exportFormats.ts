import type { DocumentationEntry, FHIRObservation } from '../../../shared/types';

/**
 * Export utilities for converting documentation entries to various formats
 */

/**
 * Convert documentation entry to FHIR JSON format
 */
export function toFHIRFormat(entry: DocumentationEntry): string {
  const observations: FHIRObservation[] = [];

  // Convert vital signs to FHIR Observations
  if (entry.structuredData.vitalSigns) {
    const vitals = entry.structuredData.vitalSigns;

    if (vitals.heartRate) {
      observations.push({
        resourceType: 'Observation',
        id: `${entry.id}-hr`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8867-4',
              display: 'Heart rate',
            },
          ],
          text: 'Heart Rate',
        },
        subject: {
          reference: `Patient/${entry.patientId}`,
          display: entry.patientName,
        },
        effectiveDateTime: entry.timestamp,
        issued: entry.timestamp,
        performer: [
          {
            reference: `Practitioner/${entry.nurseId}`,
            display: entry.nurseName,
          },
        ],
        valueQuantity: {
          value: vitals.heartRate,
          unit: 'beats/minute',
          system: 'http://unitsofmeasure.org',
          code: '/min',
        },
      });
    }

    if (vitals.bloodPressure && vitals.systolic && vitals.diastolic) {
      observations.push({
        resourceType: 'Observation',
        id: `${entry.id}-bp`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '85354-9',
              display: 'Blood pressure',
            },
          ],
          text: 'Blood Pressure',
        },
        subject: {
          reference: `Patient/${entry.patientId}`,
          display: entry.patientName,
        },
        effectiveDateTime: entry.timestamp,
        valueString: vitals.bloodPressure,
      });
    }

    if (vitals.temperature) {
      observations.push({
        resourceType: 'Observation',
        id: `${entry.id}-temp`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '8310-5',
              display: 'Body temperature',
            },
          ],
          text: 'Temperature',
        },
        subject: {
          reference: `Patient/${entry.patientId}`,
          display: entry.patientName,
        },
        effectiveDateTime: entry.timestamp,
        valueQuantity: {
          value: vitals.temperature,
          unit: 'degF',
          system: 'http://unitsofmeasure.org',
          code: '[degF]',
        },
      });
    }

    if (vitals.oxygenSaturation) {
      observations.push({
        resourceType: 'Observation',
        id: `${entry.id}-spo2`,
        status: 'final',
        category: [
          {
            coding: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                code: 'vital-signs',
                display: 'Vital Signs',
              },
            ],
          },
        ],
        code: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '59408-5',
              display: 'Oxygen saturation',
            },
          ],
          text: 'Oxygen Saturation',
        },
        subject: {
          reference: `Patient/${entry.patientId}`,
          display: entry.patientName,
        },
        effectiveDateTime: entry.timestamp,
        valueQuantity: {
          value: vitals.oxygenSaturation,
          unit: '%',
          system: 'http://unitsofmeasure.org',
          code: '%',
        },
      });
    }
  }

  // Create FHIR Bundle
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: observations.map((obs) => ({
      fullUrl: `urn:uuid:${obs.id}`,
      resource: obs,
    })),
    meta: {
      source: 'Voize Nursing Documentation System',
      tag: [
        {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
          code: 'SUBSETTED',
          display: 'Resource encoded in summary mode',
        },
      ],
    },
  };

  return JSON.stringify(bundle, null, 2);
}

/**
 * Convert documentation entry to HL7 v2 message format
 */
export function toHL7Format(entry: DocumentationEntry): string {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z/, '');

  const messageControlId = `MSG${Date.now()}`;

  const segments: string[] = [];

  // MSH - Message Header
  segments.push(
    `MSH|^~\\&|VOIZE|MEMORIAL_GENERAL|EHR_SYSTEM|MEMORIAL_GENERAL|${timestamp}||ORU^R01|${messageControlId}|P|2.5`
  );

  // PID - Patient Identification
  const dob = entry.structuredData.vitalSigns?.timestamp
    ? new Date(entry.structuredData.vitalSigns.timestamp)
        .toISOString()
        .split('T')[0]
        .replace(/-/g, '')
    : '';
  segments.push(
    `PID|1||${entry.patientMRN}||${entry.patientName?.split(', ').join('^')}||${dob}|U|||||||||||${entry.patientId}`
  );

  // PV1 - Patient Visit
  segments.push('PV1|1|I|MED-SURG^204^01||||||||||||||||||||||||||||||||||||');

  // OBR - Observation Request
  const obr_timestamp = entry.timestamp.replace(/[-:]/g, '').replace(/\.\d{3}Z/, '');
  segments.push(
    `OBR|1|${entry.id}||${entry.workflowType.toUpperCase()}^${entry.workflowType}^LOCAL|||${obr_timestamp}|||||||${obr_timestamp}|||${entry.nurseId}^${entry.nurseName}`
  );

  // OBX - Observation Results
  let obsIndex = 1;

  if (entry.structuredData.vitalSigns) {
    const vitals = entry.structuredData.vitalSigns;

    if (vitals.heartRate) {
      segments.push(
        `OBX|${obsIndex++}|NM|8867-4^Heart Rate^LN||${vitals.heartRate}|/min|||||F|||${obr_timestamp}`
      );
    }

    if (vitals.systolic && vitals.diastolic) {
      segments.push(
        `OBX|${obsIndex++}|NM|8480-6^Systolic BP^LN||${vitals.systolic}|mm[Hg]|||||F|||${obr_timestamp}`
      );
      segments.push(
        `OBX|${obsIndex++}|NM|8462-4^Diastolic BP^LN||${vitals.diastolic}|mm[Hg]|||||F|||${obr_timestamp}`
      );
    }

    if (vitals.temperature) {
      segments.push(
        `OBX|${obsIndex++}|NM|8310-5^Temperature^LN||${vitals.temperature}|[degF]|||||F|||${obr_timestamp}`
      );
    }

    if (vitals.respiratoryRate) {
      segments.push(
        `OBX|${obsIndex++}|NM|9279-1^Respiratory Rate^LN||${vitals.respiratoryRate}|/min|||||F|||${obr_timestamp}`
      );
    }

    if (vitals.oxygenSaturation) {
      segments.push(
        `OBX|${obsIndex++}|NM|59408-5^O2 Saturation^LN||${vitals.oxygenSaturation}|%|||||F|||${obr_timestamp}`
      );
    }

    if (vitals.painLevel !== undefined) {
      segments.push(
        `OBX|${obsIndex++}|NM|72514-3^Pain Score^LN||${vitals.painLevel}|{score}|||||F|||${obr_timestamp}`
      );
    }
  }

  // Add voice transcript as note
  if (entry.voiceTranscript) {
    segments.push(
      `NTE|${obsIndex}|L|${entry.voiceTranscript.substring(0, 200).replace(/\|/g, '\\F\\')}`
    );
  }

  return segments.join('\r\n') + '\r\n';
}

/**
 * Convert documentation entry to CSV format
 */
export function toCSVFormat(entry: DocumentationEntry): string {
  const rows: string[][] = [];

  // Header
  rows.push([
    'Entry ID',
    'Timestamp',
    'Patient Name',
    'MRN',
    'Workflow Type',
    'Nurse',
    'Field',
    'Value',
    'Unit',
  ]);

  // Basic info
  rows.push([
    entry.id,
    entry.timestamp,
    entry.patientName || '',
    entry.patientMRN || '',
    entry.workflowType,
    entry.nurseName || '',
    'Voice Transcript',
    `"${entry.voiceTranscript.replace(/"/g, '""')}"`,
    '',
  ]);

  // Vital signs
  if (entry.structuredData.vitalSigns) {
    const vitals = entry.structuredData.vitalSigns;

    if (vitals.heartRate) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Heart Rate',
        vitals.heartRate.toString(),
        'bpm',
      ]);
    }

    if (vitals.bloodPressure) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Blood Pressure',
        vitals.bloodPressure,
        'mmHg',
      ]);
    }

    if (vitals.temperature) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Temperature',
        vitals.temperature.toString(),
        '°F',
      ]);
    }

    if (vitals.respiratoryRate) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Respiratory Rate',
        vitals.respiratoryRate.toString(),
        'breaths/min',
      ]);
    }

    if (vitals.oxygenSaturation) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Oxygen Saturation',
        vitals.oxygenSaturation.toString(),
        '%',
      ]);
    }

    if (vitals.painLevel !== undefined) {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        'Pain Level',
        vitals.painLevel.toString(),
        '0-10 scale',
      ]);
    }
  }

  // Medications
  if (entry.structuredData.medications) {
    entry.structuredData.medications.forEach((med, index) => {
      rows.push([
        entry.id,
        entry.timestamp,
        entry.patientName || '',
        entry.patientMRN || '',
        entry.workflowType,
        entry.nurseName || '',
        `Medication ${index + 1}`,
        `${med.name} ${med.dose} ${med.route}`,
        '',
      ]);
    });
  }

  return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Convert multiple entries to CSV format
 */
export function toCSVFormatMultiple(entries: DocumentationEntry[]): string {
  if (entries.length === 0) return '';

  const allRows: string[][] = [];

  // Header (add once)
  allRows.push([
    'Entry ID',
    'Timestamp',
    'Patient Name',
    'MRN',
    'Workflow Type',
    'Nurse',
    'Field',
    'Value',
    'Unit',
  ]);

  entries.forEach((entry) => {
    // Basic info
    allRows.push([
      entry.id,
      entry.timestamp,
      entry.patientName || '',
      entry.patientMRN || '',
      entry.workflowType,
      entry.nurseName || '',
      'Voice Transcript',
      `"${entry.voiceTranscript.replace(/"/g, '""')}"`,
      '',
    ]);

    // Vital signs
    if (entry.structuredData.vitalSigns) {
      const vitals = entry.structuredData.vitalSigns;
      if (vitals.heartRate) {
        allRows.push([
          entry.id,
          entry.timestamp,
          entry.patientName || '',
          entry.patientMRN || '',
          entry.workflowType,
          entry.nurseName || '',
          'Heart Rate',
          vitals.heartRate.toString(),
          'bpm',
        ]);
      }
      // Add other vitals similarly...
    }
  });

  return allRows.map((row) => row.join(',')).join('\n');
}

/**
 * Download a string as a file
 */
export function downloadAsFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
