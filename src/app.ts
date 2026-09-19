import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import multipart from "@fastify/multipart";
import { env } from "./config/env.js";
import { registerErrorHandler } from "./middleware/error-handler.js";
import { registerHealthRoutes } from "./modules/health.js";
import { registerPatientRoutes } from "./modules/patients/patient.routes.js";
import { registerConditionRoutes } from "./modules/conditions/condition.routes.js";
import { registerTimelineRoutes } from "./modules/timeline/timeline.routes.js";
import { registerMedicationRoutes } from "./modules/medications/medication.routes.js";
import { registerAppointmentRoutes } from "./modules/appointments/appointment.routes.js";
import { registerCareTeamRoutes } from "./modules/care-team/careTeam.routes.js";
import { registerUserRoutes } from "./modules/users/user.routes.js";
import { registerDocumentRoutes } from "./modules/documents/document.routes.js";

/**
 * Builds a fully configured Fastify instance without starting it — this
 * separation lets tests instantiate the app with `app.inject(...)` and
 * never bind a real port.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "test" ? "silent" : "info",
    },
  });

  await app.register(cors, {
    origin: "http://localhost:3001",
    credentials: true,
  });
  await app.register(sensible);
  await app.register(multipart, {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1,
    },
  });

  registerErrorHandler(app);

  // Health check — implemented this phase.
  await app.register(registerHealthRoutes);

  // Route/service scaffolding for future phases — handlers are stubbed
  // (501 Not Implemented) until business logic is built out. See each
  // module's routes.ts for details.
  await app.register(registerPatientRoutes, { prefix: "/api/v1" });
  await app.register(registerDocumentRoutes, { prefix: "/api/v1" });
  await app.register(registerConditionRoutes, { prefix: "/api/v1" });
  await app.register(registerTimelineRoutes, { prefix: "/api/v1" });
  await app.register(registerMedicationRoutes, { prefix: "/api/v1" });
  await app.register(registerAppointmentRoutes, { prefix: "/api/v1" });
  await app.register(registerCareTeamRoutes, { prefix: "/api/v1" });
  await app.register(registerUserRoutes, { prefix: "/api/v1" });

  return app;
}
