import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling condition data access against PostgreSQL via Prisma.
 */
export class ConditionService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all conditions associated with a patient.
   */
  async listForPatient(patientId: string) {
    return this.db.condition.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });
  }
}

export const conditionService = new ConditionService();
