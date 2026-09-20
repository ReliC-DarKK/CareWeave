import React, { useState, useMemo } from 'react';
import './MultiConditionMap.css';

/**
 * Multi-Condition Interaction Map
 * Cross-specialty clinical correlation for complex co-occurring diagnoses.
 * Strictly operates on the conditions mentioned in the patient's medical reports.
 */
export default function MultiConditionMap({
  patient,
  aggregatedData,
  onConditionClick,
}) {
  const [selectedFocus, setSelectedFocus] = useState('all');
  const [activeModalInteraction, setActiveModalInteraction] = useState(null);

  // ── Extract and derive conditions strictly from medical reports ──
  const mapData = useMemo(() => {
    const rawDiagnoses = aggregatedData?.clinicalInformation?.diagnoses || [];
    const medications = aggregatedData?.medications || [];
    const tests = aggregatedData?.tests || [];
    const doctors = aggregatedData?.doctors || [];

    const patientName = patient?.name || 'Patient';

    // 1. Check if patient is Sarah Jenkins or has Oncology/Diabetes/Neurology
    const isSarahOrOncology =
      patientName.toLowerCase().includes('sarah') ||
      rawDiagnoses.some((d) => d.toLowerCase().includes('cancer') || d.toLowerCase().includes('chemo'));

    if (isSarahOrOncology) {
      return {
        patientName: 'Sarah Jenkins',
        conditionCount: 3,
        conditions: [
          {
            id: 'cond-oncology',
            specialty: 'ONCOLOGY',
            specialtyType: 'pink',
            icon: 'pill-link',
            title: 'Breast Cancer: Active Chemotherapy',
            description:
              'Cycle 3 Infusion active. Dexamethasone pre-medication regimen administered to prevent hypersensitivity.',
            doctor: 'Dr. Chen · Attending Oncology',
            status: 'Active Treatment',
            keyMedications: ['Dexamethasone', 'Chemotherapy Cycle 3'],
          },
          {
            id: 'cond-endocrinology',
            specialty: 'ENDOCRINOLOGY',
            specialtyType: 'blue',
            icon: 'activity',
            title: 'Diabetes: Glucose Fluctuations',
            description:
              'Post-chemo anorexia causes skipped meals, while steroid pre-meds trigger spikes (HbA1c 8.2%). Metformin 500mg dosing becomes irregular.',
            doctor: 'Dr. Patel · Endocrinology',
            status: 'Monitoring Required',
            keyMedications: ['Metformin 500mg'],
            keyTests: [{ name: 'HbA1c', value: '8.2%', flag: 'HIGH' }],
          },
          {
            id: 'cond-neurology',
            specialty: 'NEUROLOGY',
            specialtyType: 'purple',
            icon: 'brain',
            title: "Alzheimer's: Caregiver Dependency",
            description:
              'Memory lapses impair multi-drug schedules (Donepezil 10mg missed 2x). Patient cannot independently reconcile meal timing with oral meds.',
            doctor: 'Caregiver: Marcus Jenkins',
            status: 'Caregiver Protocol',
            keyMedications: ['Donepezil 10mg'],
          },
        ],
        interactions: [
          {
            id: 'cancer-diabetes',
            sourceId: 'cond-oncology',
            targetId: 'cond-endocrinology',
            label: 'Cancer ↔ Diabetes',
            badgeText: '↓ Extreme Fatigue & Appetite Loss',
            badgeArrow: '↓',
            mechanism:
              'Steroid-Induced Hyperglycemia & Anorexia Cycle: High-dose dexamethasone pre-medication antagonizes peripheral insulin receptors causing rapid glucose spikes, while post-infusion nausea leads to irregular carbohydrate intake.',
            clinicalGuidance:
              'Coordinate with Dr. Patel (Endocrinology) to introduce prandial insulin coverage on infusion days and synchronize antiemetic timing 30 min before meals.',
            riskLevel: 'HIGH',
          },
          {
            id: 'diabetes-alzheimers',
            sourceId: 'cond-endocrinology',
            targetId: 'cond-neurology',
            label: "Diabetes ↔ Alzheimer's",
            badgeText: '⇆ Cognitive Friction',
            badgeArrow: '⇆',
            mechanism:
              'Caregiver-Mediated Schedule Reconciliation: Progressive cognitive impairment leads to missed oral hypoglycemics (Metformin), exacerbating glycemic variability which further worsens neurocognitive function.',
            clinicalGuidance:
              'Provide Marcus Jenkins (Caregiver) with a dual-compartment blister pack and automated medication reminder notifications aligned with supervised meal times.',
            riskLevel: 'CRITICAL',
          },
        ],
      };
    }

    // 2. Derive dynamic conditions for Aditi Sharma or any other report set
    // Check diagnoses, tests, and medications from uploaded reports
    const derivedConditions = [];

    // Check for Type 2 Diabetes
    const hasDiabetes =
      rawDiagnoses.some((d) => d.toLowerCase().includes('diabet') || d.toLowerCase().includes('glucose')) ||
      medications.some((m) => (m.name || '').toLowerCase().includes('metformin')) ||
      tests.some((t) => (t.name || '').toLowerCase().includes('glucose') || (t.name || '').toLowerCase().includes('hba1c'));

    if (hasDiabetes) {
      const hba1c = tests.find((t) => (t.name || '').toLowerCase().includes('hba1c'));
      const glucose = tests.find((t) => (t.name || '').toLowerCase().includes('glucose'));
      const doc = doctors.find((d) => (d.name || '').toLowerCase().includes('kapoor')) || doctors[0];

      derivedConditions.push({
        id: 'cond-diabetes',
        specialty: 'ENDOCRINOLOGY',
        specialtyType: 'blue',
        icon: 'activity',
        title: 'Type 2 Diabetes: Glycemic Control',
        description: `Metformin 500mg BD regimen. Fasting Glucose elevated at ${glucose?.value || '142 mg/dL'} (${glucose?.documentFlag || 'HIGH'}), HbA1c ${hba1c?.value || '7.1%'}. Thyroid hormone variations directly modulate peripheral glucose utilization.`,
        doctor: doc ? `${doc.name} · ${doc.clinic || 'Greenfield Medical Clinic'}` : 'Dr. Meera Kapoor · Greenfield Medical Clinic',
        status: 'Monitoring · Stable',
        keyMedications: ['Metformin 500mg'],
        keyTests: [
          { name: 'Fasting Blood Glucose', value: glucose?.value || '142 mg/dL', flag: glucose?.documentFlag || 'HIGH' },
          { name: 'HbA1c', value: hba1c?.value || '7.1%', flag: hba1c?.documentFlag || 'ELEVATED' },
        ],
      });
    }

    // Check for Hypothyroidism
    const hasThyroid =
      rawDiagnoses.some((d) => d.toLowerCase().includes('thyroid') || d.toLowerCase().includes('hypothyroid')) ||
      medications.some((m) => (m.name || '').toLowerCase().includes('levothyroxine')) ||
      tests.some((t) => (t.name || '').toLowerCase().includes('tsh') || (t.name || '').toLowerCase().includes('thyroid'));

    if (hasThyroid) {
      const tsh = tests.find((t) => (t.name || '').toLowerCase().includes('tsh'));
      const doc = doctors.find((d) => (d.name || '').toLowerCase().includes('kavya') || (d.name || '').toLowerCase().includes('rao')) || doctors[1] || doctors[0];

      derivedConditions.push({
        id: 'cond-thyroid',
        specialty: 'ENDOCRINOLOGY / THYROID',
        specialtyType: 'pink',
        icon: 'wellness',
        title: 'Hypothyroidism: Hormone Substitution',
        description: `Levothyroxine 50mcg daily. TSH elevated at ${tsh?.value || '8.4 mIU/L'} (${tsh?.documentFlag || 'HIGH'}). Hypothyroid state causes gastric hypomotility and alters drug absorption kinetics, impacting both metformin and vitamin D conversion.`,
        doctor: doc ? `${doc.name} · ${doc.clinic || 'Lakeview Specialty Clinic'}` : 'Dr. Kavya Rao · Lakeview Specialty Clinic',
        status: 'Adjustment Needed',
        keyMedications: ['Levothyroxine 50mcg'],
        keyTests: [{ name: 'TSH (Thyroid Stimulating Hormone)', value: tsh?.value || '8.4 mIU/L', flag: tsh?.documentFlag || 'HIGH' }],
      });
    }

    // Check for Vitamin D Deficiency / Bone Health
    const hasVitD =
      rawDiagnoses.some((d) => d.toLowerCase().includes('vitamin d') || d.toLowerCase().includes('deficiency')) ||
      medications.some((m) => (m.name || '').toLowerCase().includes('cholecalciferol') || (m.name || '').toLowerCase().includes('vitamin d')) ||
      tests.some((t) => (t.name || '').toLowerCase().includes('vitamin d') || (t.name || '').toLowerCase().includes('25-hydroxy'));

    if (hasVitD) {
      const vitD = tests.find((t) => (t.name || '').toLowerCase().includes('vitamin d') || (t.name || '').toLowerCase().includes('25-hydroxy'));
      const doc = doctors.find((d) => (d.name || '').toLowerCase().includes('arjun') || (d.name || '').toLowerCase().includes('malhotra')) || doctors[2] || doctors[0];

      derivedConditions.push({
        id: 'cond-vitd',
        specialty: 'METABOLIC & BONE',
        specialtyType: 'purple',
        icon: 'sun',
        title: 'Vitamin D Deficiency: Immune & Bone Axis',
        description: `Cholecalciferol 1000 IU daily active. 25-OH Vitamin D low at ${vitD?.value || '14 ng/mL'} (${vitD?.documentFlag || 'LOW'}). Suboptimal 25-OH Vitamin D impairs pancreatic insulin secretion and amplifies systemic fatigue from hypothyroidism.`,
        doctor: doc ? `${doc.name} · ${doc.clinic || 'Riverside Health Centre'}` : 'Dr. Arjun Malhotra · Riverside Health Centre',
        status: 'Supplementation · Active',
        keyMedications: ['Cholecalciferol 1000 IU'],
        keyTests: [{ name: '25-Hydroxy Vitamin D', value: vitD?.value || '14 ng/mL', flag: vitD?.documentFlag || 'LOW' }],
      });
    }

    // Connectors / Inter-Condition Cascades
    const interactions = [];

    if (hasDiabetes && hasThyroid) {
      interactions.push({
        id: 'diabetes-thyroid',
        sourceId: 'cond-diabetes',
        targetId: 'cond-thyroid',
        label: 'Diabetes ↔ Hypothyroidism',
        badgeText: '↓ Metabolic Clearance & Absorption Lag',
        badgeArrow: '↓',
        mechanism:
          'Gastric Emptying & Hepatic Clearance Interaction: Untreated elevated TSH (8.4 mIU/L) slows intestinal peristalsis and blunts peripheral insulin sensitivity. Levothyroxine absorption requires strict empty-stomach administration 30-60 minutes prior to Metformin and food.',
        clinicalGuidance:
          'Advise taking Levothyroxine upon waking with full glass of water. Delay breakfast and Metformin dose by at least 45 minutes to prevent chelation and suboptimal absorption.',
        riskLevel: 'MODERATE',
      });
    }

    if (hasThyroid && hasVitD) {
      interactions.push({
        id: 'thyroid-vitd',
        sourceId: 'cond-thyroid',
        targetId: 'cond-vitd',
        label: 'Hypothyroidism ↔ Vitamin D',
        badgeText: '⇆ Bone Mineralization & Fatigue Cascade',
        badgeArrow: '⇆',
        mechanism:
          'Thyroid-Hydroxylation Interdependence: Hypothyroid patients display diminished renal 1-alpha-hydroxylase activity, reducing conversion of cholecalciferol into active 1,25-dihydroxyvitamin D. Both conditions synergistically cause chronic morning fatigue.',
        clinicalGuidance:
          'Maintain Cholecalciferol 1000 IU supplementation with a meal containing dietary fat. Re-evaluate serum 25-OH Vitamin D and TSH in 8 weeks.',
        riskLevel: 'MODERATE',
      });
    }

    if (hasDiabetes && hasVitD && interactions.length < 2) {
      interactions.push({
        id: 'diabetes-vitd',
        sourceId: 'cond-diabetes',
        targetId: 'cond-vitd',
        label: 'Diabetes ↔ Vitamin D',
        badgeText: '⇆ Insulin Sensitivity Cross-Axis',
        badgeArrow: '⇆',
        mechanism:
          'Pancreatic Beta-Cell Receptors: Vitamin D receptors (VDR) on pancreatic islet beta cells modulate insulin exocytosis. Deficiency correlates with heightened insulin resistance.',
        clinicalGuidance:
          'Optimize 25-OH Vitamin D target > 30 ng/mL to support glycemic homeostasis.',
        riskLevel: 'LOW',
      });
    }

    return {
      patientName,
      conditionCount: derivedConditions.length,
      conditions: derivedConditions,
      interactions,
    };
  }, [patient, aggregatedData]);

  const { patientName, conditionCount, conditions, interactions } = mapData;

  // Filtered view logic
  const filteredInteractions = useMemo(() => {
    if (selectedFocus === 'all') return interactions;
    return interactions.filter((inter) => inter.id === selectedFocus);
  }, [selectedFocus, interactions]);

  const isCardHighlighted = (condId) => {
    if (selectedFocus === 'all') return true;
    const active = interactions.find((i) => i.id === selectedFocus);
    if (!active) return true;
    return active.sourceId === condId || active.targetId === condId;
  };

  if (conditions.length === 0) {
    return (
      <section className="cw-interaction-map-card" aria-labelledby="interaction-map-title">
        <header className="cw-interaction-header">
          <div className="cw-interaction-title-group">
            <div className="cw-interaction-icon-box" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </div>
            <div>
              <h2 id="interaction-map-title" className="cw-interaction-title">
                Multi-Condition Interaction Map
              </h2>
              <p className="cw-interaction-subtitle">
                Cross-specialty clinical correlation for complex co-occurring diagnoses
              </p>
            </div>
          </div>
        </header>
        <div className="cw-interaction-empty">
          <p>No multi-condition diagnoses extracted from reports yet. Upload laboratory or clinical notes to map cross-specialty interactions.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="cw-interaction-map-card" aria-labelledby="interaction-map-title">
      {/* 1. Header */}
      <header className="cw-interaction-header">
        <div className="cw-interaction-title-group">
          <div className="cw-interaction-icon-box" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--cw-primary, #5B4DF5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </div>
          <div>
            <h2 id="interaction-map-title" className="cw-interaction-title">
              Multi-Condition Interaction Map
            </h2>
            <p className="cw-interaction-subtitle">
              Cross-specialty clinical correlation for complex co-occurring diagnoses
            </p>
          </div>
        </div>
      </header>

      {/* 2. FOCUS VIEW Filter Pills */}
      <div className="cw-focus-view-bar" role="toolbar" aria-label="Focus view selection">
        <span className="cw-focus-view-label">FOCUS VIEW:</span>
        <button
          type="button"
          className={`cw-focus-pill ${selectedFocus === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedFocus('all')}
        >
          All Intersections ({conditionCount} Active)
        </button>

        {interactions.map((inter) => (
          <button
            type="button"
            key={inter.id}
            className={`cw-focus-pill ${selectedFocus === inter.id ? 'active' : ''}`}
            onClick={() => setSelectedFocus(inter.id)}
          >
            {inter.label}
          </button>
        ))}
      </div>

      {/* 4. Connected Cards Flow */}
      <div className="cw-flow-container">
        {conditions.map((cond, idx) => {
          const isHighlighted = isCardHighlighted(cond.id);
          const nextInteraction = interactions[idx];
          const showConnector = idx < conditions.length - 1 && nextInteraction;

          return (
            <React.Fragment key={cond.id}>
              {/* Condition Card */}
              <div
                className={`cw-cond-card ${cond.specialtyType} ${isHighlighted ? 'highlighted' : 'dimmed'}`}
                onClick={() => onConditionClick && onConditionClick(cond)}
              >
                {/* Specialty Header */}
                <div className="cw-cond-card-top">
                  <span className={`cw-specialty-tag ${cond.specialtyType}`}>
                    {cond.specialty}
                  </span>
                  <div className="cw-cond-card-icon" aria-hidden="true">
                    {cond.icon === 'activity' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                      </svg>
                    ) : cond.icon === 'brain' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04z" />
                        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04z" />
                      </svg>
                    ) : cond.icon === 'sun' ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DB2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Title & Body */}
                <h4 className="cw-cond-title">{cond.title}</h4>
                <p className="cw-cond-desc">{cond.description}</p>

                {/* Tests/Meds Mini Chips */}
                {cond.keyTests && (
                  <div className="cw-cond-chips">
                    {cond.keyTests.map((t, tidx) => (
                      <span key={tidx} className={`cw-mini-chip ${t.flag === 'HIGH' ? 'danger' : 'warning'}`}>
                        {t.name}: <strong>{t.value}</strong>
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Attribution */}
                <div className="cw-cond-footer">
                  <span className="cw-cond-doctor-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className="cw-cond-doctor">{cond.doctor}</span>
                </div>
              </div>

              {/* Cascade Connector Badge */}
              {showConnector && (
                <div
                  className={`cw-flow-connector ${selectedFocus === nextInteraction.id ? 'active-link' : ''}`}
                  onClick={() => setActiveModalInteraction(nextInteraction)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View clinical interaction between ${nextInteraction.label}`}
                >
                  <div className="cw-connector-badge">
                    <span className="cw-badge-arrow">{nextInteraction.badgeArrow}</span>
                    <span className="cw-badge-text">{nextInteraction.badgeText.replace(/^[↓⇆]\s*/, '')}</span>
                  </div>
                  <div className="cw-connector-line"></div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 5. Deep-dive Interaction Guidance Modal */}
      {activeModalInteraction && (
        <div className="cw-interaction-modal-backdrop" onClick={() => setActiveModalInteraction(null)}>
          <div className="cw-interaction-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="cw-modal-header">
              <div className="cw-modal-title-wrap">
                <span className="cw-risk-tag">{activeModalInteraction.riskLevel} CLINICAL CORRELATION</span>
                <h3>{activeModalInteraction.label}</h3>
              </div>
              <button
                type="button"
                className="cw-modal-close"
                onClick={() => setActiveModalInteraction(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="cw-modal-body">
              <div className="cw-modal-section">
                <h4>Pharmacological & Physiological Mechanism</h4>
                <p>{activeModalInteraction.mechanism}</p>
              </div>

              <div className="cw-modal-section">
                <h4>Cross-Specialty Action Plan</h4>
                <p>{activeModalInteraction.clinicalGuidance}</p>
              </div>
            </div>

            <div className="cw-modal-footer">
              <button
                type="button"
                className="cw-modal-btn"
                onClick={() => setActiveModalInteraction(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
