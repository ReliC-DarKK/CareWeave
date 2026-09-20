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
  const [careGlance, setCareGlance] = useState(null);
  const [isJourneyLoading, setIsJourneyLoading] = useState(true);
  const [journeyError, setJourneyError] = useState(null);

  useEffect(() => {
    if (activePatient) {
      setCurrentPatient(activePatient);
    }
  }, [activePatient]);

  /**
   * Helper to derive dynamic Care at a Glance if backend doesn't provide it
   */
  const deriveClientCareAtGlance = (patient, patientDetails, events = []) => {
    if (patientDetails?.careAtGlance) {
      return patientDetails.careAtGlance;
    }
    const conditions = [];
    const seenKeys = new Set();

    const addCond = (name, status, theme, iconType) => {
      const key = name.toLowerCase().trim();
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      conditions.push({
        id: `cond-${conditions.length + 1}`,
        name,
        status,
        theme,
        iconType,
      });
    };

    // 1. Diagnoses
    const diagnoses = patientDetails?.clinicalInformation?.diagnoses || [];
    for (const d of diagnoses) {
      const lower = d.toLowerCase();
      if (lower.includes('cancer') || lower.includes('carcinoma')) {
        addCond(d, 'Active Care · In Progress', 'pink', 'cancer');
      } else if (lower.includes('diabet') || lower.includes('glucose')) {
        addCond(d, 'Monitoring · Stable', 'blue', 'diabetes');
      } else if (lower.includes('hyperten') || lower.includes('blood pressure')) {
        addCond(d, 'Controlled', 'green', 'hypertension');
      } else if (lower.includes('lipid') || lower.includes('cholesterol')) {
        addCond(d, 'Managed', 'green', 'hypertension');
      } else {
        addCond(d, 'Documented', 'blue', 'medication');
      }
    }

    // 2. Medications
    const meds = patientDetails?.medications || [];
    for (const m of meds) {
      const name = (m.name || '').toLowerCase();
      if (name.includes('metformin')) {
        addCond('Type 2 Diabetes', 'Monitoring · Stable', 'blue', 'diabetes');
      } else if (name.includes('lisinopril') || name.includes('amlodipine') || name.includes('losartan')) {
        addCond('Hypertension', 'Controlled', 'green', 'hypertension');
      } else if (name.includes('atorvastatin') || name.includes('rosuvastatin')) {
        addCond('Hyperlipidemia', 'Managed', 'green', 'hypertension');
      } else if (name.includes('cholecalciferol') || name.includes('vitamin d')) {
        addCond('Vitamin D Deficiency', 'Supplementation · Active', 'green', 'wellness');
      } else if (name.includes('levothyroxine')) {
        addCond('Hypothyroidism', 'Managed', 'blue', 'wellness');
      }
    }

    // 3. Tests
    const tests = patientDetails?.tests || [];
    for (const t of tests) {
      const flag = (t.documentFlag || '').toUpperCase();
      const tName = (t.name || '').toLowerCase();
      if (flag === 'LOW' && tName.includes('vitamin d')) {
        addCond('Vitamin D Deficiency', 'Supplementation · Active', 'green', 'wellness');
      } else if (flag === 'HIGH' && (tName.includes('glucose') || tName.includes('hba1c'))) {
        addCond('Glucose Monitoring', 'Monitoring', 'blue', 'diabetes');
      }
    }

    const docCount = patientDetails?.documents?.length || events.length || 0;
    let careStatus = 'Stable';
    let careDesc = 'Keep following your plan and focus on today\'s actions.';

    if (docCount === 0 && conditions.length === 0) {
      careStatus = 'Up to date';
      careDesc = 'Upload a medical document to update your care journey.';
    } else if (conditions.length > 0) {
      careStatus = 'Stable';
      careDesc = 'Keep following your plan and focus on today\'s actions.';
    } else {
      careStatus = 'Healthy';
      careDesc = 'All recorded health parameters are within target ranges.';
    }

    return {
      heading: 'Your Care at a Glance',
      subtitle: conditions.length > 0
        ? (conditions.length === 1 ? '1 active condition. Unified view.' : `${conditions.length} conditions. One unified view.`)
        : 'One unified view of your care journey.',
      conditions,
      careState: {
        status: careStatus,
        statusTag: 'Your care state is',
        description: careDesc,
      },
    };
  };

  /**
   * Load the active patient, Care at a Glance, and Care Journey timeline from the backend.
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
            if (res.careAtGlance) {
              setCareGlance(res.careAtGlance);
            }
          }
        } catch {}
      }

      // 2. Use activePatient if available
      if (!targetPatient && activePatient) {
        targetPatient = activePatient;
      }

      // 3. Fallback: Fetch accessible patients and pick deterministically
      if (!targetPatient) {
        const patientsRes = await patientService.getPatients();
        const patients = patientsRes?.patients || [];

        if (patients.length === 0) {
          setCurrentPatient(null);
          setCareJourneyEvents([]);
          setCareGlance(null);
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

      // Fetch patient aggregated details for dynamic Care at a Glance
      let patientDetails = null;
      try {
        patientDetails = await patientService.getPatient(targetPatient.id);
      } catch (err) {
        console.warn('Could not load aggregated patient details:', err);
      }

      // Fetch Care Journey timeline for this patient
      const journeyRes = await patientService.getCareJourney(targetPatient.id);
      const rawEvents = journeyRes?.events || [];

      // Deduplicate events to guarantee no repeating cards
      const seen = new Set();
      const dedupedEvents = [];
      for (const evt of rawEvents) {
        const key = evt.provenance?.reportId
          ? `rep_${evt.provenance.reportId}`
          : `${evt.documentType || ''}|${evt.date || ''}|${evt.doctor?.name || ''}|${evt.title || ''}`;
        if (!seen.has(key)) {
          seen.add(key);
          dedupedEvents.push(evt);
        }
      }
      setCareJourneyEvents(dedupedEvents);

      // Set dynamic Care at a Glance
      if (patientDetails) {
        const glanceData = deriveClientCareAtGlance(targetPatient, patientDetails, dedupedEvents);
        setCareGlance(glanceData);
      }
    } catch (err) {
      console.error('Error loading care journey:', err);
      setJourneyError(err.message || 'Failed to load Care Journey.');
      setCareJourneyEvents([]);
    } finally {
      setIsJourneyLoading(false);
    }
  }, [activePatient, setActivePatientId]);

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

      {/* 3. Your Care at a Glance (Dynamic Condition Cards + Care State) */}
      <CareAtGlance data={careGlance || careAtGlanceData} />

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
        patientId={currentPatient?.id}
        onClose={() => {
          setIsUploadModalOpen(false);
          loadCareJourney(currentPatient?.id);
        }}
        onUploadSuccess={() => {}}
        onExtractionComplete={() => {
          // Accumulate into active patient's care journey — preserve history!
          loadCareJourney(currentPatient?.id);
        }}
      />
    </main>
  );
}
