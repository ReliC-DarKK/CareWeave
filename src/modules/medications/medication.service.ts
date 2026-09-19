import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling medication data access against PostgreSQL via Prisma.
 *
 * Preserves medication orders and their associated lifecycle events
 * (PRESCRIBED, DISPENSED, TAKEN, MISSED, STOPPED).
 */
export class MedicationService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all medications for a patient, including their lifecycle events ordered chronologically.
   */
  async listForPatient(patientId: string) {
    return this.db.medication.findMany({
      where: { patientId },
      include: {
        events: {
          orderBy: { occurredAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const medicationService = new MedicationService();
