import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/env.js";
import type { AuthenticatedUser, UserRole } from "../types/api.js";

/**
 * AUTH SCAFFOLDING WITH LOCAL DEVELOPMENT BYPASS.
 *
 * This file defines the shape of authentication/authorization for the
 * backend, so routes and tests can run against a stable contract.
 *
 * DEVELOPMENT BYPASS:
 * For LOCAL DEVELOPMENT ONLY (gated by NODE_ENV=development and test), these
 * endpoints are allowed to proceed without a real JWT so P1 can integrate
 * and test without requiring full auth infrastructure.
 *
 * PRODUCTION SAFEGUARD:
 * In production (NODE_ENV=production), this middleware fails closed
 * (HTTP 501 NOT_IMPLEMENTED until token verification is fully implemented)
 * and does NOT silently bypass authentication. No fake tokens or hardcoded
 * production credentials exist.
 */

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // Gated local development / test bypass:
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return;
  }

  // Fail closed in production until real JWT verification is implemented:
  void request;
  await reply.status(501).send({
    error: {
      message: "Authentication is not implemented yet.",
      code: "NOT_IMPLEMENTED",
    },
  });
}

export function requireRole(...allowedRoles: UserRole[]) {
  return async function roleGuard(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
      return;
    }

    void request;
    void allowedRoles;
    await reply.status(501).send({
      error: {
        message: "Role-based authorization is not implemented yet.",
        code: "NOT_IMPLEMENTED",
      },
    });
  };
}

export async function requirePatientAccess(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (env.NODE_ENV === "development" || env.NODE_ENV === "test") {
    return;
  }

  void request;
  await reply.status(501).send({
    error: {
      message: "Patient-level authorization is not implemented yet.",
      code: "NOT_IMPLEMENTED",
    },
  });
}

