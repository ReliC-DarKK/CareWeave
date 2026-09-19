import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import type { ApiErrorBody } from "../types/api.js";

/**
 * Centralized error handling: every error thrown or passed to `reply` in
 * any route flows through here, so we always return a consistent, safe
 * shape and never leak internals (stack traces, raw DB errors) to the
 * client.
 */
export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError | ZodError | Error, request: FastifyRequest, reply: FastifyReply) => {
      request.log.error({ err: error }, "Request failed");

      if (error instanceof ZodError) {
        const body: ApiErrorBody = {
          error: {
            message: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.flatten().fieldErrors,
          },
        };
        void reply.status(400).send(body);
        return;
      }

      const statusCode =
        "statusCode" in error && typeof error.statusCode === "number"
          ? error.statusCode
          : 500;

      const body: ApiErrorBody = {
        error: {
          // Never leak internal error messages for 5xx errors.
          message: statusCode >= 500 ? "Internal server error" : error.message,
          code: statusCode >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
        },
      };

      void reply.status(statusCode).send(body);
    },
  );

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const body: ApiErrorBody = {
      error: {
        message: `Route not found: ${request.method} ${request.url}`,
        code: "NOT_FOUND",
      },
    };
    void reply.status(404).send(body);
  });
}
