import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling patient symptom data access against PostgreSQL via Prisma.
 */
export class SymptomService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all symptoms for a patient, ordered chronologically by date descending.
   */
  async listForPatient(patientId: string) {
    return this.db.symptom.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
    });
  }
}

export const symptomService = new SymptomService();
