import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "../patients/patient.schema.js";
import { patientService } from "../patients/patient.service.js";
import { careTeamService } from "./careTeam.service.js";

/**
 * Care team module — read endpoints.
 *
 * GET /api/v1/patients/:patientId/care-team
 * Returns provider details and their role on the patient's care team.
 */
export async function registerCareTeamRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/care-team",
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

      const careTeam = await careTeamService.listForPatient(patientId);
      return reply.status(200).send({ data: careTeam });
    },
  );
}

