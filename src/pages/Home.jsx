import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header/Header';
import { CareAtGlance } from '../components/CareAtGlance/CareAtGlance';
import { NextAction } from '../components/NextAction/NextAction';
import { CareJourneyPreview } from '../components/Timeline/CareJourneyPreview';
import { LoadingIndicator } from '../components/LoadingIndicator/LoadingIndicator';
import {
  getPatientCareLogic,
  DEMO_PATIENT_ID,
  adaptCareStateForGlance,
  adaptConditionsForGlance,
  adaptNextActionsForUI,
  adaptTimelineEventsForUI,
} from '../services/careLogic.service';
import {
  DEMO_PATIENT,
  DEMO_CONDITIONS,
  DEMO_CARE_STATE,
  DEMO_NEXT_ACTIONS,
  DEMO_TIMELINE_EVENTS,
} from '../data/mockData';
import styles from './Home.module.css';

export function Home() {
  const [careLogic, setCareLogic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchCareData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getPatientCareLogic(DEMO_PATIENT_ID);
      setCareLogic(data);
    } catch (err) {
      // Safe, user-friendly error representation without exposing internal stack traces
      setErrorMessage(err.message || 'Unable to connect to clinical logic engine.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCareData();
  }, []);

  // Map real backend P1 response when available, or fall back cleanly to demo fixtures
  const careState = careLogic?.careState
    ? adaptCareStateForGlance(careLogic.careState)
    : DEMO_CARE_STATE;

  const conditions = careLogic?.careState?.activeConditions?.length
    ? adaptConditionsForGlance(careLogic.careState.activeConditions)
    : DEMO_CONDITIONS;

  const actions = careLogic?.nextActions?.length
    ? adaptNextActionsForUI(careLogic.nextActions)
    : DEMO_NEXT_ACTIONS;

  const timelineEvents = careLogic?.timeline?.length
    ? adaptTimelineEventsForUI(careLogic.timeline)
    : DEMO_TIMELINE_EVENTS;

  const patient = {
    ...DEMO_PATIENT,
    id: DEMO_PATIENT_ID,
    firstName: 'Jordan',
    lastName: 'Rivera',
  };

  return (
    <div className={styles.page}>
      <Header patient={patient} />

      <main className={styles.contentContainer}>
        {errorMessage && (
          <div className={styles.errorBanner} role="alert">
            <span>{errorMessage}</span>
            <button
              type="button"
              className={styles.retryButton}
              onClick={fetchCareData}
            >
              Retry
            </button>
          </div>
        )}

        {isLoading ? (
          <div className={styles.centerState}>
            <LoadingIndicator label="Loading verified clinical care state..." size="lg" />
          </div>
        ) : (
          <>
            {/* Row 1: Your Care at a Glance (Unified with Overall Care State) */}
            <div className={styles.topRow}>
              <CareAtGlance conditions={conditions} careState={careState} />
            </div>

            {/* Row 2: What Matters Now — The Main Visual Focal Point */}
            <div className={styles.focalSection}>
              <NextAction actions={actions} />
            </div>

            {/* Row 3: Short Care Journey Preview */}
            <div className={styles.journeySection}>
              <CareJourneyPreview events={timelineEvents} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Home;
