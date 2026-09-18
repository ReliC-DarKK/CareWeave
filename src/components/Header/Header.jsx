import React from 'react';
import styles from './Header.module.css';

export function Header({ patient, dateStr }) {
  const currentDate = dateStr || "Friday, September 18, 2026";

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h2 className={styles.greeting}>Good morning, {patient.firstName}</h2>
        <p className={styles.subtitle}>
          Here's your current care state and what matters most today.
        </p>
        <div className={styles.metaRow}>
          <span>{currentDate}</span>
          <span className={styles.dotSeparator} aria-hidden="true">•</span>
          <span>{patient.primaryClinic}</span>
          <span className={styles.dotSeparator} aria-hidden="true">•</span>
          <span>Care Coordinator: {patient.careCoordinator}</span>
        </div>
      </div>
    </header>
  );
}
