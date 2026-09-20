import React, { useState, useEffect, useCallback } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import CareJourneyTimeline from '../../components/CareJourneyTimeline/CareJourneyTimeline';
import DocumentUploadModal from '../../components/DocumentUploadModal/DocumentUploadModal';
import patientService from '../../services/patientService';
import '../Appointments/AppointmentsPage.css';
import './CareJourneyPage.css';

export default function CareJourneyPage({
  activePatient,
  patientProfile,
  theme,
  onToggleTheme,
  onLogout,
  user,
  onPatientAssociated,
}) {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const loadCareJourney = useCallback(async () => {
    if (!activePatient?.id) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const journeyRes = await patientService.getCareJourney(activePatient.id);
      setEvents(journeyRes?.events || []);
    } catch (err) {
      console.error('Error loading care journey on page:', err);
      setError(err.message || 'Failed to load Care Journey.');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [activePatient?.id]);

  useEffect(() => {
    loadCareJourney();
  }, [loadCareJourney]);

  return (
    <main className="cw-page-container cw-care-journey-page" id="main-content">
      <GreetingHeader
        patientProfile={activePatient ? { ...patientProfile, name: activePatient.name } : patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      <div className="cw-page-content-wrapper">
        <CareJourneyTimeline
          events={events}
          isLoading={isLoading}
          error={error}
          onRetry={loadCareJourney}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          patientName={activePatient?.name}
        />
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          loadCareJourney();
        }}
        onUploadSuccess={() => {}}
        onExtractionComplete={(extractionResult) => {
          const associatedPatientId = extractionResult?.document?.patientId;
          if (associatedPatientId && onPatientAssociated) {
            onPatientAssociated(associatedPatientId);
          }
          loadCareJourney();
        }}
      />
    </main>
  );
}
