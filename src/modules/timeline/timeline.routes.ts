import type { FastifyInstance } from "fastify";
import { authenticate, requirePatientAccess } from "../../middleware/auth.js";
import { patientParamsSchema } from "../patients/patient.schema.js";
import { patientService } from "../patients/patient.service.js";
import { timelineService } from "./timeline.service.js";

/**
 * Timeline module — read endpoints.
 *
 * GET /api/v1/patients/:patientId/timeline
 *
 * Serves raw TimelineEvent records ordered chronologically by eventTime
 * with provenance fields intact (sourceType, sourceRef, recordedAt, conditionId).
 * Does NOT interpret or summarize — consumption is owned by P1's care-state engine.
 */
export async function registerTimelineRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/timeline",
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

      const timelineEvents = await timelineService.listForPatient(patientId);
      return reply.status(200).send({ data: timelineEvents });
    },
  );
}

