import { PrismaClient } from "@prisma/client";
import { env } from "../config/env.js";

/**
 * Single shared Prisma client for the whole process.
 *
 * In development, tools like tsx's watch mode can re-evaluate this module
 * on every reload, which would otherwise create a new PrismaClient (and a
 * new pool of DB connections) each time. We stash the instance on
 * `globalThis` to avoid that — a common, documented Prisma pattern.
 */
declare global {
  // eslint-disable-next-line no-var
  var __careweavePrisma: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  globalThis.__careweavePrisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalThis.__careweavePrisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
