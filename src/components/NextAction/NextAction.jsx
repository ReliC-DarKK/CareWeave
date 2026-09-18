import React from 'react';
import { Compass, Clock, User, ChevronRight } from 'lucide-react';
import styles from './NextAction.module.css';

export function NextAction({ actions }) {
  return (
    <section className={styles.section} aria-labelledby="next-actions-heading">
      <div className={styles.header}>
        <div className={styles.headerTitleArea}>
          <div className={styles.headerIcon}>
            <Compass size={18} aria-hidden="true" />
          </div>
          <div>
            <h2 id="next-actions-heading" className={styles.title}>
              What Matters Now
            </h2>
            <p className={styles.subtitle}>
              Coordinated clinical priorities requiring attention or patient alignment
            </p>
          </div>
        </div>
        <div className={styles.engineNotice}>
          <span>Presentation Fixtures</span>
        </div>
      </div>

      <div className={styles.actionsList}>
        {actions.map((item) => (
          <article
            key={item.id}
            className={`${styles.actionCard} ${styles[`tier_${item.urgencyLevel}`]}`}
            aria-labelledby={`action-title-${item.id}`}
          >
            <div className={styles.cardTop}>
              <span className={styles.tierLabel}>{item.tier}</span>
              <span className={styles.conditionContext}>{item.relatedCondition}</span>
            </div>

            <h3 id={`action-title-${item.id}`} className={styles.actionTitle}>
              {item.title}
            </h3>

            <p className={styles.actionDescription}>{item.description}</p>

            <div className={styles.cardFooter}>
              <div className={styles.metadataGroup}>
                <div className={styles.metaItem}>
                  <Clock size={13} className={styles.metaIcon} aria-hidden="true" />
                  <span className={styles.metaText}>{item.targetDate}</span>
                </div>
                <div className={styles.metaDivider} />
                <div className={styles.metaItem}>
                  <User size={13} className={styles.metaIcon} aria-hidden="true" />
                  <span className={styles.metaText}>{item.assignedCareLead}</span>
                </div>
              </div>

              <button
                type="button"
                className={styles.actionButton}
                onClick={() => {}}
                aria-label={`Review details for ${item.title}`}
              >
                <span>View Protocol</span>
                <ChevronRight size={13} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
