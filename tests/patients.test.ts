import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { prisma } from "../src/db/prisma.js";

// Mock Prisma so that route/unit tests do not require a running PostgreSQL instance:
vi.mock("../src/db/prisma.js", () => {
  const mockPrisma = {
    patient: {
      findUnique: vi.fn(),
    },
    condition: {
      findMany: vi.fn(),
    },
    timelineEvent: {
      findMany: vi.fn(),
    },
    medication: {
      findMany: vi.fn(),
    },
    appointment: {
      findMany: vi.fn(),
    },
    patientCareTeam: {
      findMany: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

describe("Patient Read APIs", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  // -------------------------------------------------------------------------
  // 1. Patient retrieval
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId", () => {
    it("returns 200 with patient core profile when patient exists", async () => {
      const mockPatient = {
        id: "patient-001",
        userId: "user-001",
        firstName: "Jordan",
        lastName: "Rivera",
        dateOfBirth: new Date("1972-04-18"),
        createdAt: new Date("2025-01-15T08:00:00.000Z"),
        updatedAt: new Date("2025-01-15T08:00:00.000Z"),
      };

      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(mockPatient as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(json.data.id).toBe("patient-001");
      expect(json.data.firstName).toBe("Jordan");
      expect(json.data.lastName).toBe("Rivera");
      expect(json.data.userId).toBe("user-001");
      expect(prisma.patient.findUnique).toHaveBeenCalledWith({
        where: { id: "patient-001" },
      });
    });

    it("returns 404 with structured error envelope when patient does not exist", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/nonexistent-patient-id",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json).toHaveProperty("error");
      expect(json.error.code).toBe("NOT_FOUND");
      expect(json.error.message).toContain("nonexistent-patient-id");
    });

    it("returns 400 when patientId fails validation (whitespace/empty)", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/%20",
      });

      expect(response.statusCode).toBe(400);
      const json = response.json();
      expect(json.error.code).toBe("VALIDATION_ERROR");
      expect(json.error.details).toHaveProperty("patientId");
    });
  });

  // -------------------------------------------------------------------------
  // 2. Conditions retrieval
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId/conditions", () => {
    it("returns 200 with all patient conditions when patient exists", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce({ id: "patient-001" } as any);

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
          name: "Hypertension",
          description: "Managed with medication",
          diagnosedAt: new Date("2019-11-20"),
          isActive: true,
          createdAt: new Date("2019-11-20T10:00:00.000Z"),
          updatedAt: new Date("2019-11-20T10:00:00.000Z"),
        },
      ];

      vi.mocked(prisma.condition.findMany).mockResolvedValueOnce(mockConditions as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/conditions",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(2);
      expect(json.data[0].name).toBe("Breast Cancer");
      expect(json.data[0].isActive).toBe(true);
      expect(json.data[1].name).toBe("Hypertension");
      expect(prisma.condition.findMany).toHaveBeenCalledWith({
        where: { patientId: "patient-001" },
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns 404 when querying conditions for a non-existent patient", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/unknown-patient/conditions",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  // -------------------------------------------------------------------------
  // 3. Timeline retrieval
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId/timeline", () => {
    it("returns 200 with chronological ordering by eventTime and preserves conditionId and provenance fields", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce({ id: "patient-001" } as any);

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
          conditionId: "cond-001",
          type: "CLINICAL_ENCOUNTER",
          eventTime: new Date("2025-03-10T14:30:00.000Z"),
          title: "Oncology consultation",
          description: "Stage II diagnosis discussed",
          sourceType: "EHR_IMPORT",
          sourceRef: "ehr-encounter-992",
          recordedAt: new Date("2025-03-10T15:00:00.000Z"),
          createdAt: new Date("2025-03-10T15:00:00.000Z"),
          updatedAt: new Date("2025-03-10T15:00:00.000Z"),
        },
        {
          id: "evt-003",
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

      vi.mocked(prisma.timelineEvent.findMany).mockResolvedValueOnce(mockTimeline as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/timeline",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(json.data).toHaveLength(3);

      expect(prisma.timelineEvent.findMany).toHaveBeenCalledWith({
        where: { patientId: "patient-001" },
        orderBy: { eventTime: "asc" },
      });

      const t1 = new Date(json.data[0].eventTime).getTime();
      const t2 = new Date(json.data[1].eventTime).getTime();
      const t3 = new Date(json.data[2].eventTime).getTime();
      expect(t1).toBeLessThan(t2);
      expect(t2).toBeLessThan(t3);

      expect(json.data[0].conditionId).toBe("cond-001");
      expect(json.data[0].sourceType).toBe("SEED_DATA");
      expect(json.data[0].sourceRef).toBe("demo-doc-001");
      expect(json.data[0].recordedAt).toBeDefined();

      expect(json.data[1].sourceType).toBe("EHR_IMPORT");
      expect(json.data[1].sourceRef).toBe("ehr-encounter-992");

      expect(json.data[2].conditionId).toBeNull();
      expect(json.data[2].sourceType).toBe("PATIENT_REPORTED");
      expect(json.data[2].sourceRef).toBeNull();
    });

    it("returns 404 when querying timeline for a non-existent patient", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/unknown-patient/timeline",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  // -------------------------------------------------------------------------
  // 4. Medications retrieval & lifecycle events
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId/medications", () => {
    it("returns 200 with medications and nested lifecycle events", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce({ id: "patient-001" } as any);

      const mockMedications = [
        {
          id: "med-001",
          patientId: "patient-001",
          name: "Metformin",
          dosage: "500mg",
          frequency: "Twice daily",
          prescribedAt: new Date("2018-06-05T00:00:00.000Z"),
          isActive: true,
          createdAt: new Date("2018-06-05T08:00:00.000Z"),
          updatedAt: new Date("2018-06-05T08:00:00.000Z"),
          events: [
            {
              id: "mevt-001",
              medicationId: "med-001",
              type: "PRESCRIBED",
              occurredAt: new Date("2018-06-05T08:00:00.000Z"),
              note: "Initiated for glycemic control",
              sourceType: "SEED_DATA",
              sourceRef: null,
              recordedAt: new Date("2018-06-05T08:00:00.000Z"),
              createdAt: new Date("2018-06-05T08:00:00.000Z"),
            },
            {
              id: "mevt-002",
              medicationId: "med-001",
              type: "DISPENSED",
              occurredAt: new Date("2018-06-06T10:00:00.000Z"),
              note: "Filled 30-day supply",
              sourceType: "PHARMACY",
              sourceRef: "rx-9912",
              recordedAt: new Date("2018-06-06T10:00:00.000Z"),
              createdAt: new Date("2018-06-06T10:00:00.000Z"),
            },
            {
              id: "mevt-003",
              medicationId: "med-001",
              type: "TAKEN",
              occurredAt: new Date("2025-09-15T08:00:00.000Z"),
              note: null,
              sourceType: "PATIENT_REPORTED",
              sourceRef: null,
              recordedAt: new Date("2025-09-15T08:05:00.000Z"),
              createdAt: new Date("2025-09-15T08:05:00.000Z"),
            },
            {
              id: "mevt-004",
              medicationId: "med-001",
              type: "MISSED",
              occurredAt: new Date("2025-09-16T20:00:00.000Z"),
              note: "Patient forgot evening dose",
              sourceType: "PATIENT_REPORTED",
              sourceRef: null,
              recordedAt: new Date("2025-09-17T07:00:00.000Z"),
              createdAt: new Date("2025-09-17T07:00:00.000Z"),
            },
            {
              id: "mevt-005",
              medicationId: "med-001",
              type: "STOPPED",
              occurredAt: new Date("2025-09-18T10:00:00.000Z"),
              note: "Discontinued by provider",
              sourceType: "PROVIDER_ENTRY",
              sourceRef: "encounter-441",
              recordedAt: new Date("2025-09-18T10:00:00.000Z"),
              createdAt: new Date("2025-09-18T10:00:00.000Z"),
            },
          ],
        },
      ];

      vi.mocked(prisma.medication.findMany).mockResolvedValueOnce(mockMedications as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/medications",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(1);

      const med = json.data[0];
      expect(med.name).toBe("Metformin");
      expect(med.dosage).toBe("500mg");
      expect(med.frequency).toBe("Twice daily");
      expect(med.isActive).toBe(true);
      expect(med.events).toHaveLength(5);

      const eventTypes = med.events.map((e: any) => e.type);
      expect(eventTypes).toEqual(["PRESCRIBED", "DISPENSED", "TAKEN", "MISSED", "STOPPED"]);
      expect(med.events[0].sourceType).toBe("SEED_DATA");
      expect(med.events[1].sourceRef).toBe("rx-9912");

      expect(prisma.medication.findMany).toHaveBeenCalledWith({
        where: { patientId: "patient-001" },
        include: {
          events: {
            orderBy: { occurredAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    });

    it("returns 404 when querying medications for a non-existent patient", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/unknown-patient/medications",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  // -------------------------------------------------------------------------
  // 5. Appointments retrieval & provider info & chronological ordering
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId/appointments", () => {
    it("returns 200 with chronological appointments and provider details without credentials", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce({ id: "patient-001" } as any);

      const mockAppointments = [
        {
          id: "appt-001",
          patientId: "patient-001",
          providerId: "prov-001",
          scheduledAt: new Date("2025-08-01T09:00:00.000Z"),
          durationMinutes: 20,
          status: "COMPLETED",
          reason: "Routine labs review",
          location: "Primary Care Clinic",
          createdAt: new Date("2025-07-20T10:00:00.000Z"),
          updatedAt: new Date("2025-08-01T09:30:00.000Z"),
          provider: {
            id: "prov-001",
            firstName: "Kwame",
            lastName: "Osei",
            specialty: "Primary Care",
            organization: "CareWeave Demo Medical Group",
          },
        },
        {
          id: "appt-002",
          patientId: "patient-001",
          providerId: "prov-002",
          scheduledAt: new Date("2025-09-25T14:00:00.000Z"),
          durationMinutes: 30,
          status: "SCHEDULED",
          reason: "Chemotherapy cycle follow-up",
          location: "Infusion Center, Room 4",
          createdAt: new Date("2025-09-10T11:00:00.000Z"),
          updatedAt: new Date("2025-09-10T11:00:00.000Z"),
          provider: {
            id: "prov-002",
            firstName: "Amy",
            lastName: "Chen",
            specialty: "Oncology",
            organization: "CareWeave Demo Medical Group",
          },
        },
      ];

      vi.mocked(prisma.appointment.findMany).mockResolvedValueOnce(mockAppointments as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/appointments",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(2);

      // Verify Prisma query was asked to order chronologically:
      expect(prisma.appointment.findMany).toHaveBeenCalledWith({
        where: { patientId: "patient-001" },
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
              organization: true,
            },
          },
        },
        orderBy: { scheduledAt: "asc" },
      });

      // Verify chronological ordering in returned data:
      const t1 = new Date(json.data[0].scheduledAt).getTime();
      const t2 = new Date(json.data[1].scheduledAt).getTime();
      expect(t1).toBeLessThan(t2);

      // Verify provider info is present:
      expect(json.data[0].provider).toBeDefined();
      expect(json.data[0].provider.firstName).toBe("Kwame");
      expect(json.data[0].provider.lastName).toBe("Osei");
      expect(json.data[0].provider.specialty).toBe("Primary Care");

      // Verify NO passwordHash or auth credentials exposed:
      expect(json.data[0].provider).not.toHaveProperty("passwordHash");
      expect(json.data[1].provider).not.toHaveProperty("passwordHash");
    });

    it("returns 404 when querying appointments for a non-existent patient", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/unknown-patient/appointments",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });

  // -------------------------------------------------------------------------
  // 6. Care-team retrieval & provider info and relationship/role
  // -------------------------------------------------------------------------
  describe("GET /api/v1/patients/:patientId/care-team", () => {
    it("returns 200 with care team members, role, and provider details without credentials", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce({ id: "patient-001" } as any);

      const mockCareTeam = [
        {
          id: "pct-001",
          patientId: "patient-001",
          providerId: "prov-002",
          role: "Oncologist",
          createdAt: new Date("2025-03-10T09:00:00.000Z"),
          provider: {
            id: "prov-002",
            firstName: "Amy",
            lastName: "Chen",
            specialty: "Oncology",
            organization: "CareWeave Demo Medical Group",
          },
        },
        {
          id: "pct-002",
          patientId: "patient-001",
          providerId: "prov-001",
          role: "Primary Care Physician",
          createdAt: new Date("2025-03-10T09:00:00.000Z"),
          provider: {
            id: "prov-001",
            firstName: "Kwame",
            lastName: "Osei",
            specialty: "Primary Care",
            organization: "CareWeave Demo Medical Group",
          },
        },
      ];

      vi.mocked(prisma.patientCareTeam.findMany).mockResolvedValueOnce(mockCareTeam as any);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/patient-001/care-team",
      });

      expect(response.statusCode).toBe(200);
      const json = response.json();
      expect(json).toHaveProperty("data");
      expect(Array.isArray(json.data)).toBe(true);
      expect(json.data).toHaveLength(2);

      expect(prisma.patientCareTeam.findMany).toHaveBeenCalledWith({
        where: { patientId: "patient-001" },
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
              organization: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      });

      expect(json.data[0].role).toBe("Oncologist");
      expect(json.data[0].provider.firstName).toBe("Amy");
      expect(json.data[0].provider.lastName).toBe("Chen");
      expect(json.data[0].provider.specialty).toBe("Oncology");
      expect(json.data[0].provider).not.toHaveProperty("passwordHash");

      expect(json.data[1].role).toBe("Primary Care Physician");
      expect(json.data[1].provider.firstName).toBe("Kwame");
      expect(json.data[1].provider.lastName).toBe("Osei");
      expect(json.data[1].provider.specialty).toBe("Primary Care");
      expect(json.data[1].provider).not.toHaveProperty("passwordHash");
    });

    it("returns 404 when querying care team for a non-existent patient", async () => {
      vi.mocked(prisma.patient.findUnique).mockResolvedValueOnce(null);

      const response = await app.inject({
        method: "GET",
        url: "/api/v1/patients/unknown-patient/care-team",
      });

      expect(response.statusCode).toBe(404);
      const json = response.json();
      expect(json.error.code).toBe("NOT_FOUND");
    });
  });
});
