import React from 'react';
import { Layers, CheckCircle2, Clock } from 'lucide-react';
import styles from './CareState.module.css';

export function CareState({ careState }) {
  return (
    <section className={styles.section} aria-labelledby="care-state-heading">
      <div className={styles.card}>
        <div className={styles.primaryColumn}>
          <div className={styles.header}>
            <div className={styles.headerIcon}>
              <Layers size={18} aria-hidden="true" />
            </div>
            <div>
              <h2 id="care-state-heading" className={styles.title}>
                Overall Care Coordination State
              </h2>
              <p className={styles.subtitle}>
                Multidisciplinary alignment & cross-condition synchronization
              </p>
            </div>
          </div>

          <div className={styles.statusDisplay}>
            <div className={styles.statusBadge}>
              <CheckCircle2 size={16} className={styles.statusIcon} aria-hidden="true" />
              <span className={styles.statusText}>{careState.statusLabel}</span>
            </div>
            <p className={styles.statusDescription}>{careState.statusDescription}</p>
          </div>

          <div className={styles.alignmentBox}>
            <span className={styles.alignmentLabel}>Cross-Condition Alignment</span>
            <p className={styles.alignmentText}>{careState.careAlignmentNote}</p>
          </div>
        </div>

        <div className={styles.metricsColumn}>
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{careState.activeConditionsCount}</span>
              <span className={styles.metricLabel}>Conditions Co-Managed</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{careState.activePrescriptionsCount}</span>
              <span className={styles.metricLabel}>Active Regimens</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{careState.upcomingEventsCount}</span>
              <span className={styles.metricLabel}>Encounters in 14 Days</span>
            </div>

            <div className={styles.metricCard}>
              <span className={styles.metricValue}>{careState.attentionItemsCount}</span>
              <span className={styles.metricLabel}>Coordinated Action Items</span>
            </div>
          </div>

          <div className={styles.syncFooter}>
            <Clock size={12} className={styles.syncIcon} aria-hidden="true" />
            <span className={styles.syncText}>
              State verified: {careState.lastUpdated} • {careState.synchronizationStatus}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
