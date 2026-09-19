import type { PrismaClient } from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Service handling appointment data access against PostgreSQL via Prisma.
 *
 * Includes provider information and sorts appointments in chronological order.
 */
export class AppointmentService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Retrieves all appointments for a patient ordered chronologically by scheduledAt,
   * including provider profile details (without exposing credentials).
   */
  async listForPatient(patientId: string) {
    return this.db.appointment.findMany({
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
    });
  }
}

export const appointmentService = new AppointmentService();
