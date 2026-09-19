/**
 * Runs before any test file's imports are evaluated. `src/config/env.ts`
 * validates required environment variables at import time (and exits the
 * process if they're missing), so tests need *some* value present even
 * though this test suite never actually connects to a database.
 *
 * These are placeholder values for the test process only — never real
 * credentials, and never used against a real database.
 */
process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??=
  "postgresql://test:test@localhost:5432/careweave_test?schema=public";
process.env.AUTH_JWT_SECRET ??= "test-only-secret-not-for-real-use";

import { vi } from "vitest";

vi.mock("@fastify/sensible", () => ({
  default: Object.assign(async () => {}, {
    [Symbol.for("skip-override")]: true,
  }),
}));

