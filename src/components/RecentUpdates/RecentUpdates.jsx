import React from 'react';
import { Bell } from 'lucide-react';
import styles from './RecentUpdates.module.css';

export function RecentUpdates({ updates }) {
  return (
    <section className={styles.section} aria-labelledby="recent-updates-heading">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Bell size={18} className={styles.headerIcon} aria-hidden="true" />
          <div>
            <h2 id="recent-updates-heading" className={styles.title}>
              Recent Health Updates
            </h2>
            <p className={styles.subtitle}>Recent system feeds, lab releases & clinical notes</p>
          </div>
        </div>
      </div>

      <div className={styles.updatesList}>
        {updates.map((update) => (
          <div key={update.id} className={styles.updateItem}>
            <div className={styles.updateHeader}>
              <span className={styles.updateType}>{update.type}</span>
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
