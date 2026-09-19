import type { FastifyReply } from "fastify";
import type { ApiErrorBody } from "../types/api.js";

/**
 * Consistent 501 response for routes whose contract is defined but whose
 * business logic hasn't been built yet. Used only for the future-phase
 * endpoints listed in each module's routes.ts — /health is real and does
 * not use this.
 */
export async function notImplemented(
  reply: FastifyReply,
  routeDescription: string,
): Promise<FastifyReply> {
  const body: ApiErrorBody = {
    error: {
      message: `${routeDescription} is planned but not implemented yet.`,
      code: "NOT_IMPLEMENTED",
    },
  };
  return reply.status(501).send(body);
}
