/**
 * CareWeave — Static Demo Data Fixtures
 * 
 * ============================================================================
 * NOTICE: FICTIONAL DEMO DATA ONLY
 * ----------------------------------------------------------------------------
 * All patient profiles, clinical findings, dates, metrics, care team details,
 * and upcoming actions in this file are simulated and entirely fictional.
 * They are authored strictly for prototype interface evaluation and layout
 * demonstration in a controlled hackathon setting.
 * 
 * These records DO NOT represent real patients and contain NO real protected
 * health information (PHI). Sensitive identifiers (e.g., Date of Birth, SSN,
 * insurance identifiers) are intentionally omitted.
 * 
 * NOTE ON COMPUTATION & DECISION LOGIC:
 * All care-state indicators, priorities, and "Next Best Action" items below are
 * static presentation fixtures. They are NOT calculated, inferred, ranked, or
 * recommended by medical decision algorithms. Production engines and AI logic
 * will be provided by other team modules in later phases.
 * ============================================================================
 */

export const DEMO_PATIENT = {
  id: "CW-DEMO-0419",
  firstName: "Aditi",
  lastName: "Sharma",
  preferredName: "Aditi",
  recordNumber: "MRN-782-9014",
  primaryClinic: "Metro Comprehensive Health Center",
  careCoordinator: "Nurse Anita (Care Coordinator)",
  lastReviewDate: "September 18, 2026",
};

export const DEMO_CONDITIONS = [
  {
    id: "cond-onc-01",
    name: "Invasive Ductal Carcinoma (Breast Cancer)",
    shortName: "Breast Cancer",
    category: "Oncology",
    stage: "Stage IIA (ER+/PR+, HER2-)",
    status: "Active Treatment — Cycle 3 Completed",
    clinicalSummary: "Receiving adjuvant AC-T protocol. Cycle 4 planned for Sep 22. Tolerating with mild fatigue.",
    leadProvider: "Dr. Meera Kapoor",
    department: "Medical Oncology",
    nextMilestone: "Pre-chemo labs & Cycle 4 infusion — Sep 22, 2026",
    monitoredMarkers: [
      { label: "ANC", value: "1.8 K/uL", status: "Within Protocol Range" },
      { label: "Platelets", value: "198 K/uL", status: "Adequate" },
    ],
  },
  {
    id: "cond-endo-02",
    name: "Type 2 Diabetes Mellitus",
    shortName: "Type 2 Diabetes",
    category: "Endocrinology",
    stage: "Established (6 years duration)",
    status: "Active Management",
    clinicalSummary: "Current therapy: Metformin 1000mg BID. Blood glucose trending slightly elevated during steroid pre-medication days.",
    leadProvider: "Dr. Rao",
    department: "Endocrinology & Metabolism",
    nextMilestone: "HbA1c quarterly recheck & regimen review — Oct 5, 2026",
    monitoredMarkers: [
      { label: "Latest HbA1c", value: "7.2%", status: "Moderate Control" },
      { label: "Fasting BG (Avg)", value: "128 mg/dL", status: "Monitored" },
    ],
  },
  {
    id: "cond-cardio-03",
    name: "Essential Hypertension",
    shortName: "Hypertension",
    category: "Cardiovascular",
    stage: "Stage 1 Controlled",
    status: "Clinically Stable",
    clinicalSummary: "Monotherapy with Amlodipine 5mg daily. Regular home log review indicates stability with no hypotensive episodes.",
    leadProvider: "Dr. Singh",
    department: "Cardiology / Internal Medicine",
    nextMilestone: "Blood pressure telemetry review — Sep 30, 2026",
    monitoredMarkers: [
      { label: "Resting BP", value: "126/82 mmHg", status: "At Target" },
      { label: "Heart Rate", value: "74 bpm", status: "Regular" },
    ],
  },
];

/**
 * Static presentation fixture for the Overall Care State card.
 * (No calculation, algorithmic scoring, or gamification).
 */
export const DEMO_CARE_STATE = {
  status: "Stable",
  statusLabel: "Multi-Condition Coordination Active",
  supportingText: "3 primary conditions co-managed across care",
  statusDescription: "3 primary conditions co-managed across Oncology, Endocrinology, and Internal Medicine.",
  synchronizationStatus: "Synchronized across 3 specialties",
  lastUpdated: "Today, 08:30 AM",
  activeConditionsCount: 3,
  activePrescriptionsCount: 6,
  upcomingEventsCount: 2,
  attentionItemsCount: 2,
  careAlignmentNote: "Oncology infusion schedule coordinated with diabetic steroid management protocol.",
};

/**
 * Static presentation fixtures for the "What Matters Now / Next Best Action" section.
 * (Placeholder items — actual generation/prioritization will be supplied by Person 1).
 */
export const DEMO_NEXT_ACTIONS = [
  {
    id: "na-001",
    tier: "Priority Clinical Action",
    urgencyLevel: "high", // presentation styling cue only
    title: "Complete Pre-Chemotherapy CBC and Metabolic Panel",
    description: "Required 48 hours prior to Cycle 4 infusion. Laboratory requisition has been transmitted to Central Lab.",
    relatedCondition: "Breast Cancer",
    targetDate: "Tomorrow · 9:00 AM",
    assignedCareLead: "Dr. Meera Kapoor (Medical Oncology)",
    actionType: "Laboratory Diagnostic",
  },
  {
    id: "na-002",
    tier: "Coordinated Care Review",
    urgencyLevel: "medium",
    title: "Confirm Post-Infusion Fasting Glucose Protocol",
    description: "Dexamethasone pre-medication may induce transient glycemic spikes. Review recommended titration parameters.",
    relatedCondition: "Type 2 Diabetes × Oncology Co-management",
    targetDate: "Prior to Sunday, Sep 21",
    assignedCareLead: "Dr. Rao (Endocrinology)",
    actionType: "Care Coordination",
  },
  {
    id: "na-003",
    tier: "Preventative & Adherence Routine",
    urgencyLevel: "standard",
    title: "Prescription Renewal: Amlodipine 5mg (30-day)",
    description: "Current refill threshold reaches 5 remaining doses on Sep 23. Direct e-refill request pending clinic acknowledgment.",
    relatedCondition: "Hypertension",
    targetDate: "Due by Wednesday, Sep 24",
    assignedCareLead: "Dr. Singh (Cardiology)",
    actionType: "Medication Refill",
  },
];

/**
 * Longitudinal chronological timeline events across conditions.
 * Includes category mapping for frontend filters: All, Conditions, Tests, Medications, Appointments.
 */
export const DEMO_TIMELINE_EVENTS = [
  {
    id: "tle-101",
    dateGroup: "TODAY",
    date: "Sep 18, 2026",
    time: "07:45 AM",
    title: "Blood Glucose Reading",
    detail: "Avg. 142 mg/dL (Morning fasting: 128 mg/dL)",
    filterType: "Tests",
    category: "Vitals & Biometrics",
    relatedCondition: "Type 2 Diabetes",
    summary: "Avg. 142 mg/dL. Morning capillary reading logged via home glucometer.",
    recordedBy: "Patient Self-Report · Glucometer Sync",
    clinicalContext: "Baseline morning reading ahead of scheduled infusion.",
  },
  {
    id: "tle-102",
    dateGroup: "TODAY",
    date: "Sep 18, 2026",
    time: "08:00 AM",
    title: "Medication",
    detail: "Metformin 500 mg · Morning dose",
    filterType: "Medications",
    category: "Medication Adherence",
    relatedCondition: "Type 2 Diabetes",
    summary: "Metformin 500 mg and Amlodipine 5 mg PO taken with breakfast.",
    recordedBy: "Adherence Log",
    clinicalContext: "100% adherence verified for preceding 14-day interval.",
  },
  {
    id: "tle-103",
    dateGroup: "TOMORROW",
    date: "Sep 19, 2026",
    time: "09:00 AM",
    title: "Blood Test",
    detail: "CBC · Liver Function · HbA1c",
    filterType: "Tests",
    category: "Diagnostic Lab",
    relatedCondition: "Breast Cancer",
    summary: "CBC, Comprehensive Metabolic Panel, and Liver Function scheduled at Central Lab.",
    recordedBy: "Metro Central Laboratories",
    clinicalContext: "Pre-chemo interval safety surveillance 48h prior to infusion.",
  },
  {
    id: "tle-104",
    dateGroup: "SEP 22",
    date: "Sep 22, 2026",
    time: "10:30 AM",
    title: "Oncology Appointment",
    detail: "Dr. Meera Kapoor · Medical Oncology",
    filterType: "Appointments",
    category: "Clinical Encounter",
    relatedCondition: "Breast Cancer",
    summary: "Cycle 4 Infusion and mid-treatment clinical evaluation at Cancer Pavilion Suite 4B.",
    recordedBy: "Dr. Meera Kapoor, MD",
    clinicalContext: "In-person visit. Pre-medication protocol begins 2 hours prior.",
  },
  {
    id: "tle-105",
    dateGroup: "OCT 05",
    date: "Oct 05, 2026",
    time: "02:00 PM",
    title: "Diabetes Follow-up",
    detail: "Dr. Rao · Endocrinology",
    filterType: "Appointments",
    category: "Clinical Encounter",
    relatedCondition: "Type 2 Diabetes",
    summary: "Quarterly glycemic log reconciliation and post-chemotherapy steroid impact review.",
    recordedBy: "Dr. Rao, MD",
    clinicalContext: "Telehealth clinical encounter.",
  },
  {
    id: "tle-106",
    dateGroup: "SEP 16",
    date: "Sep 16, 2026",
    time: "11:15 AM",
    title: "Oncology Response Evaluation",
    detail: "ECOG Performance Status: 0 · Tolerance verified",
    filterType: "Conditions",
    category: "Condition Review",
    relatedCondition: "Breast Cancer",
    summary: "Clinical evaluation demonstrated stable performance status. Cleared for Cycle 4 pending 48h labs.",
    recordedBy: "Dr. Meera Kapoor, MD",
    clinicalContext: "Interim oncology milestone review.",
  },
  {
    id: "tle-107",
    dateGroup: "SEP 15",
    date: "Sep 15, 2026",
    time: "03:00 PM",
    title: "Hypertension Telemetry Review",
    detail: "Resting BP 126/82 mmHg · Heart Rate 74 bpm",
    filterType: "Conditions",
    category: "Condition Review",
    relatedCondition: "Hypertension",
    summary: "30-day blood pressure telemonitoring confirmed clinical stability at target < 130/85.",
    recordedBy: "Dr. Singh, MD",
    clinicalContext: "Cardiovascular stability verified.",
  },
];

/**
 * Recent health updates feed.
 */
export const DEMO_RECENT_UPDATES = [
  {
    id: "upd-01",
    timestamp: "Today at 08:15 AM",
    type: "Diagnostic",
    title: "Laboratory Diagnostic Requisition Transmitted",
    detail: "Pre-infusion comprehensive panel requisition submitted to Metro Health Lab.",
  },
  {
    id: "upd-02",
    timestamp: "Yesterday at 04:30 PM",
    type: "Clinical Note",
    title: "Care Coordination Summary Shared",
    detail: "Dr. Kapoor and Dr. Rao aligned on dexamethasone dosing timeline.",
  },
  {
    id: "upd-03",
    timestamp: "Sep 16, 2026",
    type: "Pharmacy",
    title: "Prescription Refill Queued",
    detail: "Amlodipine 5mg authorization submitted to Metro Pharmacy dispensary.",
  },
  {
    id: "upd-04",
    timestamp: "Sep 15, 2026",
    type: "Telemetry",
    title: "Weekly Blood Pressure Average Calculated",
    detail: "Mean resting BP for past 7 days: 127/83 mmHg. Criteria for cardiovascular stability met.",
  },
];

/**
 * Care gaps / clinical maintenance items.
 */
export const DEMO_CARE_GAPS = [
  {
    id: "gap-01",
    title: "Annual Diabetic Retinal Screening",
    category: "Preventative Screening",
    relatedCondition: "Type 2 Diabetes",
    statusNote: "Due within 45 days (Last completed: Oct 2025)",
    recommendation: "Schedule dilated fundoscopic examination with Ophthalmology.",
  },
  {
    id: "gap-02",
    title: "Diagnostic Mammogram Interval Review",
    category: "Surveillance Imaging",
    relatedCondition: "Breast Cancer",
    statusNote: "Scheduled post-chemotherapy milestone",
    recommendation: "Imaging protocol will be finalized upon completion of primary systemic therapy.",
  },
];

/**
 * Multidisciplinary Care Team.
 */
export const DEMO_CARE_TEAM = [
  {
    id: "ct-01",
    name: "Dr. Meera Kapoor",
    role: "Lead Medical Oncologist",
    specialty: "Medical Oncology",
    careRelationship: "Primary Oncology Treatment Lead",
    department: "Comprehensive Cancer Center",
    hospital: "Metro Health System",
    contactEmail: "m.kapoor@metrohealth.demo",
    availability: "Clinic: Mon, Wed, Fri",
  },
  {
    id: "ct-02",
    name: "Dr. Rao",
    role: "Consultant Endocrinologist",
    specialty: "Endocrinology",
    careRelationship: "Metabolic & Diabetes Co-Management",
    department: "Division of Metabolism",
    hospital: "Metro Health System",
    contactEmail: "d.rao@metrohealth.demo",
    availability: "Clinic: Tue, Thu",
  },
  {
    id: "ct-03",
    name: "Dr. Singh",
    role: "Attending Cardiologist / Internist",
    specialty: "Cardiology",
    careRelationship: "Cardiovascular Health & BP Control",
    department: "Cardiology Associates",
    hospital: "Metro Health System",
    contactEmail: "s.singh@metrohealth.demo",
    availability: "Clinic: Mon - Thu",
  },
  {
    id: "ct-04",
    name: "Nurse Anita",
    role: "Care Coordinator",
    specialty: "Care Navigation",
    careRelationship: "Longitudinal Care Coordination Lead",
    department: "Longitudinal Care Coordination Unit",
    hospital: "Metro Health System",
    contactEmail: "anita.rn@metrohealth.demo",
    availability: "Dedicated Navigation: Mon - Fri",
  },
];

/**
 * Quick Links / Clinical shortcuts.
 */
export const DEMO_QUICK_LINKS = [
  {
    id: "ql-01",
    title: "Care Journey Timeline",
    description: "View full chronological record across all 3 conditions",
    path: "/journey",
  },
  {
    id: "ql-02",
    title: "Consolidated Health Records",
    description: "Access lab panels, clinical summaries, and imaging reports",
    path: "/records",
  },
  {
    id: "ql-03",
    title: "Unified Medication Schedule",
    description: "Review dosing regimens, cross-condition interactions, and refills",
    path: "/medications",
  },
  {
    id: "ql-04",
    title: "Upcoming Appointments",
    description: "Schedule consultations and view multidisciplinary visits",
    path: "/appointments",
  },
  {
    id: "ql-05",
    title: "Direct Care Team Messages",
    description: "Communicate securely with your nurse navigator and specialists",
    path: "/messages",
  },
];

/**
 * P4 Feature: Multi-Condition Interaction (Static Presentation Fixture)
 * Displayed in the dedicated Care Journey tab.
 */
export const DEMO_MULTI_CONDITION_INTERACTIONS = [
  {
    id: "mci-01",
    primaryCondition: "Breast Cancer (Oncology)",
    secondaryCondition: "Type 2 Diabetes (Endocrine)",
    interactionType: "Steroid-Induced Hyperglycemia Precaution",
    summary: "Dexamethasone pre-medication for AC-T chemotherapy transiently elevates hepatic gluconeogenesis and morning capillary glucose.",
    clinicalGuideline: "Increase fasting glucose monitoring frequency to BID on days +1 and +2 post-infusion. Metformin continues unchanged.",
    leadClinicians: "Dr. Meera Kapoor & Dr. Rao",
    status: "Active Surveillance Protocol",
  },
  {
    id: "mci-02",
    primaryCondition: "Hypertension (Cardiovascular)",
    secondaryCondition: "Breast Cancer (Oncology)",
    interactionType: "Cardiovascular Telemetry & Infusion Tolerance",
    summary: "Routine fluid loading during adjuvant infusions requires BP monitoring to avoid fluid overload exacerbation with Amlodipine.",
    clinicalGuideline: "Pre-infusion resting BP must remain <140/90 mmHg. Telemetry logs synchronized.",
    leadClinicians: "Dr. Singh & Dr. Meera Kapoor",
    status: "Verified Stable",
  },
];

/**
 * P4 Feature: Smart Handoff (Static Presentation Fixture)
 * Displayed in the dedicated Care Team tab.
 */
export const DEMO_SMART_HANDOFF = {
  handoffId: "SH-2026-0916",
  transferFrom: "Dr. Meera Kapoor (Oncology)",
  transferTo: "Dr. Rao (Endocrinology)",
  patientContext: "Aditi Sharma (MRN-782-9014)",
  dateTransmitted: "Sep 16, 2026 · 04:30 PM",
  currentTreatment: "Adjuvant AC-T Chemotherapy Protocol (Cycle 3 completed, Cycle 4 pending pre-labs)",
  recentMeasurements: "Fasting glucose: 128 mg/dL · Resting BP: 126/82 mmHg · ANC: 1.8 K/uL",
  currentMedications: "Metformin 1000mg BID, Amlodipine 5mg Daily, Dexamethasone 8mg protocol",
  upcomingAppointments: "Cycle 4 Infusion on Sep 22 · Endocrine Follow-up on Oct 05",
  acknowledgmentStatus: "Acknowledged by Endocrinology",
  handoffNotes: "Cycle 3 completed without dose-limiting toxicity. Pre-chemo labs for Cycle 4 queued for Sep 19. Noted slight morning fasting glucose rise (128 mg/dL) attributable to premed steroids. Requesting joint concurrence on maintaining Metformin 1000mg BID.",
  responseNote: "Concur. Recommend patient self-report fasting readings morning and evening around Sep 22–24. Telehealth follow-up scheduled for Oct 5.",
  coordinatorSigned: "Nurse Anita (Care Coordinator)",
};

/**
 * Appointments: Upcoming, Past, and Preparation Checklist (Static Presentation Fixture)
 */
export const DEMO_APPOINTMENTS_DATA = {
  upcoming: [
    {
      id: "apt-01",
      title: "Oncology Pre-Chemo Labs & Cycle 4 Infusion",
      specialty: "Oncology",
      department: "Comprehensive Cancer Center — Suite 4B",
      provider: "Dr. Meera Kapoor",
      date: "Sep 22, 2026",
      time: "10:30 AM",
      status: "Confirmed",
      preparation: [
        "Bring current medication list",
        "Bring recent glucose readings",
        "Complete required lab work (CBC and Metabolic Panel drawn 48h prior)",
        "Arranged companion driver required for post-infusion discharge",
      ],
    },
    {
      id: "apt-02",
      title: "Diabetes Follow-up & Regimen Review",
      specialty: "Endocrinology",
      department: "Metabolic Clinic — Suite 2A",
      provider: "Dr. Rao",
      date: "Oct 5, 2026",
      time: "2:00 PM",
      status: "Scheduled",
      preparation: [
        "Bring current medication list",
        "Bring 14-day capillary glucose readings log",
        "10-hour overnight fasting required for on-site venous HbA1c test",
      ],
    },
  ],
  past: [
    {
      id: "apt-03",
      title: "Oncology Mid-Cycle Response Review",
      specialty: "Oncology",
      department: "Comprehensive Cancer Center",
      provider: "Dr. Meera Kapoor",
      date: "Sep 14, 2026",
      time: "02:30 PM",
      status: "Completed",
      summary: "ECOG 0. Peripheral neuropathy screening negative. Tolerated Cycle 3 adequately.",
    },
    {
      id: "apt-04",
      title: "Cardiovascular Telemetry & BP Follow-up",
      specialty: "Cardiology",
      department: "Cardiology Associates",
      provider: "Dr. Singh",
      date: "Aug 15, 2026",
      time: "11:00 AM",
      status: "Completed",
      summary: "Resting BP stable on Amlodipine 5mg. EKG within normal limits.",
    },
  ],
};

/**
 * Detailed Medications Schedule (Static Presentation Fixture)
 */
export const DEMO_MEDICATIONS = [
  {
    id: "med-01",
    name: "Metformin",
    dosage: "1000 mg",
    frequency: "BID (Twice Daily)",
    timing: "With breakfast and dinner (08:00 AM, 08:00 PM)",
    condition: "Type 2 Diabetes",
    prescriber: "Dr. Rao",
    refillsRemaining: 3,
    nextRefill: "Oct 28, 2026",
    status: "Active Regimen",
  },
  {
    id: "med-02",
    name: "Amlodipine",
    dosage: "5 mg",
    frequency: "Daily",
    timing: "Morning with water (08:00 AM)",
    condition: "Hypertension",
    prescriber: "Dr. Singh",
    refillsRemaining: 1,
    nextRefill: "Sep 24, 2026 (Refill Pending)",
    status: "Refill Queued",
  },
  {
    id: "med-03",
    name: "Dexamethasone",
    dosage: "8 mg",
    frequency: "Pre-Chemotherapy Protocol",
    timing: "Day before infusion and morning of infusion",
    condition: "Breast Cancer (AC-T Pre-medication)",
    prescriber: "Dr. Meera Kapoor",
    refillsRemaining: 2,
    nextRefill: "Cycle 4 Protocol",
    status: "Active Protocol",
  },
  {
    id: "med-04",
    name: "Ondansetron",
    dosage: "8 mg",
    frequency: "As Needed (PRN)",
    timing: "Every 8 hours as needed for nausea",
    condition: "Breast Cancer (Supportive Anti-Emetic)",
    prescriber: "Dr. Meera Kapoor",
    refillsRemaining: 2,
    nextRefill: "As Needed",
    status: "PRN (As Needed)",
  },
];

/**
 * Health Records & Lab Reports (Static Presentation Fixture)
 */
export const DEMO_HEALTH_RECORDS_DATA = {
  recentLabReports: [
    {
      id: "lab-01",
      title: "Complete Blood Count (CBC)",
      date: "Sep 16, 2026",
      type: "Hematology Lab",
      orderingDoctor: "Dr. Meera Kapoor",
      laboratory: "Metro Central Laboratories",
      description: "Pre-chemo safety surveillance panel assessing white count, absolute neutrophil count, and platelets.",
      findingsSummary: "WBC 4.2 K/uL, ANC 1.8 K/uL (Adequate), Platelets 198 K/uL, Hemoglobin 11.4 g/dL.",
      findings: [
        { marker: "White Blood Cells (WBC)", value: "4.2 K/uL", reference: "4.0 - 11.0 K/uL", flag: "Normal" },
        { marker: "Absolute Neutrophil Count (ANC)", value: "1.8 K/uL", reference: "1.5 - 8.0 K/uL", flag: "Adequate" },
        { marker: "Platelets", value: "198 K/uL", reference: "150 - 450 K/uL", flag: "Normal" },
        { marker: "Hemoglobin", value: "11.4 g/dL", reference: "12.0 - 15.5 g/dL", flag: "Expected Mild Low" },
      ],
      status: "Finalized & Verified",
    },
    {
      id: "lab-02",
      title: "Glycated Hemoglobin (HbA1c)",
      date: "Aug 28, 2026",
      type: "Endocrine Lab",
      orderingDoctor: "Dr. Rao",
      laboratory: "Endocrine Diagnostic Suite",
      description: "Quarterly glycated hemoglobin assessment for longitudinal diabetes control.",
      findingsSummary: "HbA1c: 7.2% (Target < 7.0%). Stable moderate glycemic control.",
      findings: [
        { marker: "Hemoglobin A1c", value: "7.2%", reference: "< 7.0% Target", flag: "Stable Control" },
        { marker: "Estimated Avg Glucose (eAG)", value: "160 mg/dL", reference: "120 - 150 mg/dL", flag: "Monitored" },
      ],
      status: "Finalized & Verified",
    },
    {
      id: "lab-03",
      title: "Liver Function Panel (LFT)",
      date: "Sep 16, 2026",
      type: "Hepatic Panel",
      orderingDoctor: "Dr. Meera Kapoor",
      laboratory: "Metro Central Laboratories",
      description: "Hepatic transaminases and bilirubin surveillance between chemotherapy cycles.",
      findingsSummary: "ALT 22 U/L, AST 24 U/L, Total Bilirubin 0.6 mg/dL. All within normal limits.",
      findings: [
        { marker: "Alanine Aminotransferase (ALT)", value: "22 U/L", reference: "7 - 35 U/L", flag: "Normal" },
        { marker: "Aspartate Aminotransferase (AST)", value: "24 U/L", reference: "10 - 40 U/L", flag: "Normal" },
        { marker: "Total Bilirubin", value: "0.6 mg/dL", reference: "0.2 - 1.2 mg/dL", flag: "Normal" },
      ],
      status: "Finalized & Verified",
    },
    {
      id: "lab-04",
      title: "Comprehensive Metabolic Panel (CMP)",
      date: "Sep 16, 2026",
      type: "Chemistry Lab",
      orderingDoctor: "Dr. Meera Kapoor",
      laboratory: "Metro Central Laboratories",
      description: "Electrolytes, renal parameters, and fasting blood glucose evaluation.",
      findingsSummary: "Fasting Glucose 128 mg/dL, Creatinine 0.82 mg/dL, eGFR > 60 mL/min.",
      findings: [
        { marker: "Fasting Glucose", value: "128 mg/dL", reference: "70 - 99 mg/dL", flag: "Monitored" },
        { marker: "Serum Creatinine", value: "0.82 mg/dL", reference: "0.50 - 1.10 mg/dL", flag: "Normal" },
        { marker: "eGFR", value: "> 60 mL/min", reference: "> 60 mL/min", flag: "Normal" },
      ],
      status: "Finalized & Verified",
    },
  ],
  healthDocuments: [
    {
      id: "doc-01",
      title: "Oncology Treatment Summary",
      date: "Sep 14, 2026",
      type: "Clinical Clinical Document",
      author: "Dr. Meera Kapoor",
      description: "Summary of adjuvant AC-T protocol progress, Cycle 3 tolerance assessment, and staging verification.",
      content: "Patient is undergoing adjuvant systemic therapy for Stage IIA ER+/PR+ HER2- invasive ductal carcinoma. Completed 3 cycles of AC-T with good ECOG 0 performance status. Mild fatigue noted. Normal cardiac telemetry and CBC clearance for Cycle 4 scheduled Sep 22.",
    },
    {
      id: "doc-02",
      title: "Diabetes Care Summary",
      date: "Aug 28, 2026",
      type: "Endocrine Care Plan",
      author: "Dr. Rao",
      description: "Longitudinal diabetes management review, Metformin titration notes, and steroid precautions.",
      content: "Established Type 2 Diabetes for 6 years. Current HbA1c 7.2%. Patient is adherent to Metformin 1000mg BID. Noted mild transient fasting glucose spikes during steroid premedication days. Coordinated with oncology team to maintain current dose with home glucose log monitoring.",
    },
    {
      id: "doc-03",
      title: "Blood Pressure Monitoring Report",
      date: "Sep 15, 2026",
      type: "Cardiovascular Telemetry",
      author: "Dr. Singh",
      description: "30-day continuous resting blood pressure telemetry and Amlodipine efficacy review.",
      content: "30-day mean resting BP is 127/83 mmHg. No orthostatic symptoms or hypotensive dips recorded. Current dose of Amlodipine 5mg daily achieves clinical target (< 130/85). Authorized continuation and 30-day refill.",
    },
  ],
};

/**
 * Fictional Messages & Conversation Threads (Static Presentation Fixture)
 */
export const DEMO_CONVERSATIONS = [
  {
    id: "conv-01",
    senderName: "Dr. Meera Kapoor",
    senderRole: "Medical Oncology",
    unread: false,
    lastMessage: "Your lab results have been reviewed. CBC and liver markers look good for Cycle 4 on Friday.",
    timestamp: "Today · 08:30 AM",
    messages: [
      {
        id: "m-101",
        sender: "Dr. Meera Kapoor",
        time: "Sep 16 · 04:30 PM",
        text: "Aditi, I sent the pre-chemo lab orders to Central Lab. Please have your blood drawn on Friday morning before 2:00 PM.",
        isIncoming: true,
      },
      {
        id: "m-102",
        sender: "Aditi Sharma",
        time: "Sep 17 · 09:15 AM",
        text: "Thank you Dr. Kapoor, I have scheduled the blood draw for 9:00 AM on Friday. I will also take the premedication as discussed.",
        isIncoming: false,
      },
      {
        id: "m-103",
        sender: "Dr. Meera Kapoor",
        time: "Today · 08:30 AM",
        text: "Your lab results have been reviewed. CBC and liver markers look good for Cycle 4 on Friday.",
        isIncoming: true,
      },
    ],
  },
  {
    id: "conv-02",
    senderName: "Nurse Anita",
    senderRole: "Care Coordinator",
    unread: true,
    lastMessage: "Reminder: your appointment is scheduled for Sep 22 at 10:30 AM. Transportation companion is confirmed.",
    timestamp: "Yesterday · 03:15 PM",
    messages: [
      {
        id: "m-201",
        sender: "Nurse Anita",
        time: "Sep 15 · 11:00 AM",
        text: "Hello Aditi, I am checking in to see if you need any help scheduling your lab test or organizing your companion driver for Sep 22.",
        isIncoming: true,
      },
      {
        id: "m-202",
        sender: "Aditi Sharma",
        time: "Sep 15 · 01:20 PM",
        text: "Hi Anita, my daughter is driving me on Tuesday. Could you confirm what time I should arrive for the pre-infusion check?",
        isIncoming: false,
      },
      {
        id: "m-203",
        sender: "Nurse Anita",
        time: "Yesterday · 03:15 PM",
        text: "Reminder: your appointment is scheduled for Sep 22 at 10:30 AM. Transportation companion is confirmed.",
        isIncoming: true,
      },
    ],
  },
  {
    id: "conv-03",
    senderName: "Dr. Rao",
    senderRole: "Endocrinology",
    unread: false,
    lastMessage: "Please review your glucose readings log. A reading of 128 mg/dL this morning is right in line with expectations.",
    timestamp: "Sep 17 · 10:00 AM",
    messages: [
      {
        id: "m-301",
        sender: "Dr. Rao",
        time: "Sep 16 · 05:00 PM",
        text: "Aditi, Dr. Kapoor shared your treatment plan. Remember that Dexamethasone will temporarily raise glucose readings. Keep your Metformin at 1000mg BID.",
        isIncoming: true,
      },
      {
        id: "m-302",
        sender: "Aditi Sharma",
        time: "Sep 17 · 08:30 AM",
        text: "Understood, Dr. Rao. My reading was 128 mg/dL this morning. I will continue logging morning and evening.",
        isIncoming: false,
      },
      {
        id: "m-303",
        sender: "Dr. Rao",
        time: "Sep 17 · 10:00 AM",
        text: "Please review your glucose readings log. A reading of 128 mg/dL this morning is right in line with expectations.",
        isIncoming: true,
      },
    ],
  },
];
