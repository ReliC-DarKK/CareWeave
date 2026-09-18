import React, { useState } from 'react';
import { GitBranch, Layers, AlertTriangle } from 'lucide-react';
import { TimelineEvent } from '../components/Timeline/TimelineEvent';
import {
  DEMO_TIMELINE_EVENTS,
  DEMO_MULTI_CONDITION_INTERACTIONS,
  DEMO_CARE_GAPS,
} from '../data/mockData';
import styles from './CareJourney.module.css';

const FILTERS = [
  'All',
  'Conditions',
  'Tests',
  'Medications',
  'Appointments',
];

export function CareJourney() {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredEvents = selectedFilter === 'All'
    ? DEMO_TIMELINE_EVENTS
    : DEMO_TIMELINE_EVENTS.filter((e) => e.filterType === selectedFilter);

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div className={styles.headerTitleRow}>
          <div className={styles.visualAnchor} aria-hidden="true" />
          <div>
            <h1 className={styles.pageTitle}>Care Journey Timeline</h1>
            <p className={styles.pageSubtitle}>
              Longitudinal healthcare journey across oncology, endocrinology, and cardiovascular care
            </p>
          </div>
        </div>
      </header>

      {/* P4 Feature: Multi-Condition Interaction Section */}
      <section className={styles.interactionSection} aria-labelledby="multi-condition-heading">
        <div className={styles.sectionHeader}>
          <Layers size={16} className={styles.sectionIcon} aria-hidden="true" />
          <h2 id="multi-condition-heading" className={styles.sectionHeading}>
            Multi-Condition Interactions & Cross-Specialty Protocols
          </h2>
        </div>

        <div className={styles.interactionGrid}>
          {DEMO_MULTI_CONDITION_INTERACTIONS.map((item) => (
            <article key={item.id} className={styles.interactionCard}>
              <div className={styles.interactionTop}>
                <span className={styles.interactionType}>{item.interactionType}</span>
                <span className={styles.interactionStatus}>{item.status}</span>
              </div>
              <h3 className={styles.interactionTitle}>
                {item.primaryCondition} ↔ {item.secondaryCondition}
              </h3>
              <p className={styles.interactionSummary}>{item.summary}</p>
              <div className={styles.protocolBox}>
                <span className={styles.protocolLabel}>Clinical Protocol</span>
                <p className={styles.protocolText}>{item.clinicalGuideline}</p>
              </div>
              <div className={styles.interactionFooter}>
                <span>Lead Clinicians: {item.leadClinicians}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Filter / Navigation Row (Restrained Tabs, not pill badges) */}
      <div className={styles.filterRow} role="tablist" aria-label="Timeline category filters">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={selectedFilter === filter}
            className={`${styles.filterTab} ${selectedFilter === filter ? styles.filterTabActive : ''}`}
            onClick={() => setSelectedFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Full Longitudinal Timeline */}
      <section className={styles.timelineSection}>
        <div className={styles.timelineStream}>
          {filteredEvents.map((event, index) => (
            <TimelineEvent
              key={event.id}
              event={event}
              isLast={index === filteredEvents.length - 1}
            />
          ))}
        </div>
      </section>

      {/* Care & Surveillance Gaps */}
      <section className={styles.gapsSection}>
        <div className={styles.sectionHeader}>
          <AlertTriangle size={16} className={styles.gapsIcon} aria-hidden="true" />
          <h2 className={styles.sectionHeading}>Identified Surveillance Intervals & Care Gaps</h2>
        </div>
        <div className={styles.gapsGrid}>
          {DEMO_CARE_GAPS.map((gap) => (
            <div key={gap.id} className={styles.gapCard}>
              <div className={styles.gapTop}>
                <span className={styles.gapBadge}>{gap.category}</span>
                <span className={styles.gapCondition}>{gap.relatedCondition}</span>
              </div>
              <h3 className={styles.gapTitle}>{gap.title}</h3>
              <p className={styles.gapNote}><strong>Interval:</strong> {gap.statusNote}</p>
              <p className={styles.gapRec}>{gap.recommendation}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
