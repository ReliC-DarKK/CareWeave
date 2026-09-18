import React from 'react';
import { Header } from '../components/Header/Header';
import { CareAtGlance } from '../components/CareAtGlance/CareAtGlance';
import { CareState } from '../components/CareState/CareState';
import { NextAction } from '../components/NextAction/NextAction';
import { Timeline } from '../components/Timeline/Timeline';
import { RecentUpdates } from '../components/RecentUpdates/RecentUpdates';
import { CareGaps } from '../components/CareGaps/CareGaps';
import { CareTeam } from '../components/CareTeam/CareTeam';
import { QuickLinks } from '../components/QuickLinks/QuickLinks';
import {
  DEMO_PATIENT,
  DEMO_CONDITIONS,
  DEMO_CARE_STATE,
  DEMO_NEXT_ACTIONS,
  DEMO_TIMELINE_EVENTS,
  DEMO_RECENT_UPDATES,
  DEMO_CARE_GAPS,
  DEMO_CARE_TEAM,
  DEMO_QUICK_LINKS,
} from '../data/mockData';
import styles from './Home.module.css';

export function Home() {
  return (
    <div className={styles.page}>
      <Header patient={DEMO_PATIENT} />

      <div className={styles.bodyContent}>
        {/* Section 2: Care at a Glance */}
        <CareAtGlance conditions={DEMO_CONDITIONS} />

        {/* Section 3: Overall Care State */}
        <CareState careState={DEMO_CARE_STATE} />

        {/* Two-Column Clinical Information Grid */}
        <div className={styles.dashboardGrid}>
          {/* Primary Column: Actions & Chronological Journey */}
          <div className={styles.primaryColumn}>
            {/* Section 5: What Matters Now / Next Best Action Placeholder */}
            <NextAction actions={DEMO_NEXT_ACTIONS} />

            {/* Section 4: Care Journey Timeline */}
            <Timeline events={DEMO_TIMELINE_EVENTS} />
          </div>

          {/* Secondary Column: Updates, Gaps, Team & Portals */}
          <div className={styles.secondaryColumn}>
            {/* Section 6: Recent Health Updates */}
            <RecentUpdates updates={DEMO_RECENT_UPDATES} />

            {/* Section 7: Care Gaps */}
            <CareGaps gaps={DEMO_CARE_GAPS} />

            {/* Section 8: Care Team */}
            <CareTeam members={DEMO_CARE_TEAM} />

            {/* Section 9: Quick Links */}
            <QuickLinks links={DEMO_QUICK_LINKS} />
          </div>
        </div>
      </div>
    </div>
  );
}
