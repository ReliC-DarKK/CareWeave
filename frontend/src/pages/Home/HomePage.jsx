import React, { useState, useEffect, useCallback } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import AddDocument from '../../components/AddDocument/AddDocument';
import CareAtGlance from '../../components/CareAtGlance/CareAtGlance';
import CareJourneyTimeline from '../../components/CareJourneyTimeline/CareJourneyTimeline';
import DocumentUploadModal from '../../components/DocumentUploadModal/DocumentUploadModal';
import patientService from '../../services/patientService';
import './HomePage.css';

export default function HomePage({
  patientProfile,
  addDocumentData,
  careAtGlanceData,
  theme,
  onToggleTheme,
  onLogout,
  user,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [careJourneyEvents, setCareJourneyEvents] = useState([]);
  const [isJourneyLoading, setIsJourneyLoading] = useState(true);
  const [journeyError, setJourneyError] = useState(null);

  /**
   * Load the active patient and their Care Journey timeline from the backend.
   */
  const loadCareJourney = useCallback(async () => {
    setIsJourneyLoading(true);
    setJourneyError(null);

    try {
      // 1. Fetch user's accessible patients
      const patientsRes = await patientService.getPatients();
      const patients = patientsRes?.patients || [];

      if (patients.length === 0) {
        // No patients yet -> empty timeline
        setCurrentPatient(null);
        setCareJourneyEvents([]);
        setIsJourneyLoading(false);
        return;
      }

      // 2. Select primary patient (default to first)
      const activePatient = patients[0];
      setCurrentPatient(activePatient);

      // 3. Fetch Care Journey timeline for this patient
      const journeyRes = await patientService.getCareJourney(activePatient.id);
      setCareJourneyEvents(journeyRes?.events || []);
    } catch (err) {
      console.error('Error loading care journey:', err);
      setJourneyError(err.message || 'Failed to load Care Journey.');
      setCareJourneyEvents([]);
    } finally {
      setIsJourneyLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCareJourney();
  }, [loadCareJourney]);

  return (
    <main className="cw-home-page" id="main-content">
      {/* 1. Greeting Header with Theme Toggle + Logout */}
      <GreetingHeader
        patientProfile={currentPatient ? { ...patientProfile, name: currentPatient.name } : patientProfile}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={onLogout}
        user={user}
      />

      {/* 2. Add Document Section (Triggers Upload Modal) */}
      <AddDocument
        data={addDocumentData}
        onOpenUpload={() => setIsUploadModalOpen(true)}
      />

      {/* 3. Your Care at a Glance (3 Condition Cards + Rainbow Arc Care State) */}
      <CareAtGlance data={careAtGlanceData} />

      {/* 4. Real Functional Care Journey Timeline */}
      <CareJourneyTimeline
        events={careJourneyEvents}
        isLoading={isJourneyLoading}
        error={journeyError}
        onRetry={loadCareJourney}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        patientName={currentPatient?.name}
      />

      {/* 5. Document Upload Modal Dialog */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          loadCareJourney();
        }}
        onUploadSuccess={() => {
          // Document uploaded
        }}
        onExtractionComplete={() => {
          // Medical extraction complete -> refresh care journey
          loadCareJourney();
        }}
      />
    </main>
  );
}
