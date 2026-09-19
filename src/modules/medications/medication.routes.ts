import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "../patients/patient.schema.js";
import { patientService } from "../patients/patient.service.js";
import { medicationService } from "./medication.service.js";

/**
 * Medications module — read endpoints.
 *
 * GET /api/v1/patients/:patientId/medications
 * Returns Medication records and nested lifecycle events (PRESCRIBED, DISPENSED, TAKEN, MISSED, STOPPED).
 */
export async function registerMedicationRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/medications",
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

      const medications = await medicationService.listForPatient(patientId);
      return reply.status(200).send({ data: medications });
    },
  );
}

