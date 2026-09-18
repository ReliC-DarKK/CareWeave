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
  careCoordinator: "Priya Singh, RN (Care Navigator)",
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
    leadProvider: "Dr. Arjun Patel",
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
    leadProvider: "Dr. Sanjay Nair",
    department: "Internal Medicine / Cardiology",
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
  statusLabel: "Multi-Condition Coordination Active",
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
    targetDate: "Friday, Sep 19 (by 2:00 PM)",
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
    assignedCareLead: "Dr. Arjun Patel (Endocrinology)",
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
    assignedCareLead: "Dr. Sanjay Nair (Internal Medicine)",
    actionType: "Medication Refill",
  },
];

/**
 * Longitudinal chronological timeline events across conditions.
 */
export const DEMO_TIMELINE_EVENTS = [
  {
    id: "tle-101",
    date: "Sep 18, 2026",
    time: "07:45 AM",
    title: "Fasting Blood Glucose Recorded",
    category: "Vitals & Biometrics",
    relatedCondition: "Type 2 Diabetes",
    summary: "Fasting capillary blood glucose reading: 128 mg/dL. Logged via patient home glucometer.",
    recordedBy: "Patient Self-Report",
    clinicalContext: "Baseline morning reading ahead of weekend infusion.",
  },
  {
    id: "tle-102",
    date: "Sep 17, 2026",
    time: "09:00 AM",
    title: "Morning Medication Dosing Acknowledged",
    category: "Medication Adherence",
    relatedCondition: "Cardiovascular / Endocrine",
    summary: "Metformin 1000mg PO and Amlodipine 5mg PO taken with breakfast.",
    recordedBy: "Adherence Log",
    clinicalContext: "100% adherence logged for preceding 14-day interval.",
  },
  {
    id: "tle-103",
    date: "Sep 16, 2026",
    time: "11:15 AM",
    title: "Complete Blood Count & Liver Panel",
    category: "Diagnostic Lab",
    relatedCondition: "Breast Cancer",
    summary: "WBC 4.2 K/uL, Platelets 198 K/uL, Hemoglobin 11.4 g/dL. Hepatic transaminases within normal reference limits.",
    recordedBy: "Metro Central Laboratories",
    clinicalContext: "Routine interval safety surveillance between cycles.",
  },
  {
    id: "tle-104",
    date: "Sep 14, 2026",
    time: "02:30 PM",
    title: "Oncology Mid-Cycle Follow-Up Consultation",
    category: "Clinical Encounter",
    relatedCondition: "Breast Cancer",
    summary: "Clinical exam demonstrated good performance status (ECOG 0). Peripheral neuropathy screening negative. Cleared for Cycle 4 pending routine 48h labs.",
    recordedBy: "Dr. Meera Kapoor, MD",
    clinicalContext: "In-person visit — Metro Cancer Pavilion Suite 4B.",
  },
  {
    id: "tle-105",
    date: "Sep 10, 2026",
    time: "10:00 AM",
    title: "Endocrine Medication Adjustment Consultation",
    category: "Clinical Encounter",
    relatedCondition: "Type 2 Diabetes",
    summary: "Reviewed 30-day glycemic logs. Maintained Metformin at 1000mg BID. Recommended continuous logging during chemotherapy steroid administration.",
    recordedBy: "Dr. Arjun Patel, MD",
    clinicalContext: "Telehealth clinical encounter.",
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
    detail: "Dr. Kapoor and Dr. Patel aligned on dexamethasone dosing timeline.",
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
    name: "Dr. Meera Kapoor, MD",
    role: "Lead Medical Oncologist",
    department: "Comprehensive Cancer Center",
    hospital: "Metro Health System",
    contactEmail: "m.kapoor@metrohealth.demo",
    availability: "Clinic Hours: Mon, Wed, Fri",
  },
  {
    id: "ct-02",
    name: "Dr. Arjun Patel, MD",
    role: "Consultant Endocrinologist",
    department: "Division of Metabolism",
    hospital: "Metro Health System",
    contactEmail: "a.patel@metrohealth.demo",
    availability: "Clinic Hours: Tue, Thu",
  },
  {
    id: "ct-03",
    name: "Dr. Sanjay Nair, MD",
    role: "Attending Internist / Primary Care",
    department: "Internal Medicine Associates",
    hospital: "Metro Health System",
    contactEmail: "s.nair@metrohealth.demo",
    availability: "Clinic Hours: Mon - Thu",
  },
  {
    id: "ct-04",
    name: "Priya Singh, RN, BSN",
    role: "Nurse Navigator & Care Coordinator",
    department: "Longitudinal Care Coordination Unit",
    hospital: "Metro Health System",
    contactEmail: "p.singh@metrohealth.demo",
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
