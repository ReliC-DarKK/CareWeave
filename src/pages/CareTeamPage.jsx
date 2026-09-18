import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CareTeam } from '../components/CareTeam/CareTeam';
import { DEMO_CARE_TEAM } from '../data/mockData';
import styles from './PlaceholderPage.module.css';

export function CareTeamPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Care Network</span>
        <h2 className={styles.title}>Multidisciplinary Care Team</h2>
        <p className={styles.description}>
          Direct access to the attending physicians, navigators, and clinical specialists assigned to your care journey.
        </p>
      </div>
      <CareTeam members={DEMO_CARE_TEAM} />
      <div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
