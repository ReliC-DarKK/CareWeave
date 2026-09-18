import React from 'react';
import styles from './CareGaps.module.css';

function getConditionTagClass(conditionName) {
  const lower = conditionName.toLowerCase();
  if (lower.includes('breast') || lower.includes('cancer')) return styles.tagRose;
  if (lower.includes('diabetes') || lower.includes('glucose')) return styles.tagBlue;
  if (lower.includes('hypertension') || lower.includes('cardio')) return styles.tagTeal;
  return styles.tagNeutral;
}

export function CareGaps({ gaps }) {
  return (
    <section className={styles.section} aria-labelledby="care-gaps-heading">
      <div className={styles.header}>
        <div className={styles.visualAnchor} aria-hidden="true" />
        <div>
          <h2 id="care-gaps-heading" className={styles.title}>
            Care & Surveillance Gaps
          </h2>
          <p className={styles.subtitle}>Guideline screening intervals & preventative alerts</p>
        </div>
      </div>

      <div className={styles.gapsList}>
        {gaps.map((gap) => (
          <div key={gap.id} className={styles.gapCard}>
            <div className={styles.gapTop}>
              <span className={styles.categoryBadge}>{gap.category}</span>
              <span className={`${styles.conditionContext} ${getConditionTagClass(gap.relatedCondition)}`}>
                {gap.relatedCondition}
              </span>
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
