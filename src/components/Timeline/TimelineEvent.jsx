import React from 'react';
import styles from './Timeline.module.css';

function getEventCategoryTheme(category) {
  switch (category) {
    case 'Vitals & Biometrics':
      return {
        themeClass: styles.eventTeal,
        badgeClass: styles.badgeTeal,
      };
    case 'Medication Adherence':
      return {
        themeClass: styles.eventIndigo,
        badgeClass: styles.badgeIndigo,
      };
    case 'Diagnostic Lab':
      return {
        themeClass: styles.eventViolet,
        badgeClass: styles.badgeViolet,
      };
    case 'Clinical Encounter':
    default:
      return {
        themeClass: styles.eventBlue,
        badgeClass: styles.badgeBlue,
      };
  }
}

export function TimelineEvent({ event, isLast }) {
  const { themeClass, badgeClass } = getEventCategoryTheme(event.category);

  return (
    <div className={`${styles.eventItem} ${themeClass} ${isLast ? styles.isLastItem : ''}`}>
      {/* Left Date Column */}
      <div className={styles.dateColumn}>
        <span className={styles.dateGroupBadge}>{event.dateGroup || event.date}</span>
        <span className={styles.eventFullDate}>{event.date}</span>
        <span className={styles.eventTimeText}>{event.time}</span>
      </div>

      {/* Continuous Vertical Track & Marker */}
      <div className={styles.trackColumn}>
        <div className={styles.timelinePip} aria-hidden="true" />
        {!isLast && <div className={styles.trackLine} aria-hidden="true" />}
      </div>

      {/* Event Details Card */}
      <div className={styles.eventDetails}>
        <div className={styles.eventMain}>
          <div className={styles.titleLine}>
            <div>
              <h4 className={styles.eventTitle}>{event.title}</h4>
              {event.detail && (
                <p className={styles.eventDetailLine}>{event.detail}</p>
              )}
            </div>
            <div className={styles.tagsGroup}>
              <span className={styles.conditionTag}>{event.relatedCondition}</span>
              <span className={`${styles.categoryLabel} ${badgeClass}`}>
                {event.category}
              </span>
            </div>
          </div>

          <p className={styles.eventSummary}>{event.summary}</p>

          <div className={styles.eventMetaFooter}>
            <span className={styles.sourceText}>
              <strong>Source:</strong> {event.recordedBy}
            </span>
            {event.clinicalContext && (
              <>
                <span className={styles.footerSeparator}>•</span>
                <span className={styles.contextText}>{event.clinicalContext}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
