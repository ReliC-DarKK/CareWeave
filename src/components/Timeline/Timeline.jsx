import React from 'react';
import { GitBranch, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TimelineEvent } from './TimelineEvent';
import styles from './Timeline.module.css';

export function Timeline({ events }) {
  return (
    <section className={styles.section} aria-labelledby="timeline-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <GitBranch size={18} className={styles.sectionIcon} aria-hidden="true" />
          <div>
            <h2 id="timeline-heading" className={styles.sectionTitle}>
              Care Journey Timeline
            </h2>
            <p className={styles.sectionDescription}>
              Chronological log of multi-condition interventions, readings, encounters, and labs
            </p>
          </div>
        </div>

        <Link to="/journey" className={styles.viewAllLink}>
          <span>View Full Journey</span>
          <ChevronRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className={styles.timelineContainer}>
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
