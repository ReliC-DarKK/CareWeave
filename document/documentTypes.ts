export type DocumentType =
  | "lab-report"
  | "prescription"
  | "discharge-summary"
  | "clinical-note"
  | "unknown";

export interface DocumentSource {
  documentId: string;
  fileName: string;
  documentType: DocumentType;
  sourcePage?: number;
}

export interface ExtractedCondition {
  name: string;
  status?: "active" | "controlled" | "monitoring";
  diagnosedDate?: string;
  source: DocumentSource;
}

export interface ExtractedMedication {
  name: string;
  dosage: string;
  frequency: string;
  purpose?: string;
  startDate?: string;
  status?: "prescribed" | "taken" | "missed" | "stopped";
  source: DocumentSource;
}

export interface ExtractedLab {
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
  date: string;
  conditionId?: string;
  source: DocumentSource;
}

export interface ExtractedSymptom {
  name: string;
  severity: "mild" | "moderate" | "severe";
  date: string;
  conditionId?: string;
  source: DocumentSource;
}

export interface ExtractedAppointment {
  title: string;
  date: string;
  time: string;
  clinician?: string;
  conditionId?: string;
  preparation?: string[];
  source: DocumentSource;
}

export interface ExtractedTimelineEvent {
  type:
    | "diagnosis"
    | "lab"
    | "medication"
    | "appointment"
    | "symptom"
    | "treatment";
  date: string;
  title: string;
  description?: string;
  conditionId?: string;
  source: DocumentSource;
}

export interface ExtractedClinicalData {
  conditions: ExtractedCondition[];
  medications: ExtractedMedication[];
  labs: ExtractedLab[];
  symptoms: ExtractedSymptom[];
  appointments: ExtractedAppointment[];
  timelineEvents: ExtractedTimelineEvent[];
}