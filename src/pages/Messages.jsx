import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './PlaceholderPage.module.css';

export function Messages() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.badge}>Navigation Target</span>
        <h2 className={styles.title}>Care Team Communications</h2>
        <p className={styles.description}>
          Direct secure messaging portal between patient and assigned care coordinator / attending specialists.
        </p>
        <div className={styles.scopeNotice}>
          <strong>Modular Architecture:</strong> Secure messaging channels and HIPAA-compliant communication modules will be connected in future iterations.
        </div>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Return to Home Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
