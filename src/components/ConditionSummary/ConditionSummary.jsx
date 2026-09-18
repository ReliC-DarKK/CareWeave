import React from 'react';
import { Activity, Droplets, HeartPulse, Calendar } from 'lucide-react';
import styles from './ConditionSummary.module.css';

function getConditionTheme(condition) {
  const lower = condition.name.toLowerCase() + ' ' + condition.category.toLowerCase();
  if (lower.includes('breast') || lower.includes('oncology')) {
    return {
      themeClass: styles.themeRose,
      Icon: Activity,
    };
  }
  if (lower.includes('diabetes') || lower.includes('endocrinology')) {
    return {
      themeClass: styles.themeBlue,
      Icon: Droplets,
    };
  }
  return {
    themeClass: styles.themeTeal,
    Icon: HeartPulse,
  };
}

export function ConditionSummary({ condition }) {
  const { themeClass, Icon } = getConditionTheme(condition);

  return (
    <div className={`${styles.compactBlock} ${themeClass}`}>
      <div className={styles.blockHeader}>
        <div className={styles.iconBox}>
          <Icon size={14} className={styles.conditionIcon} aria-hidden="true" />
        </div>
        <div className={styles.nameGroup}>
          <h4 className={styles.conditionTitle}>{condition.shortName}</h4>
          <span className={styles.stageNote}>{condition.stage}</span>
        </div>
      </div>

      <p className={styles.clinicalContext}>
        {condition.clinicalSummary}
      </p>

      <div className={styles.milestoneRow}>
        <Calendar size={12} className={styles.milestoneIcon} aria-hidden="true" />
        <span className={styles.milestoneText}>{condition.nextMilestone}</span>
      </div>
    </div>
  );
}
