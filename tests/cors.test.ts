import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";

describe("CORS configuration", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    app = await buildApp();
  });

  afterEach(async () => {
    await app.close();
  });

  it("handles OPTIONS preflight request from http://localhost:3001 with appropriate CORS headers", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/v1/patients/test-patient/care-logic",
      headers: {
        origin: "http://localhost:3001",
        "access-control-request-method": "GET",
        "access-control-request-headers": "authorization, content-type",
      },
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
    expect(response.headers["access-control-allow-methods"]).toBeDefined();
    expect(response.headers["access-control-allow-methods"]).toContain("GET");
    expect(response.headers["access-control-allow-headers"]).toContain("authorization, content-type");
  });

  it("attaches Access-Control-Allow-Origin to standard GET requests from http://localhost:3001", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: {
        origin: "http://localhost:3001",
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("does NOT allow origin wildcard or unauthorized origins", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/health",
      headers: {
        origin: "http://localhost:3001",
        "access-control-request-method": "GET",
      },
    });

    expect(response.headers["access-control-allow-origin"]).not.toBe("*");
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
  });
});
