import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TimelineEvent } from './TimelineEvent';
import styles from './Timeline.module.css';

export function Timeline({ events }) {
  return (
    <section className={styles.timelineSection} aria-labelledby="timeline-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h2 id="timeline-heading" className={styles.sectionTitle}>
              Care Journey Timeline
            </h2>
            <p className={styles.sectionDescription}>
              Continuous longitudinal record of clinical encounters, readings, medications, and labs
            </p>
          </div>
        </div>

        <Link to="/journey" className={styles.viewAllLink}>
          <span>View Longitudinal Chart</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.openTimelineStream}>
        {events.map((event, index) => (
          <TimelineEvent
            key={event.id}
            event={event}
            isLast={index === events.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
