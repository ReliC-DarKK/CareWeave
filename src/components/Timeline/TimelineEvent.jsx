import React from 'react';
import { Stethoscope, Pill, FlaskConical, Activity, CalendarCheck } from 'lucide-react';
import styles from './Timeline.module.css';

function getCategoryIcon(category) {
  switch (category) {
    case 'Vitals & Biometrics':
      return Activity;
    case 'Medication Adherence':
      return Pill;
    case 'Diagnostic Lab':
      return FlaskConical;
    case 'Clinical Encounter':
      return Stethoscope;
    default:
      return CalendarCheck;
  }
}

export function TimelineEvent({ event, isLast }) {
  const IconComponent = getCategoryIcon(event.category);

  return (
    <div className={`${styles.eventItem} ${isLast ? styles.isLastEvent : ''}`}>
      <div className={styles.timelineTrack}>
        <div className={styles.timelineNode}>
          <IconComponent size={14} className={styles.nodeIcon} aria-hidden="true" />
        </div>
        {!isLast && <div className={styles.trackLine} />}
      </div>

      <div className={styles.eventContent}>
        <div className={styles.eventHeader}>
          <div className={styles.dateTimeBadge}>
            <span className={styles.eventDate}>{event.date}</span>
            <span className={styles.eventTime}>{event.time}</span>
          </div>
          <span className={styles.conditionContext}>{event.relatedCondition}</span>
        </div>

        <div className={styles.eventBody}>
          <div className={styles.eventTitleRow}>
            <h4 className={styles.eventTitle}>{event.title}</h4>
            <span className={styles.categoryBadge}>{event.category}</span>
          </div>

          <p className={styles.eventSummary}>{event.summary}</p>

          <div className={styles.eventFooter}>
            <span className={styles.recordedBy}>
              <strong>Source:</strong> {event.recordedBy}
            </span>
            {event.clinicalContext && (
              <span className={styles.clinicalContextNote}>
                {event.clinicalContext}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
