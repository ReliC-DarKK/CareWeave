import React, { useState, useCallback } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import MedicationPanel from '../../components/MedicationPanel/MedicationPanel';
import DocumentUploadModal from '../../components/DocumentUploadModal/DocumentUploadModal';
import '../Appointments/AppointmentsPage.css';
import './MedicationsPage.css';

export default function MedicationsPage({
  activePatient,
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
  onPatientAssociated,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <main className="cw-page-container cw-medications-page" id="main-content">
      <GreetingHeader
        patientProfile={activePatient ? { ...patientProfile, name: activePatient.name } : patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      <div className="cw-page-content-wrapper">
        <div className="cw-medications-action-bar">
          <button
            type="button"
            className="cw-records-upload-btn"
            onClick={() => setIsUploadModalOpen(true)}
          >
            + Upload Document
          </button>
        </div>

        <MedicationPanel
          patientId={activePatient?.id}
          refreshTrigger={refreshKey}
        />
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          handleRefresh();
        }}
        onUploadSuccess={() => {}}
        onExtractionComplete={(extractionResult) => {
          const associatedPatientId = extractionResult?.document?.patientId;
          if (associatedPatientId && onPatientAssociated) {
            onPatientAssociated(associatedPatientId);
          }
          handleRefresh();
        }}
      />
    </main>
  );
}
