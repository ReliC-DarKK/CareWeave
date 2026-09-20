import React, { useState, useEffect, useCallback } from 'react';
import GreetingHeader from '../../components/GreetingHeader/GreetingHeader';
import CareJourneyTimeline from '../../components/CareJourneyTimeline/CareJourneyTimeline';
import MultiConditionMap from '../../components/MultiConditionMap/MultiConditionMap';
import SmartHandoff from '../../components/SmartHandoff/SmartHandoff';
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
  const [aggregatedData, setAggregatedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'map' | 'handoff' | 'timeline'

  const loadCareJourney = useCallback(async () => {
    if (!activePatient?.id) {
      setEvents([]);
      setAggregatedData(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [journeyRes, patientRes] = await Promise.allSettled([
        patientService.getCareJourney(activePatient.id),
        patientService.getPatient(activePatient.id),
      ]);

      if (journeyRes.status === 'fulfilled') {
        setEvents(journeyRes.value?.events || []);
      } else {
        console.warn('Could not load care journey events:', journeyRes.reason);
      }

      if (patientRes.status === 'fulfilled') {
        setAggregatedData(patientRes.value || null);
      } else {
        console.warn('Could not load aggregated patient data:', patientRes.reason);
      }
    } catch (err) {
      console.error('Error loading care journey data:', err);
      setError(err.message || 'Failed to load Care Journey.');
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
        {/* Sub-Navigation View Switcher */}
        <div className="cw-journey-view-switcher" role="tablist" aria-label="Care Journey Views">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'all'}
            className={`cw-view-tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Journey Views
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'timeline'}
            className={`cw-view-tab ${activeTab === 'timeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Care Timeline
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'map'}
            className={`cw-view-tab ${activeTab === 'map' ? 'active' : ''}`}
            onClick={() => setActiveTab('map')}
          >
            Multi-Condition Map
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'handoff'}
            className={`cw-view-tab ${activeTab === 'handoff' ? 'active' : ''}`}
            onClick={() => setActiveTab('handoff')}
          >
            Smart Handoff
          </button>
        </div>

        {/* 1. Care Journey Timeline (Primary top feature) */}
        {(activeTab === 'all' || activeTab === 'timeline') && (
          <CareJourneyTimeline
            events={events}
            isLoading={isLoading}
            error={error}
            onRetry={loadCareJourney}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            patientName={activePatient?.name}
          />
        )}

        {/* 2. Multi-Condition Interaction Map (Below Timeline) */}
        {(activeTab === 'all' || activeTab === 'map') && (
          <MultiConditionMap
            patient={activePatient}
            aggregatedData={aggregatedData}
            onConditionClick={(cond) => {
              console.log('Condition clicked:', cond);
            }}
          />
        )}

        {/* 3. Smart Handoff / Cross-Specialty Care Summary (Below Timeline) */}
        {(activeTab === 'all' || activeTab === 'handoff') && (
          <SmartHandoff
            patient={activePatient}
            aggregatedData={aggregatedData}
          />
        )}
      </div>

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        patientId={activePatient?.id}
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
