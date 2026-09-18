import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PlaceholderPage.module.css';

export function HealthRecords() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Navigation Target</span>
        <h2 className={styles.title}>Consolidated Health Records</h2>
        <p className={styles.description}>
          Unified repository of clinical encounter notes, diagnostic laboratory panels, imaging studies, and pathology documentation.
        </p>
        <div className={styles.scopeNotice}>
          <strong>Modular Architecture:</strong> Record retrieval and data connectors will integrate with backend repositories provided by Person 2.
        </div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
