import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PlaceholderPage.module.css';

export function Appointments() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Navigation Target</span>
        <h2 className={styles.title}>Multidisciplinary Appointments</h2>
        <p className={styles.description}>
          Coordinated clinical calendar aligning oncology infusions, endocrinology follow-ups, and diagnostic laboratory appointments.
        </p>
        <div className={styles.scopeNotice}>
          <strong>Modular Architecture:</strong> Scheduling workflows and clinical synchronization endpoints will connect in subsequent phases.
        </div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
