import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Zap,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  Calendar,
  UserCheck,
  Stethoscope,
  Activity,
  HeartPulse,
  Brain,
  Pill,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import styles from './SmartHandoff.module.css';

export function SmartHandoff() {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsGenerated(true);
    }, 550);
  };

  const handleReset = () => {
    setIsGenerated(false);
    setIsLoading(false);
    setCopyFeedback(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    const summaryText = `
CAREWEAVE SMART CLINICAL HANDOFF SNAPSHOT
==================================================
Patient: Sarah Jenkins | Age: 68y | MRN: #CW-92841
Code Status: Full Code | Primary Clinic: Memorial Cancer Center
Caregiver: Marcus Jenkins (Son / Primary Caregiver)

ACTIVE CONDITIONS:
1. Stage II Breast Cancer (Active Chemotherapy Cycle 3, Dr. Chen)
2. Type 2 Diabetes (Managed / Sub-optimal, HbA1c 8.2%, Dr. Patel)
3. Early-Stage Alzheimer's (Mild cognitive impairment, Caregiver-dependent)

CURRENT ACTIVE REGIMEN:
- Chemotherapy Cycle 3 Infusion (Dexamethasone pre-meds)
- Medications: Metformin 500mg BID, Donepezil 10mg QHS, Pantoprazole 40mg Daily, Amlodipine 5mg Daily

CRITICAL RECENT EVENTS (PAST 7 DAYS):
- [HIGH] HbA1c spike to 8.2% (Endocrinology) — Excursion triggered by chemo steroid pre-meds.
- [HIGH] Missed Metformin x2 (Adherence gap) — Patient experienced post-chemo nausea and skipped evening doses.
- [CONSIDERATION] Grade 2 Fatigue & Appetite Loss reported post-infusion (Oncology).

UPCOMING CARE MILESTONE:
- Tomorrow, 10:00 AM: Oncology Follow-up & Complete Blood Count (Dr. Chen)

CRITICAL CARE CONSIDERATIONS & CAREGIVER HANDOFF:
- Caregiver accompaniment required: Marcus Jenkins (Son) must be present for all regimen adjustments.
- Memory lapses noted during evening dosage routine; requires caregiver confirmation.
- Antiemetics must be synchronized 30 minutes prior to diabetic meals.
==================================================
Generated via CareWeave Longitudinal Health Record System
    `.trim();

    navigator.clipboard?.writeText(summaryText).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    }).catch(() => {
      // Fallback for restricted clipboard contexts
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    });
  };

  return (
    <section className={styles.container} aria-labelledby="smart-handoff-heading">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.iconBox} aria-hidden="true">
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h2 id="smart-handoff-heading" className={styles.title}>
              Smart Handoff / Cross-Specialty Care Summary
            </h2>
            <p className={styles.subtitle}>
              Rapid clinical synthesis for attending physicians, on-call specialists, and emergency care teams
            </p>
          </div>
        </div>

        {/* Story / Problem Banner */}
        <div className={styles.storyBanner} role="note">
          <span>
            <strong>Clinical Handoff Problem Solved:</strong> A new doctor shouldn't have to reconstruct the patient's story from scattered records.
          </span>
        </div>
      </div>

      {/* State 1: Un-generated Placeholder Card */}
      {!isGenerated && !isLoading && (
        <div className={styles.placeholderCard}>
          <div className={styles.placeholderIconWrap} aria-hidden="true">
            <Zap size={26} />
          </div>

          <div className={styles.placeholderTextGroup}>
            <h3 className={styles.placeholderTitle}>
              Generate Instant Clinical Transition Brief
            </h3>
            <p className={styles.placeholderDesc}>
              Synthesize Sarah's oncology, endocrinology, and cognitive neurology records into a single, high-fidelity handoff sheet. Automatically extracts active regimens, recent laboratory spikes, and caregiver dependencies.
            </p>
          </div>

          <div className={styles.featureList}>
            <span className={styles.featureBadge}>
              <Stethoscope size={13} color="var(--color-accent-primary)" aria-hidden="true" />
              <span>Multi-Specialty Triad</span>
            </span>
            <span className={styles.featureBadge}>
              <AlertTriangle size={13} color="var(--color-clinical-amber)" aria-hidden="true" />
              <span>Adherence & Friction Alerts</span>
            </span>
            <span className={styles.featureBadge}>
              <UserCheck size={13} color="var(--color-clinical-teal)" aria-hidden="true" />
              <span>Caregiver Handoff Protocol</span>
            </span>
          </div>

          <button
            type="button"
            className={styles.generateBtn}
            onClick={handleGenerate}
            id="generate-handoff-btn"
          >
            <Zap size={16} aria-hidden="true" />
            <span>Generate Handoff Summary</span>
          </button>
        </div>
      )}

      {/* State 2: Simulated Loading State */}
      {isLoading && (
        <div className={styles.loadingBox} role="status" aria-live="polite">
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.loadingText}>
            Synthesizing oncology notes, glycemic excursions, and caregiver observations...
          </p>
        </div>
      )}

      {/* State 3: Generated Patient Snapshot Presentation */}
      {isGenerated && !isLoading && (
        <div className={styles.snapshotSheet}>
          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.liveTag}>
              <span className={styles.liveDot} aria-hidden="true" />
              <span>Synthesized Handoff Brief • Updated Just Now</span>
            </div>

            <div className={styles.actionButtons}>
              {copyFeedback && <span className={styles.toast}>✓ Copied to Clipboard</span>}
              <button
                type="button"
                className={styles.toolBtn}
                onClick={handleCopy}
                title="Copy formatted handoff text"
              >
                <Copy size={13} aria-hidden="true" />
                <span>Copy Summary</span>
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={handlePrint}
                title="Export or print clinical snapshot"
              >
                <Printer size={13} aria-hidden="true" />
                <span>Export PDF / Print</span>
              </button>
              <button
                type="button"
                className={styles.toolBtn}
                onClick={handleReset}
                title="Reset to generator preview"
              >
                <RotateCcw size={13} aria-hidden="true" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Snapshot Content Body */}
          <div className={styles.snapshotBody}>
            {/* Header: Patient Demographics */}
            <div className={styles.demographicsRow}>
              <div className={styles.demoField}>
                <span className={styles.demoLabel}>Patient Name</span>
                <span className={styles.demoValue}>Sarah Jenkins</span>
              </div>
              <div className={styles.demoField}>
                <span className={styles.demoLabel}>Age & Gender</span>
                <span className={styles.demoValue}>68 years • Female</span>
              </div>
              <div className={styles.demoField}>
                <span className={styles.demoLabel}>Medical Record No.</span>
                <span className={styles.demoValue}>#CW-92841</span>
              </div>
              <div className={styles.demoField}>
                <span className={styles.demoLabel}>Code Status</span>
                <span className={styles.demoValue} style={{ color: 'var(--color-clinical-teal)' }}>
                  Full Code
                </span>
              </div>
              <div className={styles.demoField}>
                <span className={styles.demoLabel}>Primary Caregiver</span>
                <span className={styles.demoValue}>Marcus Jenkins (Son)</span>
              </div>
            </div>

            {/* Grid 1: Conditions & Treatment */}
            <div className={styles.snapshotGrid}>
              {/* Active Conditions */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionHeading}>
                  <Activity size={14} aria-hidden="true" />
                  <span>Active Diagnoses Triad</span>
                </h3>
                <div className={styles.conditionTriad}>
                  <div className={`${styles.conditionMiniCard} ${styles.conditionMiniCardRose}`}>
                    <div>
                      <span className={styles.conditionName}>Stage II Breast Cancer</span>
                      <div className={styles.conditionStatus}>Cycle 3 Chemotherapy • Dr. Chen (Oncology)</div>
                    </div>
                  </div>
                  <div className={`${styles.conditionMiniCard} ${styles.conditionMiniCardBlue}`}>
                    <div>
                      <span className={styles.conditionName}>Type 2 Diabetes</span>
                      <div className={styles.conditionStatus}>Sub-optimal Control (HbA1c 8.2%) • Dr. Patel</div>
                    </div>
                  </div>
                  <div className={`${styles.conditionMiniCard} ${styles.conditionMiniCardViolet}`}>
                    <div>
                      <span className={styles.conditionName}>Early-Stage Alzheimer's</span>
                      <div className={styles.conditionStatus}>Mild Cognitive Impairment • Caregiver Dependent</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Treatment & Medications */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionHeading}>
                  <Pill size={14} aria-hidden="true" />
                  <span>Current Active Treatment & Regimen</span>
                </h3>
                <div className={styles.treatmentCard}>
                  <h4 className={styles.treatmentTitle}>Active Chemotherapy Cycle 3</h4>
                  <p className={styles.treatmentDetail}>
                    Dexamethasone pre-medication regimen active. Post-infusion day +2.
                  </p>
                  <span className={styles.demoLabel} style={{ marginTop: '8px' }}>
                    Active Prescriptions (4):
                  </span>
                  <div className={styles.medList}>
                    <span className={styles.medPill}>Metformin 500mg BID</span>
                    <span className={styles.medPill}>Donepezil 10mg QHS</span>
                    <span className={styles.medPill}>Pantoprazole 40mg Daily</span>
                    <span className={styles.medPill}>Amlodipine 5mg Daily</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Critical Recent Events & Milestones */}
            <div className={styles.snapshotGrid}>
              {/* Critical Recent Events */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionHeading}>
                  <AlertTriangle size={14} aria-hidden="true" />
                  <span>Critical Recent Events (Past 7 Days)</span>
                </h3>
                <div className={styles.eventsList}>
                  <div className={`${styles.eventCard} ${styles.eventCardAlert}`}>
                    <AlertTriangle size={15} className={styles.eventIconAlert} aria-hidden="true" />
                    <div className={styles.eventContent}>
                      <div className={styles.eventTitleRow}>
                        <span className={styles.eventTitle}>HbA1c Spike: 8.2%</span>
                        <span className={styles.severityBadgeHigh}>High Priority</span>
                      </div>
                      <p className={styles.eventDesc}>
                        Acute glycemic excursion triggered by chemotherapy steroid pre-medication combined with irregular meals.
                      </p>
                    </div>
                  </div>

                  <div className={`${styles.eventCard} ${styles.eventCardAlert}`}>
                    <AlertTriangle size={15} className={styles.eventIconAlert} aria-hidden="true" />
                    <div className={styles.eventContent}>
                      <div className={styles.eventTitleRow}>
                        <span className={styles.eventTitle}>Missed Metformin × 2</span>
                        <span className={styles.severityBadgeHigh}>Adherence Gap</span>
                      </div>
                      <p className={styles.eventDesc}>
                        Post-chemo nausea and cognitive confusion led to missed evening doses on Sep 16 & 17.
                      </p>
                    </div>
                  </div>

                  <div className={styles.eventCard}>
                    <HeartPulse size={15} className={styles.eventIconCheck} aria-hidden="true" />
                    <div className={styles.eventContent}>
                      <div className={styles.eventTitleRow}>
                        <span className={styles.eventTitle}>Grade 2 Fatigue & Nausea</span>
                        <span className={styles.severityBadgeMed}>Clinical Consideration</span>
                      </div>
                      <p className={styles.eventDesc}>
                        Expected post-infusion symptoms; patient reports delayed appetite recovery.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Milestones */}
              <div className={styles.sectionBox}>
                <h3 className={styles.sectionHeading}>
                  <Calendar size={14} aria-hidden="true" />
                  <span>Next Clinical Milestone</span>
                </h3>
                <div className={styles.treatmentCard} style={{ borderLeft: '3px solid var(--color-accent-primary)' }}>
                  <h4 className={styles.treatmentTitle}>
                    Tomorrow, 10:00 AM: Oncology Follow-up & CBC
                  </h4>
                  <p className={styles.treatmentDetail}>
                    Attending: Dr. Chen • Memorial Comprehensive Cancer Center (Suite 4B)
                  </p>
                  <p className={styles.treatmentDetail} style={{ marginTop: '4px' }}>
                    <strong>Clinical Objectives:</strong> Review Cycle 3 tolerance, check ANC/WBC counts, and coordinate with Endocrinology on glycemic buffer adjustments.
                  </p>
                </div>
              </div>
            </div>

            {/* Critical Care Considerations & Caregiver Handoff */}
            <div className={styles.handoffAlertBox}>
              <div className={styles.handoffAlertHeader}>
                <UserCheck size={16} aria-hidden="true" />
                <span>Critical Care Considerations & Caregiver Handoff Instructions</span>
              </div>
              <ul className={styles.handoffPointsList}>
                <li className={styles.handoffPoint}>
                  <strong>Caregiver Accompaniment Mandatory:</strong> Marcus Jenkins (Son / Primary Caregiver, ph: +1 555-019-2834) must be present for any regimen changes or consent discussions.
                </li>
                <li className={styles.handoffPoint}>
                  <strong>Cognitive Vulnerability During Evening Routine:</strong> Memory lapses occur most frequently between 7:00 PM – 10:00 PM. Patient may state medications were taken when unverified.
                </li>
                <li className={styles.handoffPoint}>
                  <strong>Antiemetic / Diabetic Synchronization:</strong> Ensure Pantoprazole/Ondansetron is taken exactly 30 minutes before carbohydrate intake to facilitate predictable Metformin dosing.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default SmartHandoff;
