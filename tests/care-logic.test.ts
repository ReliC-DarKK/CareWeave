import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import * as careLogicModule from "@careweave/care-logic";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

// Mock Prisma for deterministic testing
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

describe("GET /api/v1/patients/:patientId/care-logic", () => {
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
      description: "Stage IIA",
      diagnosedAt: new Date("2025-03-10"),
      isActive: true,
      createdAt: new Date("2025-03-10T09:00:00.000Z"),
      updatedAt: new Date("2025-03-10T09:00:00.000Z"),
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
          id: "me-001",
          medicationId: "med-001",
          type: "TAKEN" as const,
          occurredAt: new Date("2025-03-10T08:00:00.000Z"),
          note: null,
          createdAt: new Date("2025-03-10T08:00:00.000Z"),
        },
      ],
    },
  ];

  const mockLabs = [
    {
      id: "lab-001",
      patientId: "patient-001",
      name: "HbA1c",
      value: 6.8,
      unit: "%",
      referenceRange: "< 7.0%",
      date: new Date("2025-03-01"),
      conditionId: null,
      createdAt: new Date("2025-03-01T08:00:00.000Z"),
      updatedAt: new Date("2025-03-01T08:00:00.000Z"),
    },
  ];

  const mockAppointments = [
    {
      id: "apt-001",
      patientId: "patient-001",
      provider: "Dr. Sarah Chen (Oncologist)",
      scheduledAt: new Date("2025-04-15T14:30:00.000Z"),
      status: "SCHEDULED" as const,
      reason: "Oncology Consultation",
      conditionId: "cond-001",
      createdAt: new Date("2025-03-10T10:00:00.000Z"),
      updatedAt: new Date("2025-03-10T10:00:00.000Z"),
    },
  ];

  const mockSymptoms = [
    {
      id: "sym-001",
      patientId: "patient-001",
      name: "Fatigue",
      severity: "MODERATE" as const,
      date: new Date("2025-03-09"),
      conditionId: "cond-001",
      createdAt: new Date("2025-03-09T08:00:00.000Z"),
      updatedAt: new Date("2025-03-09T08:00:00.000Z"),
    },
  ];

  const mockTimelineEvents = [
    {
      id: "tl-001",
      patientId: "patient-001",
      conditionId: "cond-001",
      type: "DIAGNOSTIC" as const,
      eventTime: new Date("2025-03-05T10:00:00.000Z"),
      title: "Biopsy confirmed malignancy",
      description: "Stage IIA",
      sourceType: "CLINICAL_NOTE",
      sourceRef: "doc-001",
      recordedAt: new Date("2025-03-05T10:00:00.000Z"),
      createdAt: new Date("2025-03-05T10:00:00.000Z"),
      updatedAt: new Date("2025-03-05T10:00:00.000Z"),
    },
  ];

  function setupPatientMocks() {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue(mockPatient as any);
    vi.mocked(prisma.condition.findMany).mockResolvedValue(mockConditions as any);
    vi.mocked(prisma.medication.findMany).mockResolvedValue(mockMedications as any);
    vi.mocked(prisma.labResult.findMany).mockResolvedValue(mockLabs as any);
    vi.mocked(prisma.appointment.findMany).mockResolvedValue(mockAppointments as any);
    vi.mocked(prisma.symptom.findMany).mockResolvedValue(mockSymptoms as any);
    vi.mocked(prisma.timelineEvent.findMany).mockResolvedValue(mockTimelineEvents as any);
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("successfully returns P1's complete care-logic output", async () => {
    setupPatientMocks();

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic",
    });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    expect(json.data).toBeDefined();

    // Verify all core P1 care-logic sections are present
    expect(json.data).toHaveProperty("timeline");
    expect(json.data).toHaveProperty("careState");
    expect(json.data).toHaveProperty("interactions");
    expect(json.data).toHaveProperty("nextActions");
    expect(json.data).toHaveProperty("summary");

    // Verify careState contents
    expect(json.data.careState.patientId).toBe("patient-001");
    expect(json.data.careState.overallStatus).toBeDefined();

    // Verify summary
    expect(json.data.summary).toHaveProperty("headline");
    expect(json.data.summary).toHaveProperty("summary");
    expect(json.data.summary).toHaveProperty("priorities");
    expect(json.data.summary).toHaveProperty("upcomingCare");
  });

  it("passes the normalized Patient and query referenceDate directly to P1 buildCareLogic()", async () => {
    setupPatientMocks();
    const spy = vi.spyOn(careLogicModule, "buildCareLogic");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic?referenceDate=2025-04-01",
    });

    expect(response.statusCode).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);

    const [passedPatient, passedReferenceDate] = spy.mock.calls[0]!;
    expect(passedReferenceDate).toBe("2025-04-01");
    expect(passedPatient.id).toBe("patient-001");
    expect(passedPatient.name).toBe("Jordan Rivera");
    expect(passedPatient.dateOfBirth).toBe("1972-04-18");
    expect(passedPatient.conditions).toHaveLength(1);
    expect(passedPatient.medications).toHaveLength(1);
    expect(passedPatient.labs).toHaveLength(1);
    expect(passedPatient.appointments).toHaveLength(1);
    expect(passedPatient.symptoms).toHaveLength(1);

    spy.mockRestore();
  });

  it("defaults referenceDate to current date (YYYY-MM-DD) when query parameter is omitted", async () => {
    setupPatientMocks();
    const spy = vi.spyOn(careLogicModule, "buildCareLogic");

    const today = new Date().toISOString().split("T")[0]!;

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic",
    });

    expect(response.statusCode).toBe(200);
    expect(spy).toHaveBeenCalledTimes(1);

    const [, passedReferenceDate] = spy.mock.calls[0]!;
    expect(passedReferenceDate).toBe(today);

    spy.mockRestore();
  });

  it("returns 404 when patient is not found and does not call buildCareLogic()", async () => {
    vi.mocked(prisma.patient.findUnique).mockResolvedValue(null);
    const spy = vi.spyOn(careLogicModule, "buildCareLogic");

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/nonexistent-patient/care-logic",
    });

    expect(response.statusCode).toBe(404);
    const json = response.json();
    expect(json.error.code).toBe("NOT_FOUND");
    expect(json.error.message).toContain("Patient not found: nonexistent-patient");
    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  it("ensures P2 does not compute care logic independently (returns exact P1 output)", async () => {
    setupPatientMocks();

    const customP1Output = {
      timeline: [{ id: "custom-event", type: "treatment" as const, date: "2025-04-01", title: "Custom" }],
      careState: {
        patientId: "patient-001",
        referenceDate: "2025-04-01",
        overallStatus: "stable" as const,
        activeConditions: [],
        recentSymptoms: [],
        recentLabs: [],
        medicationAdherence: [],
        upcomingAppointments: [],
        attentionSignals: [],
      },
      interactions: [],
      nextActions: [],
      summary: {
        headline: "P1 Custom Headline",
        summary: "P1 Custom Summary",
        priorities: ["High Priority Action"],
        upcomingCare: [],
      },
    };

    const spy = vi.spyOn(careLogicModule, "buildCareLogic").mockReturnValue(customP1Output as any);

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/patients/patient-001/care-logic",
    });

    expect(response.statusCode).toBe(200);
    const json = response.json();
    // Confirms P2 returns the exact P1 object without modification
    expect(json.data).toEqual(customP1Output);

    spy.mockRestore();
  });
});
