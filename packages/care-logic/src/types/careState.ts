import { ConditionStatus } from "./patient";

export interface CareState {
  patientId: string;
  referenceDate: string;

  overallStatus: "stable" | "needs-attention";

  activeConditions: {
    id: string;
    name: string;
    status: ConditionStatus;
  }[];

  recentSymptoms: {
    id: string;
    name: string;
    severity: "mild" | "moderate" | "severe";
    date: string;
    conditionId?: string;
  }[];

  recentLabs: {
    id: string;
    name: string;
    value: number;
    unit: string;
    referenceRange?: string;
    date: string;
    conditionId?: string;
  }[];

  medicationAdherence: {
    medicationId: string;
    medication: string;
    taken: number;
    expected: number;
    adherenceRate: number;
    status: string;
  }[];

  upcomingAppointments: {
    id: string;
    title: string;
    date: string;
    time: string;
    conditionId?: string;
  }[];

  attentionSignals: string[];
}