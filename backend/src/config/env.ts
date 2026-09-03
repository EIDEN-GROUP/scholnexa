import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try common locations for .env / .env.production
const candidates = [
  path.resolve(__dirname, "..", "..", ".env"),        // backend/.env
  path.resolve(__dirname, "..", "..", "..", ".env"),  // merged monorepo-root .env
  path.resolve(process.cwd(), ".env"),
];
for (const c of candidates) {
  if (existsSync(c)) {
    dotenv.config({ path: c });
    break;
  }
}

const prodCandidates = [
  path.resolve(__dirname, "..", "..", ".env.production"),          // container: /app/
  path.resolve(__dirname, "..", "..", "..", ".env.production"),    // dev: monorepo root
  path.resolve(process.cwd(), ".env.production"),                  // cwd
  path.resolve(process.cwd(), "..", ".env.production"),            // parent of cwd
];
for (const c of prodCandidates) {
  if (existsSync(c)) {
    dotenv.config({ path: c, override: true });
    break;
  }
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z
    .string()
    .default("postgres://postgres:postgres@localhost:5432/school_crm"),

  JWT_SECRET: z.string().default("change-me-in-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  REDIS_URL: z.string().default("redis://localhost:6379"),

  // Supabase (PostgreSQL + Storage). DATABASE_URL points at the Supabase
  // Postgres (pooler :6543 recommended for the API, direct :5432 for
  // migrations); SUPABASE_URL/SERVICE_ROLE_KEY power document storage.
  SUPABASE_URL: z.string().default("http://localhost:54321"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().default("examens"),

  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  FROM_EMAIL: z.string().default("noreply@school-crm.com"),
  ADMIN_EMAIL: z.string().default("admin@school-crm.com"),

  WHATSAPP_PHONE_NUMBER_ID: z.string().default(""),
  WHATSAPP_ACCESS_TOKEN: z.string().default(""),
  WHATSAPP_API_VERSION: z.string().default("v22.0"),
  N8N_WEBHOOK_URL: z.string().default(""),
  N8N_WEBHOOK_SECRET: z.string().default(""),

  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  ADMIN_API_KEY: z.string().default("superadmin-secret-key-change-me"),

  AI_API_KEY: z.string().default(""),
  AI_BASE_URL: z.string().default("https://integrate.api.nvidia.com/v1"),
  AI_MODEL: z.string().default("meta/llama-3.1-8b-instruct"),

  LOG_LEVEL: z.string().default("info"),
});

export type Env = z.infer<typeof envSchema>;

/**
 * True when running inside a serverless function (Vercel sets `VERCEL=1`
 * automatically; the AWS_LAMBDA check is a defensive fallback). Serverless
 * contexts get a 1-connection DB pool and no pino-pretty transport.
 */
export const IS_SERVERLESS =
  process.env.VERCEL === "1" ||
  process.env.AWS_LAMBDA_FUNCTION_NAME != null;

let _env: Env | undefined;

const WEAK_SECRETS = new Set([
  "change-me-in-production",
  "superadmin-secret-key-change-me",
  "change-me-to-a-random-secret",
]);

/**
 * Fail fast in production when obviously weak default secrets are used.
 * A white-label deployment that forgets to set these would otherwise ship
 * with a publicly guessable JWT signing key.
 */
function assertStrongProductionSecrets(env: Env): void {
  if (env.NODE_ENV !== "production") return;
  const problems: string[] = [];
  if (WEAK_SECRETS.has(env.JWT_SECRET)) {
    problems.push("JWT_SECRET must be a strong random value");
  }
  if (WEAK_SECRETS.has(env.ADMIN_API_KEY)) {
    problems.push("ADMIN_API_KEY must be a strong random value");
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    problems.push(
      "SUPABASE_SERVICE_ROLE_KEY must be set (required for document storage)",
    );
  }
  if (problems.length > 0) {
    console.error(
      "Invalid production environment | insecure defaults detected:\n" +
        problems.map((p) => `  - ${p}`).join("\n") +
        "\nGenerate values with `openssl rand -hex 32` and set them in .env.production.",
    );
    process.exit(1);
  }
}

export function getEnv(): Env {
  if (!_env) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error("Invalid environment variables:", result.error.flatten());
      process.exit(1);
    }
    _env = result.data;
    assertStrongProductionSecrets(_env);
  }
  return _env;
}
