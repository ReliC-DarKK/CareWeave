import React from 'react';
import { Header } from '../components/Header/Header';
import { CareAtGlance } from '../components/CareAtGlance/CareAtGlance';
import { CareState } from '../components/CareState/CareState';
import { NextAction } from '../components/NextAction/NextAction';
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

        {/* Row 3: Short Care Journey Preview */}
        <div className={styles.journeySection}>
          <CareJourneyPreview events={DEMO_TIMELINE_EVENTS} />
        </div>
      </main>
    </div>
  );
}
