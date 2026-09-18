import React from 'react';
import { Users, FileCheck2, Clock, Mail, ArrowRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { CareTeam } from '../components/CareTeam/CareTeam';
import { DEMO_CARE_TEAM, DEMO_SMART_HANDOFF } from '../data/mockData';
import styles from './CareTeamPage.module.css';

export function CareTeamPage() {
  const handoff = DEMO_SMART_HANDOFF;

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Multidisciplinary Care Team & Coordination</h1>
            <p className={styles.pageSubtitle}>
              Attending specialists, care navigators, and inter-specialty clinical handoffs
            </p>
          </div>
        </div>
      </header>

      {/* P4 Feature: Smart Handoff Clinical Workflow */}
      <section className={styles.handoffSection} aria-labelledby="smart-handoff-title">
        <div className={styles.handoffHeader}>
          <div className={styles.handoffTitleGroup}>
            <FileCheck2 size={18} className={styles.handoffIcon} aria-hidden="true" />
            <div>
              <h2 id="smart-handoff-title" className={styles.handoffTitle}>
                Smart Handoff — Inter-Specialty Clinical Summary
              </h2>
              <span className={styles.handoffSubtitle}>
                Transmission {handoff.handoffId} · {handoff.dateTransmitted}
              </span>
            </div>
          </div>
          <span className={styles.handoffStatusTag}>{handoff.acknowledgmentStatus}</span>
        </div>

        {/* Transfer Pathway */}
        <div className={styles.handoffFlow}>
          <div className={styles.flowParticipant}>
            <span className={styles.flowLabel}>Transfer From:</span>
            <span className={styles.flowValue}>{handoff.transferFrom}</span>
          </div>
          <ArrowRight size={16} className={styles.flowArrow} aria-hidden="true" />
          <div className={styles.flowParticipant}>
            <span className={styles.flowLabel}>Transfer To:</span>
            <span className={styles.flowValue}>{handoff.transferTo}</span>
          </div>
        </div>

        {/* Structured Context Grid */}
        <div className={styles.contextGrid}>
          <div className={styles.contextCard}>
            <span className={styles.contextLabel}>Patient Context</span>
            <p className={styles.contextValue}>{handoff.patientContext}</p>
          </div>

          <div className={styles.contextCard}>
            <span className={styles.contextLabel}>Current Treatment</span>
            <p className={styles.contextValue}>{handoff.currentTreatment}</p>
          </div>

          <div className={styles.contextCard}>
            <span className={styles.contextLabel}>Relevant Recent Measurements</span>
            <p className={styles.contextValue}>{handoff.recentMeasurements}</p>
          </div>

          <div className={styles.contextCard}>
            <span className={styles.contextLabel}>Current Medications</span>
            <p className={styles.contextValue}>{handoff.currentMedications}</p>
          </div>

          <div className={`${styles.contextCard} ${styles.contextFullWidth}`}>
            <span className={styles.contextLabel}>Upcoming Appointments</span>
            <p className={styles.contextValue}>{handoff.upcomingAppointments}</p>
          </div>
        </div>

        {/* Clinical Notes & Concurrence */}
        <div className={styles.handoffContent}>
          <div className={styles.noteBlock}>
            <span className={styles.noteHeading}>Clinical Handoff Rationale:</span>
            <p className={styles.noteText}>{handoff.handoffNotes}</p>
          </div>

          <div className={styles.responseBlock}>
            <span className={styles.noteHeading}>Endocrinology Concurrence & Action:</span>
            <p className={styles.noteText}>{handoff.responseNote}</p>
          </div>
        </div>

        <footer className={styles.handoffFooter}>
          <Clock size={13} className={styles.footerIcon} aria-hidden="true" />
          <span>Facilitated & Verified by: <strong>{handoff.coordinatorSigned}</strong></span>
        </footer>
      </section>

      {/* Full Multidisciplinary Care Team Roster */}
      <div className={styles.teamSection}>
        <CareTeam members={DEMO_CARE_TEAM} />
      </div>
    </div>
  );
}
