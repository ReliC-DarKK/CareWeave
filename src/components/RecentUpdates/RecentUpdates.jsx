import React from 'react';
import styles from './RecentUpdates.module.css';

function getUpdateBadgeClass(type) {
  const lower = type.toLowerCase();
  if (lower.includes('diag') || lower.includes('lab')) return styles.badgeViolet;
  if (lower.includes('note') || lower.includes('coord')) return styles.badgeBlue;
  if (lower.includes('pharm') || lower.includes('rx')) return styles.badgeIndigo;
  if (lower.includes('tele') || lower.includes('vital')) return styles.badgeTeal;
  return styles.badgeNeutral;
}

export function RecentUpdates({ updates }) {
  return (
    <section className={styles.section} aria-labelledby="recent-updates-heading">
      <div className={styles.header}>
        <div className={styles.visualAnchor} aria-hidden="true" />
        <div>
          <h2 id="recent-updates-heading" className={styles.title}>
            Recent Health Updates
          </h2>
          <p className={styles.subtitle}>Diagnostic releases, pharmacy authorizations & notes</p>
        </div>
      </div>

      <div className={styles.updatesList}>
        {updates.map((update) => (
          <div key={update.id} className={styles.updateRow}>
            <div className={styles.rowTop}>
              <span className={`${styles.updateType} ${getUpdateBadgeClass(update.type)}`}>
                {update.type}
              </span>
              <span className={styles.updateTime}>{update.timestamp}</span>
            </div>
            <h3 className={styles.updateTitle}>{update.title}</h3>
            <p className={styles.updateDetail}>{update.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
