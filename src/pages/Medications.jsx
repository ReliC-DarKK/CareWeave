import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PlaceholderPage.module.css';

export function Medications() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Navigation Target</span>
        <h2 className={styles.title}>Medications & Adherence Schedule</h2>
        <p className={styles.description}>
          Unified medication schedule reconciling oncology chemotherapy adjuncts, endocrine therapies, and cardiovascular prescriptions.
        </p>
        <div className={styles.scopeNotice}>
          <strong>Scope Boundary:</strong> Medication business logic, drug-drug interaction alerts, and adherence tracking engines belong to Person 2 and Person 1.
        </div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
