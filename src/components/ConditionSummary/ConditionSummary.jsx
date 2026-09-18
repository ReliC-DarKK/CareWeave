import React from 'react';
import { Calendar, User } from 'lucide-react';
import styles from './ConditionSummary.module.css';

export function ConditionSummary({ condition }) {
  return (
    <article className={styles.card} aria-labelledby={`condition-${condition.id}`}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <span className={styles.categoryLabel}>{condition.category}</span>
          <h3 id={`condition-${condition.id}`} className={styles.name}>
            {condition.shortName}
          </h3>
          <p className={styles.clinicalName}>{condition.name}</p>
        </div>
      </header>

      <div className={styles.statusRow}>
        <div className={styles.statusMeta}>
          <span className={styles.stageText}>{condition.stage}</span>
          <span className={styles.bulletSeparator}>•</span>
          <span className={styles.statusText}>{condition.status}</span>
        </div>
      </div>

      <p className={styles.summaryText}>{condition.clinicalSummary}</p>

      {condition.monitoredMarkers && condition.monitoredMarkers.length > 0 && (
        <div className={styles.markersContainer}>
          <span className={styles.markersHeading}>Monitored Indicators</span>
          <div className={styles.markersGrid}>
            {condition.monitoredMarkers.map((marker, idx) => (
              <div key={idx} className={styles.markerItem}>
                <span className={styles.markerLabel}>{marker.label}</span>
                <span className={styles.markerValue}>{marker.value}</span>
                <span className={styles.markerStatus}>{marker.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.metaRow}>
          <User size={13} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.metaText}>
            <strong>{condition.leadProvider}</strong> — {condition.department}
          </span>
        </div>
        <div className={styles.milestoneRow}>
          <Calendar size={13} className={styles.metaIcon} aria-hidden="true" />
          <span className={styles.milestoneText}>
            <span className={styles.milestonePrefix}>Next:</span> {condition.nextMilestone}
          </span>
        </div>
      </footer>
    </article>
  );
}
