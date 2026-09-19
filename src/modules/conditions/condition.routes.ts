import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "../patients/patient.schema.js";
import { patientService } from "../patients/patient.service.js";
import { conditionService } from "./condition.service.js";

/**
 * Conditions module — read endpoints.
 *
 * GET /api/v1/patients/:patientId/conditions
 * Returns conditions associated with the specified patient.
 */
export async function registerConditionRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/conditions",
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

      const conditions = await conditionService.listForPatient(patientId);
      return reply.status(200).send({ data: conditions });
    },
  );
}

