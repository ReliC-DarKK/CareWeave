import React from 'react';
import styles from './CareJourneyPreview.module.css';

function getEventColorClass(category) {
  switch (category) {
    case 'Vitals & Biometrics':
      return styles.eventTeal;
    case 'Medication Adherence':
      return styles.eventIndigo;
    case 'Diagnostic Lab':
      return styles.eventViolet;
    case 'Clinical Encounter':
    default:
      return styles.eventBlue;
  }
}

export function CareJourneyPreview({ events }) {
  // Show strictly only 3 recent events for a calm, uncluttered Home preview
  const previewEvents = (events || []).slice(0, 3);

  return (
    <section className={styles.section} aria-labelledby="journey-preview-heading">
      <div className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <h3 id="journey-preview-heading" className={styles.title}>
            Care Journey
          </h3>
        </div>
      </div>

      <div className={styles.previewList}>
        {previewEvents.map((event) => {
          const colorClass = getEventColorClass(event.category);
          return (
            <div key={event.id} className={`${styles.previewItem} ${colorClass}`}>
              <div className={styles.dateCol}>
                <span className={styles.eventDate}>{event.date}</span>
                <span className={styles.eventTime}>{event.time}</span>
              </div>

              <div className={styles.markerCol}>
                <span className={styles.markerDot} aria-hidden="true" />
              </div>

              <div className={styles.infoCol}>
                <div className={styles.titleRow}>
                  <h4 className={styles.eventTitle}>{event.title}</h4>
                  <span className={styles.conditionContext}>{event.relatedCondition}</span>
                </div>
                <p className={styles.eventSummary}>{event.summary}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
