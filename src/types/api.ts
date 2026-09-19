/**
 * Shared, transport-level API types.
 *
 * P1 and P3 should be able to understand the shape of every response from
 * this file alone, without knowing anything about Prisma or PostgreSQL.
 * Domain-specific response shapes live alongside each module; this file is
 * only for the generic envelope every endpoint follows.
 */

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
    /** Present for validation errors (e.g. Zod field errors). */
    details?: Record<string, unknown>;
  };
}

export interface ApiSuccessBody<T> {
  data: T;
}

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

/** Roles known to the system. Mirrors the Prisma `UserRole` enum. */
export type UserRole = "PATIENT" | "DOCTOR" | "CAREGIVER";

/**
 * The authenticated principal attached to a request after the auth
 * middleware runs. Kept intentionally minimal at this stage.
 */
export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  /** Set when the user is a PATIENT and is linked to a Patient record. */
  patientId?: string;
}
