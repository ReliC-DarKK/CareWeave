import "dotenv/config";
import { z } from "zod";

/**
 * All environment variables the backend depends on are validated here,
 * once, at startup. Nothing downstream should read from `process.env`
 * directly — import `env` from this module instead, so the whole app
 * gets typed, validated configuration.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  AUTH_JWT_SECRET: z.string().min(1, "AUTH_JWT_SECRET is required"),
  AUTH_JWT_EXPIRES_IN: z.string().default("1h"),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("Invalid environment configuration:");
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();
