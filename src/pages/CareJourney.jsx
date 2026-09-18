import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PlaceholderPage.module.css';

export function CareJourney() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Navigation Target</span>
        <h2 className={styles.title}>Care Journey Timeline</h2>
        <p className={styles.description}>
          Expanded longitudinal chronological visualization spanning all clinical events, encounters, laboratory trends, and patient-reported outcomes.
        </p>
        <div className={styles.scopeNotice}>
          <strong>Modular Architecture:</strong> Full timeline expansion and multi-condition filtering will be integrated in upcoming team iterations.
        </div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
