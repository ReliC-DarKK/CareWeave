import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../src/db/prisma.js";
import {
  caregiverAccessService,
  checkCaregiverAccess,
} from "../src/modules/care-team/caregiverAccess.service.js";

// Mock Prisma so that unit tests execute deterministically without PostgreSQL:
vi.mock("../src/db/prisma.js", () => {
  const mockPrisma = {
    patientCaregiver: {
      findUnique: vi.fn(),
    },
    $disconnect: vi.fn(),
  };

  return {
    prisma: mockPrisma,
    disconnectPrisma: vi.fn(),
  };
});

describe("Caregiver Access Service", () => {
  const patientId = "patient-001";
  const caregiverId = "caregiver-001";

  const baseGrant = {
    id: "grant-001",
    patientId,
    caregiverId,
    relationship: "Spouse",
    accessLevel: "FULL_ACCESS" as const,
    status: "ACTIVE" as const,
    grantedAt: new Date("2025-01-01T00:00:00.000Z"),
    expiresAt: null,
    revokedAt: null,
    notes: "Primary family caregiver",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. ACTIVE caregiver grant -> allowed
  it("allows access when an active grant exists with no expiration", async () => {
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(baseGrant as any);

    const result = await caregiverAccessService.checkAccess(patientId, caregiverId);

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.accessLevel).toBe("FULL_ACCESS");
      expect(result.grant.id).toBe("grant-001");
    }
    expect(prisma.patientCaregiver.findUnique).toHaveBeenCalledWith({
      where: {
        patientId_caregiverId: {
          patientId,
          caregiverId,
        },
      },
    });
  });

  // 2. No relationship -> denied
  it("denies access when no relationship exists between caregiver and patient", async () => {
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(null);

    const result = await caregiverAccessService.checkAccess(patientId, "unknown-caregiver");

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("NO_RELATIONSHIP");
      expect(result.grant).toBeNull();
    }
  });

  // 3. REVOKED grant -> denied
  it("denies access when the caregiver grant status is REVOKED", async () => {
    const revokedGrant = {
      ...baseGrant,
      status: "REVOKED" as const,
      revokedAt: new Date("2025-02-01T00:00:00.000Z"),
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(revokedGrant as any);

    const result = await caregiverAccessService.checkAccess(patientId, caregiverId);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("REVOKED");
      expect(result.grant).toBeDefined();
    }
  });

  // 4. EXPIRED grant -> denied
  it("denies access when the caregiver grant status is explicitly EXPIRED", async () => {
    const expiredGrant = {
      ...baseGrant,
      status: "EXPIRED" as const,
      expiresAt: new Date("2025-01-10T00:00:00.000Z"),
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(expiredGrant as any);

    const result = await caregiverAccessService.checkAccess(patientId, caregiverId);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("EXPIRED");
      expect(result.grant).toBeDefined();
    }
  });

  // 5. ACTIVE grant whose expiresAt is in the past -> denied
  it("denies access when an ACTIVE grant has an expiresAt timestamp in the past", async () => {
    const pastGrant = {
      ...baseGrant,
      status: "ACTIVE" as const,
      expiresAt: new Date("2025-01-01T00:00:00.000Z"),
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(pastGrant as any);

    // Reference time in the future relative to expiresAt
    const refDate = new Date("2025-06-01T00:00:00.000Z");
    const result = await caregiverAccessService.checkAccess(patientId, caregiverId, refDate);

    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("EXPIRED");
      expect(result.grant).toBeDefined();
    }
  });

  // 6. ACTIVE READ_ONLY -> returns READ_ONLY
  it("returns READ_ONLY access level for an active READ_ONLY grant", async () => {
    const readOnlyGrant = {
      ...baseGrant,
      accessLevel: "READ_ONLY" as const,
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(readOnlyGrant as any);

    const result = await caregiverAccessService.checkAccess(patientId, caregiverId);

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.accessLevel).toBe("READ_ONLY");
    }
  });

  // 7. ACTIVE FULL_ACCESS -> returns FULL_ACCESS
  it("returns FULL_ACCESS access level for an active FULL_ACCESS grant", async () => {
    const fullAccessGrant = {
      ...baseGrant,
      accessLevel: "FULL_ACCESS" as const,
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(fullAccessGrant as any);

    const result = await caregiverAccessService.checkAccess(patientId, caregiverId);

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.accessLevel).toBe("FULL_ACCESS");
    }
  });

  // 8. ACTIVE EMERGENCY_ONLY -> returns EMERGENCY_ONLY
  it("returns EMERGENCY_ONLY access level for an active EMERGENCY_ONLY grant", async () => {
    const emergencyGrant = {
      ...baseGrant,
      accessLevel: "EMERGENCY_ONLY" as const,
    };
    vi.mocked(prisma.patientCaregiver.findUnique).mockResolvedValueOnce(emergencyGrant as any);

    const result = await checkCaregiverAccess(patientId, caregiverId);

    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.accessLevel).toBe("EMERGENCY_ONLY");
    }
  });
});
