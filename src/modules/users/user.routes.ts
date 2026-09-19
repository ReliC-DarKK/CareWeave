import type { FastifyInstance } from "fastify";

/**
 * Users module — reserved, no routes yet.
 *
 * The original endpoint plan doesn't list a /users route for this phase.
 * This module exists as a placeholder for future auth-adjacent endpoints
 * (e.g. login, current-user profile) so the folder structure and
 * registration pattern are already in place. Intentionally registers
 * nothing right now.
 */
// eslint-disable-next-line @typescript-eslint/require-await
export async function registerUserRoutes(_app: FastifyInstance): Promise<void> {
  // No routes registered this phase.
}
