import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "../patients/patient.schema.js";
import { patientService } from "../patients/patient.service.js";
import { appointmentService } from "./appointment.service.js";

/**
 * Appointments module — read endpoints.
 *
 * GET /api/v1/patients/:patientId/appointments
 * Returns appointments ordered chronologically by scheduledAt with provider details.
 */
export async function registerAppointmentRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/appointments",
    {
      preHandler: [authenticate, requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = patientParamsSchema.parse(request.params);

      const patientExists = await patientService.exists(patientId);
      if (!patientExists) {
        return reply.status(404).send({
          error: {
            message: `Patient not found: ${patientId}`,
            code: "NOT_FOUND",
          },
        });
      }

      const appointments = await appointmentService.listForPatient(patientId);
      return reply.status(200).send({ data: appointments });
    },
  );
}

