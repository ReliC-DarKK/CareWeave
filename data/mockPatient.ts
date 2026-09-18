import { Patient } from "../types/patient";

export const mockPatient: Patient = {
  id: "patient-001",
  name: "Aditi Sharma",
  dateOfBirth: "1962-04-14",

  conditions: [
    {
      id: "condition-cancer",
      name: "Breast Cancer",
      status: "active",
      diagnosedDate: "2025-06-12",
    },
    {
      id: "condition-diabetes",
      name: "Type 2 Diabetes",
      status: "monitoring",
      diagnosedDate: "2018-03-20",
    },
    {
      id: "condition-alzheimers",
      name: "Alzheimer's Disease",
      status: "active",
      diagnosedDate: "2024-01-15",
    },
  ],

  medications: [
    {
      id: "med-001",
      name: "Metformin",
      dosage: "500 mg",
      frequency: "Twice daily",
      purpose: "Blood glucose management",
      startDate: "2018-03-20",
      status: "taken",
      adherence: {
        taken: 5,
        expected: 7,
      },
    },
    {
      id: "med-002",
      name: "Donepezil",
      dosage: "10 mg",
      frequency: "Once daily",
      purpose: "Cognitive symptom management",
      startDate: "2024-02-01",
      status: "missed",
      adherence: {
        taken: 6,
        expected: 7,
      },
    },
  ],

  labs: [
    {
      id: "lab-001",
      name: "HbA1c",
      value: 8.2,
      unit: "%",
      referenceRange: "< 7.0%",
      date: "2026-09-16",
      conditionId: "condition-diabetes",
    },
    {
      id: "lab-002",
      name: "Hemoglobin",
      value: 10.8,
      unit: "g/dL",
      referenceRange: "12.0–16.0 g/dL",
      date: "2026-09-15",
      conditionId: "condition-cancer",
    },
  ],

  appointments: [
    {
      id: "appointment-001",
      title: "Oncology Follow-up",
      date: "2026-09-19",
      time: "10:00 AM",
      clinician: "Oncology Team",
      conditionId: "condition-cancer",
      preparation: [
        "Bring current medication list",
        "Bring latest glucose readings",
        "Report recent fatigue",
      ],
    },
    {
      id: "appointment-002",
      title: "Diabetes Review",
      date: "2026-09-23",
      time: "02:00 PM",
      clinician: "Diabetes Care Team",
      conditionId: "condition-diabetes",
      preparation: ["Bring glucose readings"],
    },
  ],

  symptoms: [
    {
      id: "symptom-001",
      name: "Fatigue",
      severity: "moderate",
      date: "2026-09-17",
      conditionId: "condition-cancer",
    },
    {
      id: "symptom-002",
      name: "Medication confusion",
      severity: "moderate",
      date: "2026-09-17",
      conditionId: "condition-alzheimers",
    },
  ],

  timeline: [
    {
      id: "event-001",
      type: "diagnosis",
      date: "2018-03-20",
      title: "Type 2 Diabetes diagnosed",
      conditionId: "condition-diabetes",
    },
    {
      id: "event-002",
      type: "diagnosis",
      date: "2024-01-15",
      title: "Alzheimer's Disease diagnosed",
      conditionId: "condition-alzheimers",
    },
    {
      id: "event-003",
      type: "diagnosis",
      date: "2025-06-12",
      title: "Breast Cancer diagnosed",
      conditionId: "condition-cancer",
    },
    {
      id: "event-004",
      type: "lab",
      date: "2026-09-15",
      title: "Hemoglobin result recorded",
      description: "Hemoglobin: 10.8 g/dL",
      conditionId: "condition-cancer",
    },
    {
      id: "event-005",
      type: "lab",
      date: "2026-09-16",
      title: "HbA1c result recorded",
      description: "HbA1c: 8.2%",
      conditionId: "condition-diabetes",
    },
    {
      id: "event-006",
      type: "symptom",
      date: "2026-09-17",
      title: "Fatigue reported",
      description: "Moderate fatigue",
      conditionId: "condition-cancer",
    },
    {
      id: "event-007",
      type: "symptom",
      date: "2026-09-17",
      title: "Medication confusion reported",
      description: "Moderate confusion around medication",
      conditionId: "condition-alzheimers",
    },
    {
      id: "event-008",
      type: "appointment",
      date: "2026-09-19",
      title: "Oncology Follow-up",
      description: "Upcoming oncology appointment",
      conditionId: "condition-cancer",
    },
  ],
};