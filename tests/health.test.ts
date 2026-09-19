import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

describe("GET /health", () => {
  it("returns 200 with status ok", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    const body = response.json() as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(typeof body.timestamp).toBe("string");

    await app.close();
  });
});

describe("404 handling", () => {
  it("returns a structured 404 body for unknown routes", async () => {
    const app = await buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/this-route-does-not-exist",
    });

    expect(response.statusCode).toBe(404);
    const body = response.json() as { error: { code: string } };
    expect(body.error.code).toBe("NOT_FOUND");

    await app.close();
  });
});

