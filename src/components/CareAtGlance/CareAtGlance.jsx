import React from 'react';
import { User, Activity, Droplets, HeartPulse } from 'lucide-react';
import { DEMO_CARE_STATE } from '../../data/mockData';
import styles from './CareAtGlance.module.css';

function getConditionMeta(condition) {
  const lower = (condition.name || condition.shortName || '').toLowerCase();
  if (lower.includes('breast') || lower.includes('cancer')) {
    return {
      themeClass: styles.cardRose,
      iconBoxClass: styles.iconRose,
      Icon: Activity,
      secondaryText: 'Treatment · Cycle 3',
    };
  }
  if (lower.includes('diabetes')) {
    return {
      themeClass: styles.cardBlue,
      iconBoxClass: styles.iconBlue,
      Icon: Droplets,
      secondaryText: 'Monitoring · Stable',
    };
  }
  return {
    themeClass: styles.cardTeal,
    iconBoxClass: styles.iconTeal,
    Icon: HeartPulse,
    secondaryText: 'Controlled',
  };
}

export function CareAtGlance({ conditions, careState = DEMO_CARE_STATE }) {
  return (
    <section className={styles.section} aria-labelledby="care-glance-heading">
      {/* Left Content: Title, Subtitle, and 3 Condition Cards */}
      <div className={styles.leftContent}>
        <div className={styles.headingGroup}>
          <h2 id="care-glance-heading" className={styles.sectionHeading}>
            Your Care at a Glance
          </h2>
          <p className={styles.sectionSubtitle}>
            Multiple conditions, One unified view.
          </p>
        </div>

        <div className={styles.conditionsRow}>
          {conditions.map((condition) => {
            const { themeClass, iconBoxClass, Icon, secondaryText } = getConditionMeta(condition);
            return (
              <div key={condition.id} className={`${styles.conditionCard} ${themeClass}`}>
                <div className={`${styles.iconBox} ${iconBoxClass}`}>
                  <Icon size={16} aria-hidden="true" />
                </div>
                <div className={styles.conditionInfo}>
                  <h3 className={styles.conditionName}>{condition.shortName}</h3>
                  <span className={styles.conditionSecondary}>{secondaryText}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Content: Overall Care State Arc Meter & Context */}
      <div className={styles.careStateSection} aria-label="Overall Care State">
        <div className={styles.meterContainer}>
          <svg
            className={styles.meterSvg}
            viewBox="0 0 160 90"
            width="160"
            height="90"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="glanceArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Inactive Background Track */}
            <path
              d="M 15 80 A 65 65 0 0 1 145 80"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="7"
              strokeLinecap="round"
            />

            {/* Multicolored Arc Progression */}
            <path
              d="M 15 80 A 65 65 0 0 1 145 80"
              fill="none"
              stroke="url(#glanceArcGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
          </svg>

          {/* Centered Patient Icon inside Arc Cavity */}
          <div className={styles.meterCenterIcon}>
            <User size={24} className={styles.personIcon} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.stateTextGroup}>
          <span className={styles.stateIntro}>Your care state is</span>
          <span className={styles.stateValue}>{careState?.status || "Stable"}</span>
          <p className={styles.stateSubtext}>
            Keep following your plan and focus on today's actions.
          </p>
        </div>
      </div>
    </section>
  );
}
