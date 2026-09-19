import type {
  CaregiverAccessLevel,
  PatientCaregiver,
  PrismaClient,
} from "@prisma/client";
import { prisma } from "../../db/prisma.js";

/**
 * Structured denial reasons for caregiver authorization checks.
 */
export type CaregiverAccessDenialReason =
  | "NO_RELATIONSHIP"
  | "REVOKED"
  | "PENDING"
  | "EXPIRED";

export interface CaregiverAccessAllowed {
  allowed: true;
  accessLevel: CaregiverAccessLevel;
  grant: PatientCaregiver;
}

export interface CaregiverAccessDenied {
  allowed: false;
  reason: CaregiverAccessDenialReason;
  grant: PatientCaregiver | null;
}

export type CaregiverAccessResult = CaregiverAccessAllowed | CaregiverAccessDenied;

/**
 * Service providing reusable caregiver authorization and proxy access checking.
 *
 * Designed to be consumed by authorization middleware (e.g. requirePatientAccess)
 * once token verification and role guards are implemented by Cybersecurity.
 */
export class CaregiverAccessService {
  constructor(private readonly db: PrismaClient = prisma) {}

  /**
   * Evaluates whether a caregiver user has access to a patient record,
   * inspecting the explicit PatientCaregiver relationship, status, validity window,
   * and access level.
   *
   * @param patientId Unique ID of the patient
   * @param caregiverId User ID of the caregiver
   * @param referenceDate Optional reference timestamp for expiration comparison (defaults to current time)
   */
  async checkAccess(
    patientId: string,
    caregiverId: string,
    referenceDate: Date = new Date(),
  ): Promise<CaregiverAccessResult> {
    const grant = await this.db.patientCaregiver.findUnique({
      where: {
        patientId_caregiverId: {
          patientId,
          caregiverId,
        },
      },
    });

    // 1. No relationship exists
    if (!grant) {
      return {
        allowed: false,
        reason: "NO_RELATIONSHIP",
        grant: null,
      };
    }

    // 2. Revoked grant
    if (grant.status === "REVOKED") {
      return {
        allowed: false,
        reason: "REVOKED",
        grant,
      };
    }

    // 3. Pending grant
    if (grant.status === "PENDING") {
      return {
        allowed: false,
        reason: "PENDING",
        grant,
      };
    }

    // 4. Explicitly expired status
    if (grant.status === "EXPIRED") {
      return {
        allowed: false,
        reason: "EXPIRED",
        grant,
      };
    }

    // 5. Active status but expiresAt timestamp is in the past
    if (grant.expiresAt && grant.expiresAt.getTime() <= referenceDate.getTime()) {
      return {
        allowed: false,
        reason: "EXPIRED",
        grant,
      };
    }

    // 6. Active grant with valid/no expiration
    if (grant.status === "ACTIVE") {
      return {
        allowed: true,
        accessLevel: grant.accessLevel,
        grant,
      };
    }

    // Fallback for any unknown or non-active status
    return {
      allowed: false,
      reason: "EXPIRED",
      grant,
    };
  }
}

export const caregiverAccessService = new CaregiverAccessService();

/**
 * Functional convenience helper for caregiver access evaluation.
 */
export async function checkCaregiverAccess(
  patientId: string,
  caregiverId: string,
  referenceDate: Date = new Date(),
): Promise<CaregiverAccessResult> {
  return caregiverAccessService.checkAccess(patientId, caregiverId, referenceDate);
}
