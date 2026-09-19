import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CheckSquare,
  Square,
  UserCheck,
  BellRing,
  Pill,
  FlaskConical,
  Car,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import styles from './ContextualAlerts.module.css';

const INITIAL_CHECKLIST = [
  {
    id: 'glucose-logs',
    title: 'Bring latest 7-day glucose logs',
    detail: 'Crucial for Dr. Patel and Dr. Chen to reconcile recent HbA1c spike (8.2%) with chemo appetite fluctuations.',
    completed: true,
  },
  {
    id: 'med-bottles',
    title: 'Carry complete physical medication bottles',
    detail: 'Cross-specialty review to evaluate Metformin gastrointestinal tolerance and Donepezil evening administration.',
    completed: false,
  },
  {
    id: 'symptom-log',
    title: 'Log nausea & fatigue intensity episodes from Chemotherapy Cycle 3',
    detail: 'Grade 2 fatigue recorded; clinical team will adjust antiemetic dosage timing relative to meal intervals.',
    completed: true,
  },
  {
    id: 'caregiver-confirm',
    title: 'Caregiver Confirmation: Marcus Jenkins notified & confirmed accompaniment',
    detail: 'Mandatory accompaniment due to cognitive memory lapses and post-infusion fatigue.',
    completed: false,
  },
];

export function ContextualAlerts() {
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);
  const [toastMessage, setToastMessage] = useState(null);
  const [alertActions, setAlertActions] = useState({
    adherence: false,
    lab: false,
    ride: false,
  });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const toggleChecklistItem = (id) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleActionClick = (key, successText) => {
    setAlertActions((prev) => ({ ...prev, [key]: true }));
    showToast(successText);
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const totalCount = checklist.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const isAllComplete = completedCount === totalCount;

  return (
    <section className={styles.container} aria-labelledby="contextual-alerts-heading">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.iconBox} aria-hidden="true">
            <BellRing size={20} />
          </div>
          <div>
            <h2 id="contextual-alerts-heading" className={styles.title}>
              Contextual Care Alerts & Preparation
            </h2>
            <p className={styles.subtitle}>
              Proactive clinical preparation, medication reconciliation, and caregiver coordination
            </p>
          </div>
        </div>

        {/* Core Principle Banner */}
        <div className={styles.principleBanner} role="note">
          <span>
            <strong>Proactive Care Journey Principle:</strong> Moving from passive calendar reminders to actionable cross-condition preparation.
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toastNotification} role="status" aria-live="polite">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Preparation Card */}
      <div className={styles.heroCard}>
        <div className={styles.heroHeader}>
          <div className={styles.heroAppointmentInfo}>
            <div className={styles.heroDateBadge}>
              <Calendar size={13} aria-hidden="true" />
              <span>Tomorrow at 10:00 AM</span>
            </div>
            <h3 className={styles.heroAppointmentTitle}>
              Oncology Follow-up & Complete Blood Count (CBC)
            </h3>
            <div className={styles.heroAppointmentMeta}>
              <span>Attending: <strong>Dr. Chen</strong> (Oncology)</span>
              <span>•</span>
              <span>Location: Memorial Comprehensive Cancer Center (Suite 4B)</span>
              <span>•</span>
              <span>Objective: Cycle 3 Tolerance & Glycemic Recheck</span>
            </div>
          </div>

          <div
            className={`${styles.statusBadge} ${
              isAllComplete ? styles.statusBadgeDone : ''
            }`}
          >
            {isAllComplete ? (
              <>
                <CheckCircle2 size={13} aria-hidden="true" />
                <span>Fully Prepared</span>
              </>
            ) : (
              <>
                <Clock size={13} aria-hidden="true" />
                <span>Preparation Required (Actionable)</span>
              </>
            )}
          </div>
        </div>

        {/* Interactive Progress Indicator */}
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressLabel}>Pre-Visit Preparation Checklist</span>
            <span className={styles.progressFraction}>
              {completedCount} of {totalCount} items prepared ({progressPercent}%)
            </span>
          </div>
          <div className={styles.progressBarTrack} role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
            <div
              className={`${styles.progressBarFill} ${
                isAllComplete ? styles.progressBarFillComplete : ''
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Actionable Checklist */}
        <div className={styles.checklist} role="list">
          {checklist.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className={`${styles.checklistItem} ${
                item.completed ? styles.checklistItemDone : ''
              }`}
              onClick={() => toggleChecklistItem(item.id)}
            >
              <button
                type="button"
                className={`${styles.checkboxBtn} ${
                  item.completed ? styles.checkboxBtnDone : ''
                }`}
                aria-label={`Mark ${item.title} as ${item.completed ? 'incomplete' : 'complete'}`}
              >
                {item.completed ? (
                  <CheckSquare size={18} aria-hidden="true" />
                ) : (
                  <Square size={18} aria-hidden="true" />
                )}
              </button>
              <div className={styles.itemContent}>
                <span
                  className={`${styles.itemTitle} ${
                    item.completed ? styles.itemTitleDone : ''
                  }`}
                >
                  {item.title}
                </span>
                <span className={styles.itemDetail}>{item.detail}</span>
              </div>
            </div>
          ))}
        </div>

        {isAllComplete && (
          <div className={styles.completeNotice} role="status">
            <Sparkles size={16} aria-hidden="true" />
            <span>
              All preparation items completed! Clinical briefing document has been compiled for Dr. Chen's care team.
            </span>
          </div>
        )}
      </div>

      {/* Contextual Reminders & Care Gaps Section */}
      <div className={styles.remindersSection}>
        <h3 className={styles.remindersHeading}>
          <AlertCircle size={15} color="var(--color-clinical-amber)" aria-hidden="true" />
          <span>Active Contextual Reminders & Care Gaps</span>
        </h3>

        <div className={styles.remindersGrid}>
          {/* Alert 1: Adherence Gap */}
          <div className={styles.alertCard}>
            <div className={styles.alertCardContent}>
              <div className={styles.alertHeaderRow}>
                <span className={`${styles.alertCategoryBadge} ${styles.badgeAdherence}`}>
                  Adherence Gap
                </span>
                <span className={styles.alertTime}>Yesterday, 8:30 PM</span>
              </div>
              <h4 className={styles.alertTitle}>Missed Evening Metformin 500mg</h4>
              <p className={styles.alertDesc}>
                Logged as skipped due to post-chemo nausea. Skipping evening doses risks overnight fasting glycemic rebound.
              </p>
            </div>
            <button
              type="button"
              className={`${styles.quickActionBtn} ${
                alertActions.adherence ? styles.quickActionBtnDone : ''
              }`}
              onClick={() =>
                handleActionClick(
                  'adherence',
                  '✓ Metformin dose acknowledged: Rescheduled with breakfast + antiemetic sync.'
                )
              }
              disabled={alertActions.adherence}
            >
              {alertActions.adherence ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  <span>Dose Rescheduled</span>
                </>
              ) : (
                <>
                  <Pill size={14} aria-hidden="true" />
                  <span>Acknowledge & Reschedule Dosage</span>
                </>
              )}
            </button>
          </div>

          {/* Alert 2: Lab Timing */}
          <div className={styles.alertCard}>
            <div className={styles.alertCardContent}>
              <div className={styles.alertHeaderRow}>
                <span className={`${styles.alertCategoryBadge} ${styles.badgeLab}`}>
                  Lab Timing
                </span>
                <span className={styles.alertTime}>Tomorrow, 8:30 AM</span>
              </div>
              <h4 className={styles.alertTitle}>Pre-Chemo CBC Panel Protocol</h4>
              <p className={styles.alertDesc}>
                Blood draw scheduled 90 minutes before clinic consult. Requires 8-hour water-only fast for accurate metabolic validation.
              </p>
            </div>
            <button
              type="button"
              className={`${styles.quickActionBtn} ${
                alertActions.lab ? styles.quickActionBtnDone : ''
              }`}
              onClick={() =>
                handleActionClick(
                  'lab',
                  '✓ Fasting protocol confirmed: 8-hour water-only reminder set for 12:30 AM.'
                )
              }
              disabled={alertActions.lab}
            >
              {alertActions.lab ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  <span>Fasting Window Confirmed</span>
                </>
              ) : (
                <>
                  <FlaskConical size={14} aria-hidden="true" />
                  <span>Confirm Fasting Window</span>
                </>
              )}
            </button>
          </div>

          {/* Alert 3: Caregiver Coordination */}
          <div className={styles.alertCard}>
            <div className={styles.alertCardContent}>
              <div className={styles.alertHeaderRow}>
                <span className={`${styles.alertCategoryBadge} ${styles.badgeCaregiver}`}>
                  Caregiver Coordination
                </span>
                <span className={styles.alertTime}>Tomorrow, 9:15 AM</span>
              </div>
              <h4 className={styles.alertTitle}>Post-Infusion Transit & Accompaniment</h4>
              <p className={styles.alertDesc}>
                Marcus Jenkins designated for clinic escort and post-consult debrief to prevent treatment plan memory gaps.
              </p>
            </div>
            <button
              type="button"
              className={`${styles.quickActionBtn} ${
                alertActions.ride ? styles.quickActionBtnDone : ''
              }`}
              onClick={() =>
                handleActionClick(
                  'ride',
                  '✓ Ride confirmed: Marcus Jenkins notified for 9:15 AM departure.'
                )
              }
              disabled={alertActions.ride}
            >
              {alertActions.ride ? (
                <>
                  <Check size={14} aria-hidden="true" />
                  <span>Ride Confirmed with Marcus</span>
                </>
              ) : (
                <>
                  <Car size={14} aria-hidden="true" />
                  <span>Confirm Ride with Marcus</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContextualAlerts;
