import React from 'react';
import { Users, Mail, Clock } from 'lucide-react';
import styles from './CareTeam.module.css';

export function CareTeam({ members }) {
  return (
    <section className={styles.section} aria-labelledby="care-team-heading">
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Users size={18} className={styles.headerIcon} aria-hidden="true" />
          <div>
            <h2 id="care-team-heading" className={styles.title}>
              Care Team
            </h2>
            <p className={styles.subtitle}>
              Multidisciplinary clinicians coordinating your longitudinal care plan
            </p>
          </div>
        </div>
      </div>

      <div className={styles.teamGrid}>
        {members.map((member) => (
          <article key={member.id} className={styles.memberCard}>
            <div className={styles.memberMeta}>
              <h3 className={styles.memberName}>{member.name}</h3>
              <p className={styles.memberRole}>{member.role}</p>
              <p className={styles.memberDepartment}>
                {member.department} • {member.hospital}
              </p>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.availabilityRow}>
                <Clock size={12} className={styles.footerIcon} aria-hidden="true" />
                <span className={styles.availabilityText}>{member.availability}</span>
              </div>
              <a
                href={`mailto:${member.contactEmail}`}
                className={styles.contactLink}
                title={`Send direct query to ${member.name}`}
              >
                <Mail size={12} aria-hidden="true" />
                <span>{member.contactEmail}</span>
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
