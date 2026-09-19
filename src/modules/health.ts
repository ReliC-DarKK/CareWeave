import type { FastifyInstance } from "fastify";

interface HealthResponse {
  status: "ok";
  timestamp: string;
}

/**
 * GET /health
 *
 * Deliberately does not touch the database — it reports that the process
 * is up and serving requests. Database connectivity can be added as a
 * separate readiness check later if P1/P3 need one; keeping this one
 * simple avoids a false "down" reading if only the DB is briefly
 * unreachable.
 */
export async function registerHealthRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Reply: HealthResponse }>("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });
}
