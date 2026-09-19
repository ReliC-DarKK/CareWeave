import type {
  MedicationEventType,
  PrismaClient,
  TimelineEventType,
} from "@prisma/client";
import { prisma } from "../../db/prisma.js";

export interface P1Condition {
  id: string;
  name: string;
  status: "active" | "controlled" | "monitoring";
  diagnosedDate: string;
}

export interface P1Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  status: "prescribed" | "taken" | "missed" | "stopped";
  purpose?: string | undefined;
  adherence?: { taken: number; expected: number } | undefined;
}

export interface P1LabResult {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange?: string | undefined;
  date: string;
  conditionId?: string | undefined;
}

export interface P1Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  clinician?: string | undefined;
  conditionId?: string | undefined;
  preparation?: string[] | undefined;
}

export interface P1Symptom {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  date: string;
  conditionId?: string | undefined;
}

export interface P1TimelineEvent {
  id: string;
  type: "diagnosis" | "lab" | "medication" | "appointment" | "symptom" | "treatment";
  date: string;
  title: string;
  description?: string | undefined;
  conditionId?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
}

export interface P1Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  conditions: P1Condition[];
  medications: P1Medication[];
  labs: P1LabResult[];
  appointments: P1Appointment[];
  symptoms: P1Symptom[];
  timeline: P1TimelineEvent[];
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "";
  const [ymd] = date.toISOString().split("T");
  return ymd ?? "";
}

function resolveMedicationStatus(
  events?: { type: MedicationEventType; occurredAt: Date }[],
): "prescribed" | "taken" | "missed" | "stopped" {
  if (!events || events.length === 0) {
    return "prescribed";
  }
  const sorted = [...events].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  const first = sorted[0];
  if (!first) {
    return "prescribed";
  }
  switch (first.type) {
    case "TAKEN":
      return "taken";
    case "MISSED":
      return "missed";
    case "STOPPED":
      return "stopped";
    case "PRESCRIBED":
    case "DISPENSED":
    default:
      return "prescribed";
  }
}

function mapTimelineEventType(
  type: TimelineEventType,
): "diagnosis" | "lab" | "medication" | "appointment" | "symptom" | "treatment" {
  switch (type) {
    case "DIAGNOSTIC":
    case "CLINICAL_ENCOUNTER":
      return "diagnosis";
    case "LAB":
      return "lab";
    case "MEDICATION":
      return "medication";
    case "APPOINTMENT":
      return "appointment";
    case "OBSERVATION":
      return "treatment";
    case "NOTE":
      return "symptom";
    default:
      return "treatment";
  }
}

function formatClinician(provider?: {
  firstName: string;
  lastName: string;
} | null): string | undefined {
  if (!provider) return undefined;
  return `Dr. ${provider.firstName} ${provider.lastName}`.trim();
}

/**
 * Service aggregating and normalizing raw patient data for P1's buildCareLogic().
 *
 * Strictly limited to data normalization: returns raw/normalized patient records
 * and does NOT execute care logic, calculate careState, interactions, or summaries.
 */
export class CareLogicViewService {
  constructor(private readonly db: PrismaClient = prisma) {}

  async getCareLogicView(patientId: string): Promise<P1Patient | null> {
    const patient = await this.db.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return null;
    }

    const [conditions, medications, labs, appointments, symptoms, timelineEvents] =
      await Promise.all([
        this.db.condition.findMany({
          where: { patientId },
          orderBy: { createdAt: "asc" },
        }),
        this.db.medication.findMany({
          where: { patientId },
          include: {
            events: {
              orderBy: { occurredAt: "asc" },
            },
          },
          orderBy: { createdAt: "asc" },
        }),
        this.db.labResult.findMany({
          where: { patientId },
          orderBy: { date: "desc" },
        }),
        this.db.appointment.findMany({
          where: { patientId },
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
        }),
        this.db.symptom.findMany({
          where: { patientId },
          orderBy: { date: "desc" },
        }),
        this.db.timelineEvent.findMany({
          where: { patientId },
          orderBy: { eventTime: "asc" },
        }),
      ]);

    const normalizedConditions: P1Condition[] = conditions.map((c) => ({
      id: c.id,
      name: c.name,
      status: "active",
      diagnosedDate: formatDate(c.diagnosedAt),
    }));

    const normalizedMedications: P1Medication[] = medications.map((m) => {
      const item: P1Medication = {
        id: m.id,
        name: m.name,
        dosage: m.dosage ?? "",
        frequency: m.frequency ?? "",
        startDate: formatDate(m.prescribedAt),
        status: resolveMedicationStatus(m.events),
      };
      return item;
    });

    const normalizedLabs: P1LabResult[] = labs.map((l) => ({
      id: l.id,
      name: l.name,
      value: l.value,
      unit: l.unit,
      referenceRange: l.referenceRange ?? undefined,
      date: formatDate(l.date),
      conditionId: l.conditionId ?? undefined,
    }));

    const normalizedAppointments: P1Appointment[] = appointments.map((a) => {
      const iso = a.scheduledAt.toISOString();
      const parts = iso.split("T");
      const timePart = parts[1];
      const time = timePart ? timePart.substring(0, 5) : "";
      return {
        id: a.id,
        title: a.reason ?? "Appointment",
        date: formatDate(a.scheduledAt),
        time,
        clinician: formatClinician(a.provider),
      };
    });

    const normalizedSymptoms: P1Symptom[] = symptoms.map((s) => ({
      id: s.id,
      name: s.name,
      severity: s.severity.toLowerCase() as "mild" | "moderate" | "severe",
      date: formatDate(s.date),
      conditionId: s.conditionId ?? undefined,
    }));

    const normalizedTimeline: P1TimelineEvent[] = timelineEvents.map((t) => ({
      id: t.id,
      type: mapTimelineEventType(t.type),
      date: t.eventTime.toISOString(),
      title: t.title,
      description: t.description ?? undefined,
      conditionId: t.conditionId ?? undefined,
      metadata: {
        sourceType: t.sourceType,
        ...(t.sourceRef ? { sourceRef: t.sourceRef } : {}),
        recordedAt: t.recordedAt.toISOString(),
      },
    }));

    return {
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`.trim(),
      dateOfBirth: formatDate(patient.dateOfBirth),
      conditions: normalizedConditions,
      medications: normalizedMedications,
      labs: normalizedLabs,
      appointments: normalizedAppointments,
      symptoms: normalizedSymptoms,
      timeline: normalizedTimeline,
    };
  }
}

export const careLogicViewService = new CareLogicViewService();
