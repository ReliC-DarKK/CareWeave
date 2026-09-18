import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './CareGaps.module.css';

export function CareGaps({ gaps }) {
  return (
    <section className={styles.section} aria-labelledby="care-gaps-heading">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <AlertCircle size={18} className={styles.headerIcon} aria-hidden="true" />
          <div>
            <h2 id="care-gaps-heading" className={styles.title}>
              Care & Surveillance Gaps
            </h2>
            <p className={styles.subtitle}>
              Interval screenings & preventative clinical guidelines
            </p>
          </div>
        </div>
      </div>

      <div className={styles.gapsList}>
        {gaps.map((gap) => (
          <div key={gap.id} className={styles.gapCard}>
            <div className={styles.gapTop}>
              <span className={styles.categoryBadge}>{gap.category}</span>
              <span className={styles.conditionContext}>{gap.relatedCondition}</span>
            </div>

            <h3 className={styles.gapTitle}>{gap.title}</h3>
            <p className={styles.statusNote}>
              <span className={styles.statusLabel}>Interval:</span> {gap.statusNote}
            </p>
            <p className={styles.recommendation}>{gap.recommendation}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
