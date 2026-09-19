import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "./patient.schema.js";
import { patientService } from "./patient.service.js";
import { careLogicViewService } from "./careLogicView.service.js";

/**
 * Patients module — read endpoints.
 *
 * GET /api/v1/patients/:patientId
 * Returns core profile information for the specified patient.
 *
 * GET /api/v1/patients/:patientId/care-logic-view
 * Returns normalized raw patient data contract consumed by P1's buildCareLogic().
 */
export async function registerPatientRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId",
    {
      preHandler: [authenticate, requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = patientParamsSchema.parse(request.params);
      const patient = await patientService.getById(patientId);

      if (!patient) {
        return reply.status(404).send({
          error: {
            message: `Patient not found: ${patientId}`,
            code: "NOT_FOUND",
          },
        });
      }

      return reply.status(200).send({ data: patient });
    },
  );

  app.get(
    "/patients/:patientId/care-logic-view",
    {
      preHandler: [authenticate, requirePatientAccess],
    },
    async (request, reply) => {
      const { patientId } = patientParamsSchema.parse(request.params);
      const careLogicView = await careLogicViewService.getCareLogicView(patientId);

      if (!careLogicView) {
        return reply.status(404).send({
          error: {
            message: `Patient not found: ${patientId}`,
            code: "NOT_FOUND",
          },
        });
      }

      return reply.status(200).send({ data: careLogicView });
    },
  );
}

