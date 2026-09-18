import React from 'react';
import { Mail, Phone } from 'lucide-react';
import styles from './CareTeam.module.css';

export function CareTeam({ members }) {
  return (
    <section className={styles.section} aria-labelledby="care-team-heading">
      <div className={styles.header}>
        <div className={styles.visualAnchor} aria-hidden="true" />
        <div>
          <h2 id="care-team-heading" className={styles.title}>
            Multidisciplinary Care Team
          </h2>
          <p className={styles.subtitle}>
            Assigned clinicians coordinating your longitudinal care plan
          </p>
        </div>
      </div>

      <div className={styles.rosterContainer}>
        {members.map((member) => (
          <div key={member.id} className={styles.rosterRow}>
            <div className={styles.providerMain}>
              <div className={styles.nameRoleLine}>
                <h3 className={styles.memberName}>{member.name}</h3>
                <span className={styles.memberSpecialty}>{member.specialty}</span>
                <span className={styles.roleTag}>{member.role}</span>
              </div>
              <p className={styles.careRelationshipText}>
                <strong>Care Relationship:</strong> {member.careRelationship}
              </p>
              <p className={styles.memberDepartment}>
                {member.department} • {member.hospital}
              </p>
            </div>

            <div className={styles.providerSide}>
              <span className={styles.availabilityText}>{member.availability}</span>
              <div className={styles.contactButtonsRow}>
                <a
                  href={`tel:${(member.phone || '+15552348900').replace(/[^0-9+]/g, '')}`}
                  className={styles.phoneAction}
                  title={`Call ${member.name}`}
                  aria-label={`Call ${member.name} at ${member.phone}`}
                >
                  <Phone size={12} aria-hidden="true" />
                  <span>Call {member.phone}</span>
                </a>
                <a
                  href={`mailto:${member.contactEmail}`}
                  className={styles.contactAction}
                  title={`Message ${member.name}`}
                >
                  <Mail size={12} aria-hidden="true" />
                  <span>Email</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
