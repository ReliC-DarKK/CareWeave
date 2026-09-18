import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, Compass } from 'lucide-react';
import styles from './QuickLinks.module.css';

export function QuickLinks({ links }) {
  return (
    <section className={styles.section} aria-labelledby="quick-links-heading">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Compass size={18} className={styles.headerIcon} aria-hidden="true" />
          <div>
            <h2 id="quick-links-heading" className={styles.title}>
              Quick Clinical Portals
            </h2>
            <p className={styles.subtitle}>Direct navigation to consolidated records & schedules</p>
          </div>
        </div>
      </div>

      <div className={styles.linksGrid}>
        {links.map((link) => (
          <Link key={link.id} to={link.path} className={styles.linkCard}>
            <div className={styles.linkBody}>
              <h3 className={styles.linkTitle}>{link.title}</h3>
              <p className={styles.linkDescription}>{link.description}</p>
            </div>
            <ExternalLink size={14} className={styles.linkIcon} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
