import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling patient care team data access against PostgreSQL via Prisma.
 *
 * Includes provider profile details and their role on the care team.
 */
export class CareTeamService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all care team members for a patient, including provider details.
   */
  async listForPatient(patientId: string) {
    return this.db.patientCareTeam.findMany({
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
      orderBy: { createdAt: "asc" },
    });
  }
}

export const careTeamService = new CareTeamService();
