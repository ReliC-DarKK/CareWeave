import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

// Mock Prisma for deterministic, offline testing
vi.mock("../src/db/prisma.js", () => {
  const mockPrisma = {
    patient: {
      findUnique: vi.fn(),
    },
    condition: {
      findMany: vi.fn(),
    },
    medication: {
      findMany: vi.fn(),
    },
    labResult: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    symptom: {
      findMany: vi.fn(),
    },
    timelineEvent: {
      findMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

describe("GET /api/v1/patients/:patientId/care-logic-view", () => {
  let app: FastifyInstance;

  const mockPatient = {
    id: "patient-001",
    userId: "user-001",
    firstName: "Jordan",
    lastName: "Rivera",
    dateOfBirth: new Date("1972-04-18"),
    createdAt: new Date("2025-01-15T08:00:00.000Z"),
    updatedAt: new Date("2025-01-15T08:00:00.000Z"),
  };

  const mockConditions = [
    {
      id: "cond-001",
      patientId: "patient-001",
      name: "Breast Cancer",
      description: "Stage II, hormone receptor positive",
      diagnosedAt: new Date("2025-03-10"),
      isActive: true,
      createdAt: new Date("2025-03-10T09:00:00.000Z"),
      updatedAt: new Date("2025-03-10T09:00:00.000Z"),
    },
    {
      id: "cond-002",
      patientId: "patient-001",
      name: "Type 2 Diabetes",
      description: "Managed with medication",
      diagnosedAt: new Date("2018-06-01"),
      isActive: true,
      createdAt: new Date("2018-06-01T09:00:00.000Z"),
      updatedAt: new Date("2018-06-01T09:00:00.000Z"),
    },
  ];

  const mockMedications = [
    {
      id: "med-001",
      patientId: "patient-001",
      name: "Metformin",
      dosage: "500mg",
      frequency: "Twice daily",
      prescribedAt: new Date("2018-06-05"),
      isActive: true,
      createdAt: new Date("2018-06-05T08:00:00.000Z"),
      updatedAt: new Date("2018-06-05T08:00:00.000Z"),
      events: [
        {
          id: "mevt-001",
          medicationId: "med-001",
          type: "PRESCRIBED",
          occurredAt: new Date("2018-06-05T08:00:00.000Z"),
        },
        {
          id: "mevt-002",
          medicationId: "med-001",
          type: "TAKEN",
          occurredAt: new Date("2025-09-15T08:00:00.000Z"),
        },
        {
          id: "mevt-003",
          medicationId: "med-001",
          type: "MISSED",
          occurredAt: new Date("2025-09-16T20:00:00.000Z"),
        },
      ],
    },
  ];

  const mockLabs = [
    {
      id: "lab-001",
      patientId: "patient-001",
      conditionId: "cond-002",
      name: "HbA1c",
      value: 8.2,
      unit: "%",
      referenceRange: "< 7.0%",
      date: new Date("2026-09-16"),
      createdAt: new Date("2026-09-16T10:00:00.000Z"),
      updatedAt: new Date("2026-09-16T10:00:00.000Z"),
    },
    {
      id: "lab-002",
      patientId: "patient-001",
      conditionId: "cond-001",
      name: "Hemoglobin",
      value: 10.8,
      unit: "g/dL",
      referenceRange: "12.0–16.0 g/dL",
      date: new Date("2026-09-15"),
      createdAt: new Date("2026-09-15T10:00:00.000Z"),
      updatedAt: new Date("2026-09-15T10:00:00.000Z"),
    },
  ];

  const mockAppointments = [
    {
      id: "appt-001",
      patientId: "patient-001",
      providerId: "prov-001",
      scheduledAt: new Date("2025-09-25T14:00:00.000Z"),
      durationMinutes: 30,
      status: "SCHEDULED",
      reason: "Chemotherapy cycle follow-up",
      location: "Infusion Center, Room 4",
      createdAt: new Date("2025-09-10T11:00:00.000Z"),
      updatedAt: new Date("2025-09-10T11:00:00.000Z"),
      provider: {
        id: "prov-001",
        firstName: "Amy",
        lastName: "Chen",
        specialty: "Oncology",
        organization: "CareWeave Demo Medical Group",
      },
    },
  ];

  const mockSymptoms = [
    {
      id: "symp-001",
      patientId: "patient-001",
      conditionId: "cond-001",
      name: "Fatigue",
      severity: "MODERATE",
      date: new Date("2026-09-17"),
      createdAt: new Date("2026-09-17T10:00:00.000Z"),
      updatedAt: new Date("2026-09-17T10:00:00.000Z"),
    },
    {
      id: "symp-002",
      patientId: "patient-001",
      conditionId: "cond-003",
      name: "Medication confusion",
      severity: "MODERATE",
      date: new Date("2026-09-17"),
      createdAt: new Date("2026-09-17T10:00:00.000Z"),
      updatedAt: new Date("2026-09-17T10:00:00.000Z"),
    },
  ];

  const mockTimeline = [
    {
      id: "evt-001",
      patientId: "patient-001",
      conditionId: "cond-001",
      type: "DIAGNOSTIC",
      eventTime: new Date("2025-03-05T09:00:00.000Z"),
      title: "Diagnostic mammogram and biopsy",
      description: "Biopsy confirmed malignancy",
      sourceType: "SEED_DATA",
      sourceRef: "demo-doc-001",
      recordedAt: new Date("2025-03-05T10:00:00.000Z"),
      createdAt: new Date("2025-03-05T10:00:00.000Z"),
      updatedAt: new Date("2025-03-05T10:00:00.000Z"),
    },
    {
      id: "evt-002",
      patientId: "patient-001",
      conditionId: null,
      type: "NOTE",
      eventTime: new Date("2025-09-10T18:00:00.000Z"),
      title: "Patient-reported fatigue",
      description: "Patient reported fatigue via portal message",
      sourceType: "PATIENT_REPORTED",
      sourceRef: null,
      recordedAt: new Date("2025-09-10T18:05:00.000Z"),
      createdAt: new Date("2025-09-10T18:05:00.000Z"),
      updatedAt: new Date("2025-09-10T18:05:00.000Z"),
    },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();

    // Default mock responses
    vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
    vi.mocked(prisma.condition.findMany).mockResolvedValue(mockConditions as any);
    vi.mocked(prisma.medication.findMany).mockResolvedValue(mockMedications as any);
    vi.mocked(prisma.labResult.findMany).mockResolvedValue(mockLabs as any);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppointments as any);
    vi.mocked(prisma.symptom.findMany).mockResolvedValue(mockSymptoms as any);
    vi.mocked(prisma.timelineEvent.findMany).mockResolvedValue(mockTimeline as any);
  });

  afterEach(async () => {
    await app.close();
  });

  // 1. Patient identity normalization
  it("normalizes patient identity correctly (name, dateOfBirth YYYY-MM-DD)", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.id).toBe("patient-001");
    expect(body.data.name).toBe("Jordan Rivera");
    expect(body.data.dateOfBirth).toBe("1972-04-18");
  });

  // 2. Conditions mapping
  it("maps conditions correctly (diagnosedDate, status: 'active')", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.conditions).toHaveLength(2);
    expect(body.data.conditions[0]).toEqual({
      id: "cond-001",
      name: "Breast Cancer",
      status: "active",
      diagnosedDate: "2025-03-10",
    });
    expect(body.data.conditions[1]).toEqual({
      id: "cond-002",
      name: "Type 2 Diabetes",
      status: "active",
      diagnosedDate: "2018-06-01",
    });
  });

  // 3. Medications mapping
  it("maps medications correctly with status derived from latest event and startDate", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.medications).toHaveLength(1);
    const med = body.data.medications[0];
    expect(med.id).toBe("med-001");
    expect(med.name).toBe("Metformin");
    expect(med.dosage).toBe("500mg");
    expect(med.frequency).toBe("Twice daily");
    expect(med.startDate).toBe("2018-06-05");
    expect(med.status).toBe("missed"); // Latest event was MISSED
    expect(med).not.toHaveProperty("purpose");
    expect(med).not.toHaveProperty("adherence");
  });

  // 4. Both synthetic lab records returned
  it("returns both synthetic lab records with accurate fields", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.labs).toHaveLength(2);
    expect(body.data.labs[0]).toEqual({
      id: "lab-001",
      name: "HbA1c",
      value: 8.2,
      unit: "%",
      referenceRange: "< 7.0%",
      date: "2026-09-16",
      conditionId: "cond-002",
    });
    expect(body.data.labs[1]).toEqual({
      id: "lab-002",
      name: "Hemoglobin",
      value: 10.8,
      unit: "g/dL",
      referenceRange: "12.0–16.0 g/dL",
      date: "2026-09-15",
      conditionId: "cond-001",
    });
  });

  // 5. Both synthetic symptom records returned
  it("returns both synthetic symptom records with lowercase severity", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.symptoms).toHaveLength(2);
    expect(body.data.symptoms[0]).toEqual({
      id: "symp-001",
      name: "Fatigue",
      severity: "moderate",
      date: "2026-09-17",
      conditionId: "cond-001",
    });
    expect(body.data.symptoms[1]).toEqual({
      id: "symp-002",
      name: "Medication confusion",
      severity: "moderate",
      date: "2026-09-17",
      conditionId: "cond-003",
    });
  });

  // 6. Appointments normalized correctly
  it("normalizes appointments into date, time, title, and clinician without fabricating preparation", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.appointments).toHaveLength(1);
    const appt = body.data.appointments[0];
    expect(appt.id).toBe("appt-001");
    expect(appt.title).toBe("Chemotherapy cycle follow-up");
    expect(appt.date).toBe("2025-09-25");
    expect(appt.time).toBe("14:00");
    expect(appt.clinician).toBe("Dr. Amy Chen");
    expect(appt).not.toHaveProperty("preparation");
    expect(appt).not.toHaveProperty("conditionId");
  });

  // 7. Timeline events normalized correctly
  it("normalizes timeline events with mapped lowercase types and provenance metadata", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data.timeline).toHaveLength(2);
    expect(body.data.timeline[0].type).toBe("diagnosis");
    expect(body.data.timeline[0].metadata).toEqual({
      sourceType: "SEED_DATA",
      sourceRef: "demo-doc-001",
      recordedAt: "2025-03-05T10:00:00.000Z",
    });
    expect(body.data.timeline[1].type).toBe("symptom");
  });

  // 8. Unknown patient returns 404
  it("returns 404 when the patient does not exist", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/unknown-patient/care-logic-view",
    });

    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toContain("unknown-patient");
  });

  // 9. No P1 careState/interactions/nextActions/summary fields returned
  it("strictly returns raw/normalized patient data and never emits P1-generated output", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic-view",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toHaveProperty("data");
    const data = body.data;

    // Confirm presence of P1 contract fields:
    expect(data).toHaveProperty("id");
    expect(data).toHaveProperty("name");
    expect(data).toHaveProperty("dateOfBirth");
    expect(data).toHaveProperty("conditions");
    expect(data).toHaveProperty("medications");
    expect(data).toHaveProperty("labs");
    expect(data).toHaveProperty("appointments");
    expect(data).toHaveProperty("symptoms");
    expect(data).toHaveProperty("timeline");

    // Strictly ensure no P1 care logic reasoning outputs are generated:
    expect(data).not.toHaveProperty("careState");
    expect(data).not.toHaveProperty("interactions");
    expect(data).not.toHaveProperty("nextActions");
    expect(data).not.toHaveProperty("summary");
    expect(data).not.toHaveProperty("actionPlan");
    expect(data).not.toHaveProperty("insights");
  });
});
