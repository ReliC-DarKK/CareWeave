import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling patient data access against PostgreSQL via Prisma.
 */
export class PatientService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves the core profile information for a patient by ID.
   */
  async getById(id: string) {
    return this.db.patient.findUnique({
      where: { id },
    });
  }

  /**
   * Checks whether a patient exists in the database.
   */
  async exists(id: string): Promise<boolean> {
    const patient = await this.db.patient.findUnique({
      where: { id },
      select: { id: true },
    });
    return patient !== null;
  }
}

export const patientService = new PatientService();
