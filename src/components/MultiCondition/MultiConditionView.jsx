import React, { useState } from 'react';
import {
  GitMerge,
  Sparkles,
  ArrowDown,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Brain,
  Pill,
  Stethoscope,
  Info,
  Layers,
} from 'lucide-react';
import styles from './MultiConditionView.module.css';

const FILTERS = [
  { id: 'all', label: 'All Intersections (3 Active)' },
  { id: 'cancer-diabetes', label: 'Cancer ↔ Diabetes' },
  { id: 'diabetes-alzheimers', label: 'Diabetes ↔ Alzheimer\'s' },
];

const INTERACTION_ANALYSES = {
  all: {
    title: 'Cross-Condition Cascade Overview',
    friction:
      'Chemotherapy-induced nausea and fatigue disrupt regular carbohydrate intake schedules, causing erratic glucose spikes and drops. Simultaneously, early-stage cognitive lapses from Alzheimer\'s lead to missed Metformin doses and difficulty logging glycemic metrics independently.',
    recommendations: [
      'Synchronize antiemetic dosing (Pantoprazole/Ondansetron) 30 minutes before diabetic meal windows to prevent delayed gastric emptying.',
      'Delegate daily blood glucose logging and Metformin oversight to primary caregiver (Marcus Jenkins) via CareWeave companion alerts.',
      'Schedule joint oncology-endocrinology telemetry review to calibrate steroid pre-medication intervals against continuous glucose monitor (CGM) alerts.',
    ],
  },
  'cancer-diabetes': {
    title: 'Cancer ↔ Diabetes Physiological & Drug Friction',
    friction:
      'Dexamethasone pre-medication during active Chemotherapy Cycle 3 induces acute steroid-related hyperglycemia (readings peaking at 158 mg/dL). Concurrently, post-infusion nausea leads to skipped meals, precipitating sudden hypoglycemic vulnerability when Metformin is taken on an empty stomach.',
    recommendations: [
      'Adjust Metformin administration timing strictly with food tolerance rather than rigid clock hours on post-infusion days +1 through +3.',
      'Prescribe short-term glycemic buffer protocol coordinated between Dr. Chen (Oncology) and Dr. Patel (Endocrinology).',
      'Provide caregiver with rapid-acting glucose rescue instructions in the CareWeave portal.',
    ],
  },
  'diabetes-alzheimers': {
    title: 'Diabetes ↔ Alzheimer\'s Cognitive & Adherence Friction',
    friction:
      'Managing a dual-regimen (Metformin 500mg BID + Donepezil 10mg QHS) with strict meal dependencies exceeds independent cognitive capacity during post-chemo fatigue episodes. Sarah recorded 2 missed doses this week and experienced confusion regarding morning vs. evening pill organizers.',
    recommendations: [
      'Transition all chronic oral medications into pre-sorted blister packs managed by Marcus Jenkins.',
      'Enable automated CareWeave caregiver confirmation notifications upon scheduled medication administration windows.',
      'Reduce cognitive burden by removing patient-facing requirement for manual fasting glucose journaling.',
    ],
  },
};

export function MultiConditionView() {
  const [activeFilter, setActiveFilter] = useState('all');

  const currentAnalysis = INTERACTION_ANALYSES[activeFilter];

  // Helper flags for highlighting
  const isCancerHighlighted = activeFilter === 'all' || activeFilter === 'cancer-diabetes';
  const isDiabetesHighlighted = true; // Present in all active filters
  const isAlzheimersHighlighted = activeFilter === 'all' || activeFilter === 'diabetes-alzheimers';

  return (
    <section className={styles.container} aria-labelledby="multi-condition-heading">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.iconBox} aria-hidden="true">
            <GitMerge size={20} />
          </div>
          <div>
            <h2 id="multi-condition-heading" className={styles.title}>
              Multi-Condition Interaction Map
            </h2>
            <p className={styles.subtitle}>
              Cross-specialty clinical correlation for complex co-occurring diagnoses
            </p>
          </div>
        </div>

        <div className={styles.patientBadge}>
          <Activity size={14} color="var(--color-clinical-teal)" aria-hidden="true" />
          <span>Patient: <strong>Sarah Jenkins</strong> (3 Intersecting Conditions)</span>
        </div>
      </div>

      {/* Core Insight Banner */}
      <div className={styles.insightBanner} role="note">
        <div className={styles.insightIconWrapper} aria-hidden="true">
          <Sparkles size={18} />
        </div>
        <div className={styles.insightContent}>
          <span className={styles.insightTitle}>
            CareWeave identifies how separate conditions intersect instead of siloing records.
          </span>
          <p className={styles.insightText}>
            Traditional portals treat oncology, diabetes, and neurology as isolated specialties. CareWeave
            dynamically maps how treatment side-effects in one condition cascade into chronic management risks in another.
          </p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className={styles.filterBar} role="tablist" aria-label="Filter condition intersections">
        <span className={styles.filterLabel}>Focus View:</span>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.filterPill} ${isActive ? styles.activeFilterPill : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Visual Map / Flow Diagram */}
      <div className={styles.flowContainer} aria-label="Condition Interaction Diagram">
        {/* Node 1: Cancer */}
        <div
          className={`${styles.nodeCard} ${
            isCancerHighlighted ? styles.highlightedNode : styles.dimmedNode
          }`}
        >
          <div className={styles.nodeHeader}>
            <span className={styles.nodeBadgeRose}>Oncology</span>
            <Pill size={14} color="var(--tint-rose-accent)" aria-hidden="true" />
          </div>
          <h3 className={styles.nodeTitle}>Breast Cancer: Active Chemotherapy</h3>
          <p className={styles.nodeDesc}>
            Cycle 3 Infusion active. Dexamethasone pre-medication regimen administered to prevent hypersensitivity.
          </p>
          <div className={styles.nodeFooter}>
            <Stethoscope size={13} aria-hidden="true" />
            <span>Dr. Chen • Attending Oncology</span>
          </div>
        </div>

        {/* Connector 1: Care State Impact */}
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorBadge}>
            <ArrowDown size={14} className={styles.connectorIcon} />
            <span>Extreme Fatigue & Appetite Loss</span>
          </div>
        </div>

        {/* Node 2: Diabetes */}
        <div
          className={`${styles.nodeCard} ${
            isDiabetesHighlighted ? styles.highlightedNode : styles.dimmedNode
          }`}
        >
          <div className={styles.nodeHeader}>
            <span className={styles.nodeBadgeBlue}>Endocrinology</span>
            <Activity size={14} color="var(--tint-blue-accent)" aria-hidden="true" />
          </div>
          <h3 className={styles.nodeTitle}>Diabetes: Glucose Fluctuations</h3>
          <p className={styles.nodeDesc}>
            Post-chemo anorexia causes skipped meals, while steroid pre-meds trigger spikes (HbA1c 8.2%). Metformin 500mg dosing becomes irregular.
          </p>
          <div className={styles.nodeFooter}>
            <Stethoscope size={13} aria-hidden="true" />
            <span>Dr. Patel • Endocrinology</span>
          </div>
        </div>

        {/* Connector 2: Cognitive Co-dependency */}
        <div className={styles.connector} aria-hidden="true">
          <div className={styles.connectorBadge}>
            <ArrowLeftRight size={14} className={styles.connectorIcon} />
            <span>Cognitive Friction</span>
          </div>
        </div>

        {/* Node 3: Alzheimer's */}
        <div
          className={`${styles.nodeCard} ${
            isAlzheimersHighlighted ? styles.highlightedNode : styles.dimmedNode
          }`}
        >
          <div className={styles.nodeHeader}>
            <span className={styles.nodeBadgeViolet}>Neurology</span>
            <Brain size={14} color="var(--tint-violet-accent)" aria-hidden="true" />
          </div>
          <h3 className={styles.nodeTitle}>Alzheimer's: Caregiver Dependency</h3>
          <p className={styles.nodeDesc}>
            Memory lapses impair multi-drug schedules (Donepezil 10mg missed 2x). Patient cannot independently reconcile meal timing with oral meds.
          </p>
          <div className={styles.nodeFooter}>
            <Info size={13} aria-hidden="true" />
            <span>Caregiver: Marcus Jenkins</span>
          </div>
        </div>
      </div>

      {/* Simulated Interaction Analysis Card */}
      <div className={styles.analysisCard}>
        <div className={styles.analysisHeader}>
          <div className={styles.analysisTitleGroup}>
            <Layers size={18} color="var(--color-accent-primary)" aria-hidden="true" />
            <h3 className={styles.analysisTitle}>
              Simulated Interaction Analysis: {currentAnalysis.title}
            </h3>
          </div>
          <span className={styles.activeTag}>AI-Synthesized Clinical Correlation</span>
        </div>

        <div className={styles.analysisGrid}>
          {/* Friction Box */}
          <div className={styles.analysisBox}>
            <div className={`${styles.boxHeader} ${styles.boxHeaderAlert}`}>
              <AlertTriangle size={15} aria-hidden="true" />
              <span>Drug-Condition & Treatment Friction</span>
            </div>
            <p className={styles.analysisText}>{currentAnalysis.friction}</p>
          </div>

          {/* Recommendations Box */}
          <div className={styles.analysisBox}>
            <div className={`${styles.boxHeader} ${styles.boxHeaderCheck}`}>
              <CheckCircle2 size={15} aria-hidden="true" />
              <span>Recommended Clinical Adjustments</span>
            </div>
            <ul className={styles.recommendationsList}>
              {currentAnalysis.recommendations.map((rec, idx) => (
                <li key={idx} className={styles.recommendationItem}>
                  <strong>Action {idx + 1}:</strong> {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MultiConditionView;
