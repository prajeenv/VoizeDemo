/**
 * Patient Selector Component
 * Allows nurses to select which patient they're documenting for
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import type { Patient } from '../../../shared/types';

export const PatientSelector: React.FC = () => {
  const { patients, selectedPatient, selectPatient } = useApp();

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Select Patient
        </label>
        <select
          value={selectedPatient?.id || ''}
          onChange={(e) => {
            const patient = patients.find((p) => p.id === e.target.value);
            selectPatient(patient || null);
          }}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium"
        >
          <option value="" disabled>
            -- Select a Patient --
          </option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.name} - Room {patient.room} ({patient.mrn})
            </option>
          ))}
        </select>

        {selectedPatient && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">MRN:</span>{' '}
                <span className="font-medium">{selectedPatient.mrn}</span>
              </div>
              <div>
                <span className="text-gray-600">Room:</span>{' '}
                <span className="font-medium">{selectedPatient.room}</span>
              </div>
              <div>
                <span className="text-gray-600">DOB:</span>{' '}
                <span className="font-medium">
                  {new Date(selectedPatient.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Code:</span>{' '}
                <span className="font-medium">{selectedPatient.codeStatus}</span>
              </div>
            </div>
            {selectedPatient.primaryDiagnosis && (
              <div className="mt-2 text-sm">
                <span className="text-gray-600">Diagnosis:</span>{' '}
                <span className="font-medium">{selectedPatient.primaryDiagnosis}</span>
              </div>
            )}
            {selectedPatient.allergies && selectedPatient.allergies.length > 0 && (
              <div className="mt-2">
                <span className="text-sm text-gray-600">Allergies:</span>{' '}
                {selectedPatient.allergies.map((allergy, idx) => (
                  <span
                    key={idx}
                    className="inline-block ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded"
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
