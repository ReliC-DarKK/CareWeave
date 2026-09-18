import React from 'react';
import { CalendarDays, Building2, UserCheck } from 'lucide-react';
import styles from './Header.module.css';

export function Header({ patient, dateStr }) {
  const currentDate = dateStr || "Friday, September 18, 2026";

  return (
    <header className={styles.header}>
      <div className={styles.greetingSection}>
        <div className={styles.titleRow}>
          <h2 className={styles.greeting}>Good morning, {patient.firstName}</h2>
          <span className={styles.demoTag}>Demo Dataset</span>
        </div>
        <p className={styles.subtitle}>
          Consolidated longitudinal care view across your active conditions, scheduled therapies, and priority actions for today.
        </p>
      </div>

      <div className={styles.clinicalContextSection}>
        <div className={styles.contextItem}>
          <CalendarDays size={15} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextText}>{currentDate}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.contextItem}>
          <Building2 size={15} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextText}>{patient.primaryClinic}</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.contextItem}>
          <UserCheck size={15} className={styles.contextIcon} aria-hidden="true" />
          <span className={styles.contextText}>{patient.careCoordinator}</span>
        </div>
      </div>
    </header>
  );
}
