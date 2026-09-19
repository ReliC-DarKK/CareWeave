import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling patient lab result data access against PostgreSQL via Prisma.
 */
export class LabResultService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all lab results for a patient, ordered chronologically by date descending.
   */
  async listForPatient(patientId: string) {
    return this.db.labResult.findMany({
      where: { patientId },
      orderBy: { date: "desc" },
    });
  }
}

export const labResultService = new LabResultService();
