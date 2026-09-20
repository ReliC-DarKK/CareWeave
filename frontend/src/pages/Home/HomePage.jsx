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
  activePatient,
  setActivePatientId,
  onPatientAssociated,
}) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPatient, setCurrentPatient] = useState(activePatient || null);
  const [careJourneyEvents, setCareJourneyEvents] = useState([]);
  const [isJourneyLoading, setIsJourneyLoading] = useState(true);
  const [journeyError, setJourneyError] = useState(null);

  useEffect(() => {
    if (activePatient) {
      setCurrentPatient(activePatient);
    }
  }, [activePatient]);

  /**
   * Load the active patient and their Care Journey timeline from the backend.
   */
  const loadCareJourney = useCallback(async (preferredPatientId) => {
    setIsJourneyLoading(true);
    setJourneyError(null);

    try {
      let targetPatient = null;

      // 1. Explicit preferredPatientId provided (e.g. from upload/extraction)
      if (preferredPatientId) {
        try {
          const res = await patientService.getPatient(preferredPatientId);
          if (res?.patient) {
            targetPatient = res.patient;
          }
        } catch {}
      }

      // 2. Use activePatient / currentPatient if available
      if (!targetPatient && (activePatient || currentPatient)) {
        targetPatient = activePatient || currentPatient;
      }

      // 3. Fallback: Fetch accessible patients and pick deterministically
      if (!targetPatient) {
        const patientsRes = await patientService.getPatients();
        const patients = patientsRes?.patients || [];

        if (patients.length === 0) {
          setCurrentPatient(null);
          setCareJourneyEvents([]);
          setIsJourneyLoading(false);
          return;
        }

        // Deterministic: prefer Aditi Sharma, or patient with documents, or sort by name
        targetPatient = patients.find((p) => p.name.toLowerCase().includes('aditi')) ||
                        patients.find((p) => p.documentCount > 0) ||
                        [...patients].sort((a, b) => a.name.localeCompare(b.name))[0];
      }

      setCurrentPatient(targetPatient);
      if (setActivePatientId && targetPatient?.id) {
        setActivePatientId(targetPatient.id);
      }

      // Fetch Care Journey timeline for this patient
      const journeyRes = await patientService.getCareJourney(targetPatient.id);
      setCareJourneyEvents(journeyRes?.events || []);
    } catch (err) {
      console.error('Error loading care journey:', err);
      setJourneyError(err.message || 'Failed to load Care Journey.');
      setCareJourneyEvents([]);
    } finally {
      setIsJourneyLoading(false);
    }
  }, [activePatient, currentPatient, setActivePatientId]);

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
        onUploadSuccess={() => {}}
        onExtractionComplete={(extractionResult) => {
          const associatedPatientId = extractionResult?.document?.patientId;
          if (associatedPatientId) {
            if (onPatientAssociated) {
              onPatientAssociated(associatedPatientId);
            }
            loadCareJourney(associatedPatientId);
          } else {
            loadCareJourney();
          }
        }}
      />
    </main>
  );
}
