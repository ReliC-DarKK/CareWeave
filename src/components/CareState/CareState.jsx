import React from 'react';
import styles from './CareState.module.css';

export function CareState({ careState }) {
  const status = careState?.status || "Stable";
  const supportingText = careState?.supportingText || "3 primary conditions co-managed across care";
  const lastUpdated = careState?.lastUpdated || "Today, 08:30 AM";

  return (
    <section className={styles.careStateCard} aria-labelledby="care-state-title">
      <div className={styles.cardHeader}>
        <div className={styles.visualAnchor} aria-hidden="true" />
        <h3 id="care-state-title" className={styles.cardTitle}>Overall Care State</h3>
      </div>

      <div className={styles.meterWrapper}>
        <div className={styles.meterContainer}>
          <svg
            className={styles.meterSvg}
            viewBox="0 0 200 115"
            width="200"
            height="115"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="careStateArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B497A" />
                <stop offset="50%" stopColor="#2563EB" />
                <stop offset="100%" stopColor="#0F766E" />
              </linearGradient>
            </defs>

            {/* Inactive Background Arc Track */}
            <path
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="8"
              strokeLinecap="round"
            />

            {/* Restrained Indigo/Blue/Teal Active Arc Progression */}
            <path
              className={styles.meterActiveArc}
              d="M 25 105 A 75 75 0 0 1 175 105"
              fill="none"
              stroke="url(#careStateArcGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="235.6"
              strokeDashoffset="35"
            />
          </svg>

          {/* Prominent Center Value inside the Arc */}
          <div className={styles.meterCenterContent}>
            <span className={styles.meterValue}>{status}</span>
          </div>
        </div>

        {/* Small supporting line below */}
        <div className={styles.supportingBlock}>
          <p className={styles.supportingLinePrimary}>3 primary conditions</p>
          <p className={styles.supportingLineSecondary}>co-managed across care</p>
        </div>
      </div>

      <div className={styles.metaRow}>
        <span>Verified: {lastUpdated}</span>
      </div>
    </section>
  );
}
