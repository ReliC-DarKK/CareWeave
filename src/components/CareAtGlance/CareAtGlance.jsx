import React from 'react';
import { Activity } from 'lucide-react';
import { ConditionSummary } from '../ConditionSummary/ConditionSummary';
import styles from './CareAtGlance.module.css';

export function CareAtGlance({ conditions }) {
  return (
    <section className={styles.section} aria-labelledby="care-glance-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.headerLeft}>
          <Activity size={18} className={styles.sectionIcon} aria-hidden="true" />
          <div>
            <h2 id="care-glance-heading" className={styles.sectionTitle}>
              Care at a Glance
            </h2>
            <p className={styles.sectionDescription}>
              Active diagnoses under ongoing multidisciplinary management
            </p>
          </div>
        </div>
        <span className={styles.countBadge}>{conditions.length} Conditions Monitored</span>
      </div>

      <div className={styles.conditionsGrid}>
        {conditions.map((condition) => (
          <ConditionSummary key={condition.id} condition={condition} />
        ))}
      </div>
    </section>
  );
}
