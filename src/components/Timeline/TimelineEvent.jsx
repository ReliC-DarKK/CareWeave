import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, Pill, ExternalLink } from 'lucide-react';
import styles from './Timeline.module.css';

function getEventCategoryTheme(category) {
  switch (category) {
    case 'Vitals & Biometrics':
      return {
        themeClass: styles.eventTeal,
        badgeClass: styles.badgeTeal,
      };
    case 'Medication Adherence':
      return {
        themeClass: styles.eventIndigo,
        badgeClass: styles.badgeIndigo,
      };
    case 'Diagnostic Lab':
      return {
        themeClass: styles.eventViolet,
        badgeClass: styles.badgeViolet,
      };
    case 'Clinical Encounter':
    default:
      return {
        themeClass: styles.eventBlue,
        badgeClass: styles.badgeBlue,
      };
  }
}

export function TimelineEvent({ event, isLast }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { themeClass, badgeClass } = getEventCategoryTheme(event.category);

  return (
    <div className={`${styles.eventItem} ${themeClass} ${isLast ? styles.isLastItem : ''}`}>
      {/* Left Date Column */}
      <div className={styles.dateColumn}>
        <span className={styles.dateGroupBadge}>{event.dateGroup || event.date}</span>
        <span className={styles.eventFullDate}>{event.date}</span>
        <span className={styles.eventTimeText}>{event.time}</span>
      </div>

      {/* Continuous Vertical Track & Marker */}
      <div className={styles.trackColumn}>
        <div className={styles.timelinePip} aria-hidden="true" />
        {!isLast && <div className={styles.trackLine} aria-hidden="true" />}
      </div>

      {/* Event Details Card */}
      <div className={styles.eventDetails}>
        <div
          className={`${styles.eventMain} ${isDetailsOpen ? styles.eventMainExpanded : ''}`}
          onClick={(e) => {
            if (e.target.closest('a') || e.target.closest('button')) return;
            setIsDetailsOpen((prev) => !prev);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              if (e.target.closest('a') || e.target.closest('button')) return;
              e.preventDefault();
              setIsDetailsOpen((prev) => !prev);
            }
          }}
          aria-expanded={isDetailsOpen}
          aria-label={`${isDetailsOpen ? 'Hide' : 'View'} details for ${event.title}`}
        >
          <div className={styles.titleLine}>
            <div className={styles.titleTextGroup}>
              <h4 className={styles.eventTitle}>{event.title}</h4>
              {event.detail && (
                <p className={styles.eventDetailLine}>{event.detail}</p>
              )}
            </div>

            <div className={styles.rightActionGroup}>
              <div className={styles.tagsGroup}>
                <span className={styles.conditionTag}>{event.relatedCondition}</span>
                <span className={`${styles.categoryLabel} ${badgeClass}`}>
                  {event.category}
                </span>
              </div>

              <button
                type="button"
                className={styles.viewDetailsBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailsOpen((prev) => !prev);
                }}
                aria-expanded={isDetailsOpen}
                aria-label={`${isDetailsOpen ? 'Hide' : 'View'} details for ${event.title}`}
              >
                <span>{isDetailsOpen ? 'Hide Details' : 'View Details'}</span>
                <ChevronRight
                  size={13}
                  className={`${styles.detailsChevron} ${isDetailsOpen ? styles.detailsChevronOpen : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>

          <p className={styles.eventSummary}>{event.summary}</p>

          <div className={styles.eventMetaFooter}>
            <span className={styles.sourceText}>
              <strong>Source:</strong> {event.recordedBy}
            </span>
            {event.clinicalContext && (
              <>
                <span className={styles.footerSeparator}>•</span>
                <span className={styles.contextText}>{event.clinicalContext}</span>
              </>
            )}
          </div>

          {/* Expandable Clinical Details Drawer */}
          {isDetailsOpen && (
            <div
              className={styles.timelineDetailsDrawer}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.drawerHeader}>
                <span className={styles.drawerHeading}>Reconciled Medical Records & Prescriptions</span>
                <span className={styles.eventRefTag}>Milestone Ref: {event.id}</span>
              </div>

              <div className={styles.drawerGrid}>
                {/* Linked Medical Record Link */}
                {event.linkedRecord && (
                  <div className={styles.drawerItem}>
                    <span className={styles.itemLabel}>ASSOCIATED MEDICAL RECORD</span>
                    <Link
                      to={`/records?highlight=${event.linkedRecord.id}`}
                      className={styles.recordLinkCard}
                      title={`Open ${event.linkedRecord.name} in Health Records`}
                    >
                      <div className={styles.recordIconBox}>
                        <FileText size={15} aria-hidden="true" />
                      </div>
                      <div className={styles.linkInfo}>
                        <span className={styles.linkTitle}>{event.linkedRecord.name}</span>
                        <span className={styles.linkType}>{event.linkedRecord.type} · View in Health Records →</span>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Linked Medication Link */}
                {event.linkedMedication && (
                  <div className={styles.drawerItem}>
                    <span className={styles.itemLabel}>ASSOCIATED MEDICATION</span>
                    <Link
                      to={`/medications?highlight=${event.linkedMedication.id}`}
                      className={styles.medicationLinkCard}
                      title={`Open ${event.linkedMedication.name} in Medications`}
                    >
                      <div className={styles.medIconBox}>
                        <Pill size={15} aria-hidden="true" />
                      </div>
                      <div className={styles.linkInfo}>
                        <span className={styles.linkTitle}>{event.linkedMedication.name}</span>
                        <span className={styles.linkType}>{event.linkedMedication.dosage} · View in Medications →</span>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Clinical Protocol */}
                {event.clinicalProtocol && (
                  <div className={styles.drawerItemFull}>
                    <span className={styles.itemLabel}>CLINICAL PROTOCOL & GUIDANCE</span>
                    <p className={styles.protocolText}>{event.clinicalProtocol}</p>
                  </div>
                )}

                {/* Coordinating Clinician */}
                {event.assignedCareLead && (
                  <div className={styles.drawerItemFull}>
                    <span className={styles.itemLabel}>COORDINATING CARE LEAD</span>
                    <p className={styles.protocolText}>{event.assignedCareLead}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
