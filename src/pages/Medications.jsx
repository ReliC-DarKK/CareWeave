import React from 'react';
import { Pill, Clock, User, Calendar, AlertCircle } from 'lucide-react';
import { DEMO_MEDICATIONS } from '../data/mockData';
import styles from './Medications.module.css';

export function Medications() {
  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Medication Schedule & Active Prescriptions</h1>
            <p className={styles.pageSubtitle}>
              Reconciled multi-condition prescriptions co-managed across Oncology, Endocrinology, and Cardiology
            </p>
          </div>
        </div>
      </header>

      {/* Medication List */}
      <div className={styles.medicationsList}>
        {DEMO_MEDICATIONS.map((med) => (
          <article key={med.id} className={styles.medCard}>
            <div className={styles.cardMain}>
              <div className={styles.medHeaderRow}>
                <div className={styles.nameGroup}>
                  <div className={styles.medIconBox}>
                    <Pill size={16} aria-hidden="true" />
                  </div>
                  <div>
                    <h2 className={styles.medName}>
                      {med.name} <span className={styles.medDosage}>{med.dosage}</span>
                    </h2>
                    <div className={styles.conditionRow}>
                      <span className={styles.frequencyTag}>{med.frequency}</span>
                      <span className={styles.bulletSeparator} aria-hidden="true">•</span>
                      <span className={styles.conditionText}>{med.condition}</span>
                    </div>
                  </div>
                </div>

                <span className={`${styles.statusBadge} ${med.status.includes('Queued') ? styles.statusQueued : styles.statusActive}`}>
                  {med.status}
                </span>
              </div>

              {/* Timing & Dosing Schedule */}
              <div className={styles.timingRow}>
                <Clock size={13} className={styles.metaIcon} aria-hidden="true" />
                <span className={styles.timingLabel}>Timing:</span>
                <span className={styles.timingValue}>{med.timing}</span>
              </div>

              {/* Clinical & Refill Footer */}
              <div className={styles.medFooter}>
                <div className={styles.prescriberInfo}>
                  <User size={13} className={styles.metaIcon} aria-hidden="true" />
                  <span>Prescribed by {med.prescriber}</span>
                </div>
                <div className={styles.refillInfo}>
                  <Calendar size={13} className={styles.metaIcon} aria-hidden="true" />
                  <span>Next Refill: <strong>{med.nextRefill}</strong> ({med.refillsRemaining} remaining)</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
