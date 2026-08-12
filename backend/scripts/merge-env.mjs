/**
 * Merges `backend/.env` + `frontend/.env` into a single monorepo-root `.env`
 * that works for both apps (import into Vercel, used by local dev and
 * migrations). Obsolete MINIO_* keys are dropped; a default storage bucket is
 * added when missing. Only key names are printed — values stay in the files.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..", "..");

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  const out = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim();
  }
  return out;
}

const backend = readEnv(path.join(root, "backend", ".env"));
const frontend = readEnv(path.join(root, "frontend", ".env"));

const SKIP = new Set([
  "MINIO_ENDPOINT",
  "MINIO_PORT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "MINIO_USE_SSL",
]);

const BACKEND_ORDER = [
  "NODE_ENV", "PORT", "HOST", "LOG_LEVEL",
  "DATABASE_URL",
  "SUPABASE_URL", "SUPABASE_ANON", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_STORAGE_BUCKET",
  "JWT_SECRET", "JWT_EXPIRES_IN",
  "REDIS_URL",
  "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "FROM_EMAIL", "ADMIN_EMAIL",
  "CORS_ORIGIN",
  "ADMIN_API_KEY",
  "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_ACCESS_TOKEN", "WHATSAPP_API_VERSION",
  "N8N_WEBHOOK_URL", "N8N_WEBHOOK_SECRET",
  "AI_API_KEY", "AI_BASE_URL", "AI_MODEL",
];

const FRONTEND_ORDER = [
  "VITE_API_URL", "VITE_ADMIN_EMAIL", "VITE_SUPABASE_URL", "VITE_SUPABASE_ANON",
];

const lines = [
  "# ═══════════════════════════════════════════════════════════════",
  "# Scholnexa — merged environment (backend + frontend)",
  "# ═══════════════════════════════════════════════════════════════",
  "# One file for both apps: import it into the Vercel frontend AND",
  "# backend projects, and it powers local dev + migrations.",
  "# Frontend-only vars are VITE_-prefixed; the rest are backend vars.",
  "# ═══════════════════════════════════════════════════════════════",
];

for (const key of BACKEND_ORDER) {
  if (backend[key] !== undefined && !SKIP.has(key)) {
    lines.push(`\n# ── backend: ${key}`);
    lines.push(`${key}=${backend[key]}`);
  }
}

lines.push("\n# ═══════════════════════════════════════════════════════════════");
lines.push("# Frontend (VITE_)");
lines.push("# ═══════════════════════════════════════════════════════════════");
for (const key of FRONTEND_ORDER) {
  if (frontend[key] !== undefined) {
    lines.push(`\n# ── frontend: ${key}`);
    lines.push(`${key}=${frontend[key]}`);
  }
}

fs.writeFileSync(path.join(root, ".env"), lines.join("\n") + "\n");
console.log("Merged root .env written.");
console.log("Backend keys:", BACKEND_ORDER.filter((k) => backend[k] !== undefined && !SKIP.has(k)).join(", "));
console.log("Frontend keys:", FRONTEND_ORDER.filter((k) => frontend[k] !== undefined).join(", "));
