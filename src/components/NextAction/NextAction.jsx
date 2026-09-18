import React from 'react';
import { Clock, User, ChevronRight, Calendar } from 'lucide-react';
import styles from './NextAction.module.css';

function getConditionTagClass(conditionName) {
  const lower = (conditionName || '').toLowerCase();
  if (lower.includes('breast') || lower.includes('cancer')) return styles.tagRose;
  if (lower.includes('diabetes') || lower.includes('glucose')) return styles.tagBlue;
  if (lower.includes('hypertension') || lower.includes('pressure')) return styles.tagTeal;
  return styles.tagNeutral;
}

export function NextAction({ actions }) {
  if (!actions || actions.length === 0) return null;

  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const primaryAction = actions[0];
  // Keep only 1 or 2 very compact upcoming items per user requirement
  const secondaryActions = actions.slice(1, 3);

  return (
    <section className={styles.section} aria-labelledby="next-actions-heading">
      <div className={styles.sectionHeader}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <h3 id="next-actions-heading" className={styles.sectionTitle}>
            What Matters Now
          </h3>
        </div>
      </div>

      {/* Primary Action — Prominent Main Focal Point */}
      <div className={styles.focalCard} aria-labelledby={`primary-action-${primaryAction.id}`}>
        <div className={styles.focalTop}>
          <span className={styles.focalBadge}>{primaryAction.tier}</span>
          <span className={`${styles.conditionTag} ${getConditionTagClass(primaryAction.relatedCondition)}`}>
            {primaryAction.relatedCondition}
          </span>
        </div>

        <h4 id={`primary-action-${primaryAction.id}`} className={styles.focalTitle}>
          {primaryAction.title}
        </h4>

        <p className={styles.focalDescription}>
          {primaryAction.description}
        </p>

        <div className={styles.focalFooter}>
          <div className={styles.focalMeta}>
            <div className={styles.metaItem}>
              <Clock size={13} className={styles.metaIcon} aria-hidden="true" />
              <span className={styles.metaHighlight}>{primaryAction.targetDate}</span>
            </div>
            <div className={styles.metaDivider} aria-hidden="true" />
            <div className={styles.metaItem}>
              <User size={13} className={styles.metaIcon} aria-hidden="true" />
              <span>{primaryAction.assignedCareLead}</span>
            </div>
          </div>

          <button
            type="button"
            className={styles.viewDetailsButton}
            onClick={() => setIsDetailsOpen((prev) => !prev)}
            aria-expanded={isDetailsOpen}
            aria-label={`${isDetailsOpen ? 'Hide' : 'View'} details for ${primaryAction.title}`}
          >
            <span>{isDetailsOpen ? 'Hide Details' : 'View Details'}</span>
            <ChevronRight
              size={14}
              className={`${styles.detailsIcon} ${isDetailsOpen ? styles.detailsIconOpen : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Expandable Clinical Protocol Details */}
        {isDetailsOpen && (
          <div className={styles.actionDetailsDrawer}>
            <div className={styles.detailsHeader}>
              <strong>Clinical Protocol & Preparation Checklist</strong>
              <span className={styles.orderNumber}>Requisition ID: CW-8910</span>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Tests Included</span>
                <p className={styles.detailText}>
                  Complete Blood Count (CBC with diff), Comprehensive Metabolic Panel (CMP), and Liver Function Panel (LFT).
                </p>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Facility & Timing</span>
                <p className={styles.detailText}>
                  Metro Central Laboratory · Suite 102 · Target: Tomorrow at 9:00 AM (Arrive 15 mins early).
                </p>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Patient Fasting Protocol</span>
                <p className={styles.detailText}>
                  8-hour overnight fasting required for accurate glycemic and metabolic values. Water permitted.
                </p>
              </div>

              <div className={styles.detailBlock}>
                <span className={styles.detailLabel}>Clinical Urgency</span>
                <p className={styles.detailText}>
                  Mandatory 48-hour pre-chemotherapy safety clearance for Cycle 4 AC-T infusion on Sep 22.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1–2 Very Compact Upcoming Items */}
      {secondaryActions.length > 0 && (
        <div className={styles.upcomingBlock}>
          <span className={styles.upcomingHeader}>Upcoming Follow-ups</span>
          <div className={styles.upcomingList}>
            {secondaryActions.map((item) => (
              <div key={item.id} className={styles.upcomingItem}>
                <div className={styles.upcomingMain}>
                  <span className={`${styles.conditionDot} ${getConditionTagClass(item.relatedCondition)}`} aria-hidden="true" />
                  <span className={styles.upcomingTitle}>{item.title}</span>
                  <span className={styles.upcomingCondition}>({item.relatedCondition})</span>
                </div>
                <div className={styles.upcomingDate}>
                  <Calendar size={12} className={styles.dateIcon} aria-hidden="true" />
                  <span>{item.targetDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
