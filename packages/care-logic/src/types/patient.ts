export type ConditionStatus = "active" | "controlled" | "monitoring";

export interface Condition {
  id: string;
  name: string;
  status: ConditionStatus;
  diagnosedDate: string;
}

export type MedicationStatus =
  | "prescribed"
  | "taken"
  | "missed"
  | "stopped";

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
  startDate: string;
  status: MedicationStatus;
  adherence?: {
    taken: number;
    expected: number;
  };
}

export interface LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange?: string;
  date: string;
  conditionId?: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  clinician?: string;
  conditionId?: string;
  preparation?: string[];
}

export interface Symptom {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  date: string;
  conditionId?: string;
}

export type TimelineEventType =
  | "diagnosis"
  | "lab"
  | "medication"
  | "appointment"
  | "symptom"
  | "treatment";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  description?: string;
  conditionId?: string;
  metadata?: Record<string, unknown>;
}

export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;

  conditions: Condition[];
  medications: Medication[];
  labs: LabResult[];
  appointments: Appointment[];
  symptoms: Symptom[];
  timeline: TimelineEvent[];
}