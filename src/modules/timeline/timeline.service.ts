import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling clinical timeline event data access against PostgreSQL via Prisma.
 *
 * Preserves event provenance (sourceType, sourceRef, recordedAt) and condition linkage.
 */
export class TimelineService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all TimelineEvent records for a patient ordered chronologically by eventTime.
   */
  async listForPatient(patientId: string) {
    return this.db.timelineEvent.findMany({
      where: { patientId },
      orderBy: { eventTime: "asc" },
    });
  }
}

export const timelineService = new TimelineService();
