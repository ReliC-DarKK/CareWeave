import React, { useState, useEffect } from 'react';
import patientService from '../../services/patientService';
import MedicationDetailModal from './MedicationDetailModal';
import './MedicationPanel.css';

export default function MedicationPanel({ patientId, refreshTrigger }) {
  const [medications, setMedications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);

  useEffect(() => {
    if (!patientId) {
      setMedications([]);
      setIsLoading(false);
      return;
    }

    const loadMedications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await patientService.getMedications(patientId);
        setMedications(res?.medications || []);
      } catch (err) {
        console.error('Error loading medications:', err);
        setError('Failed to load medications.');
        setMedications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMedications();
  }, [patientId, refreshTrigger]);

  if (!patientId) {
    return (
      <section className="cw-medication-panel" aria-labelledby="medication-panel-title">
        <header className="medication-header">
          <h2 id="medication-panel-title">Medications</h2>
        </header>
        <div className="medication-empty">
          <p>No patient selected.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cw-medication-panel" aria-labelledby="medication-panel-title">
      <header className="medication-header">
        <h2 id="medication-panel-title">Medications</h2>
        <span className="medication-count">{medications.length}</span>
      </header>

      {isLoading ? (
        <div className="medication-loading">
          <div className="cw-spinner"></div>
          <p>Loading medications...</p>
        </div>
      ) : error ? (
        <div className="medication-error">
          <p>{error}</p>
        </div>
      ) : medications.length === 0 ? (
        <div className="medication-empty">
          <p>No medications recorded yet.</p>
        </div>
      ) : (
        <div className="medication-grid">
          {medications.map((med) => (
            <button
              key={med.id}
              className="medication-card"
              onClick={() => setSelectedMedication(med)}
              aria-label={`View details for ${med.name}`}
            >
              <div className="medication-icon" aria-hidden="true">💊</div>
              <div className="medication-info">
                <h3 className="medication-name">{med.name}</h3>
                {med.dose && <p className="medication-dose">{med.dose} {med.unit || ''}</p>}
                {med.frequency && <p className="medication-frequency">{med.frequency}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedMedication && (
        <MedicationDetailModal
          medication={selectedMedication}
          onClose={() => setSelectedMedication(null)}
        />
      )}
    </section>
  );
}
