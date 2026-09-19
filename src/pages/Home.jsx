import React from 'react';
import { Header } from '../components/Header/Header';
import { CareAtGlance } from '../components/CareAtGlance/CareAtGlance';
import { CareState } from '../components/CareState/CareState';
import { NextAction } from '../components/NextAction/NextAction';
import { ContextualAlerts } from '../components/Alerts/ContextualAlerts';
import { MultiConditionView } from '../components/MultiCondition/MultiConditionView';
import { SmartHandoff } from '../components/SmartHandoff/SmartHandoff';
import { CareJourneyPreview } from '../components/Timeline/CareJourneyPreview';
import {
  DEMO_PATIENT,
  DEMO_CONDITIONS,
  DEMO_CARE_STATE,
  DEMO_NEXT_ACTIONS,
  DEMO_TIMELINE_EVENTS,
} from '../data/mockData';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.page}>
      <Header patient={DEMO_PATIENT} />

      <main className={styles.contentContainer}>
        {/* Row 1: Your Care at a Glance (Unified with Overall Care State) */}
        <div className={styles.topRow}>
          <CareAtGlance conditions={DEMO_CONDITIONS} careState={DEMO_CARE_STATE} />
        </div>

        {/* Row 2: What Matters Now — The Main Visual Focal Point */}
        <div className={styles.focalSection}>
          <NextAction actions={DEMO_NEXT_ACTIONS} />
        </div>

        {/* Row 3: Contextual Care Alerts & Preparation (Feature 6) */}
        <div className={styles.alertsSection}>
          <ContextualAlerts />
        </div>

        {/* Row 4: Multi-Condition Interaction Map (Feature 4) */}
        <div className={styles.interactionSection}>
          <MultiConditionView />
        </div>

        {/* Row 5: Smart Handoff / Cross-Specialty Care Summary (Feature 5) */}
        <div className={styles.handoffSection}>
          <SmartHandoff />
        </div>

        {/* Row 6: Short Care Journey Preview */}
        <div className={styles.journeySection}>
          <CareJourneyPreview events={DEMO_TIMELINE_EVENTS} />
        </div>
      </main>
    </div>
  );
}
