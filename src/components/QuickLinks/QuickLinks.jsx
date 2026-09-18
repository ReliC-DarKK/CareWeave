import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from './QuickLinks.module.css';

export function QuickLinks({ links }) {
  return (
    <section className={styles.section} aria-labelledby="quick-links-heading">
      <div className={styles.header}>
        <div className={styles.visualAnchor} aria-hidden="true" />
        <div>
          <h2 id="quick-links-heading" className={styles.title}>
            Clinical Portals & Tools
          </h2>
          <p className={styles.subtitle}>Direct shortcuts to unified records and schedules</p>
        </div>
      </div>

      <div className={styles.linksList}>
        {links.map((link) => (
          <Link key={link.id} to={link.path} className={styles.linkRow}>
            <div className={styles.linkTextGroup}>
              <span className={styles.linkTitle}>{link.title}</span>
              <span className={styles.linkDescription}>{link.description}</span>
            </div>
            <ArrowRight size={13} className={styles.linkArrow} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
