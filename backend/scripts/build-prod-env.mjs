import fs from "node:fs";

// Read the merged root .env (all real secrets live here)
const src = fs.readFileSync("../.env", "utf8");
const get = (k) => {
  const m = src.match(new RegExp(`^${k}=(.*)$`, "m"));
  return m ? m[1].trim() : "";
};

const FE_URL = "https://scholnexa.vercel.app";
// Two separate Vercel projects (classic monorepo model): the frontend
// project serves the SPA from frontend/, the backend project serves the
// api/ serverless functions from backend/. Each project imports this same
// env file and reads the variables it needs.
const API_URL = "https://scholnexa-api.vercel.app";

const lines = [
  "# ═══════════════════════════════════════════════════════════════",
  "# Scholnexa | Production Environment (Vercel import file)",
  "# ═══════════════════════════════════════════════════════════════",
  "# Import this whole file into BOTH Vercel projects:",
  "#   • Frontend project  → uses the VITE_* variables (baked at build time)",
  "#   • Backend project   → uses the rest (serverless functions)",
  "# Frontend:  " + FE_URL,
  "# Backend:   " + API_URL + "/api",
  "# ═══════════════════════════════════════════════════════════════",
  "",
  "# ─── Core ───────────────────────────────────────────────────────",
  "NODE_ENV=production",
  "PORT=3000",
  "HOST=0.0.0.0",
  "LOG_LEVEL=info",
  "",
  "# ─── Database (Supabase PostgreSQL via transaction pooler) ──────",
  "DATABASE_URL=" + get("DATABASE_URL"),
  "",
  "# ─── Supabase Storage (exam documents) ──────────────────────────",
  "SUPABASE_URL=" + get("SUPABASE_URL"),
  "SUPABASE_SERVICE_ROLE_KEY=" + get("SUPABASE_SERVICE_ROLE_KEY"),
  "SUPABASE_STORAGE_BUCKET=examens",
  "",
  "# ─── Auth ───────────────────────────────────────────────────────",
  "JWT_SECRET=" + get("JWT_SECRET"),
  "JWT_EXPIRES_IN=7d",
  "",
  "# ─── Redis (BullMQ worker | runs on VPS only; ignored by serverless) ──",
  "REDIS_URL=" + (get("REDIS_URL") || "redis://localhost:6379"),
  "",
  "# ─── Email (SMTP) ───────────────────────────────────────────────",
  "SMTP_HOST=" + get("SMTP_HOST"),
  "SMTP_PORT=" + (get("SMTP_PORT") || "587"),
  "SMTP_USER=" + get("SMTP_USER"),
  "SMTP_PASS=" + get("SMTP_PASS"),
  "FROM_EMAIL=" + get("FROM_EMAIL"),
  "ADMIN_EMAIL=" + get("ADMIN_EMAIL"),
  "",
  "# ─── CORS (allow the frontend origin) ───────────────────────────",
  "CORS_ORIGIN=" + FE_URL + "," + FE_URL.replace(".vercel.app", "-*.vercel.app"),
  "",
  "# ─── Admin API ──────────────────────────────────────────────────",
  "ADMIN_API_KEY=" + get("ADMIN_API_KEY"),
  "",
  "# ─── Optional integrations ──────────────────────────────────────",
  "WHATSAPP_PHONE_NUMBER_ID=" + get("WHATSAPP_PHONE_NUMBER_ID"),
  "WHATSAPP_ACCESS_TOKEN=" + get("WHATSAPP_ACCESS_TOKEN"),
  "WHATSAPP_API_VERSION=v22.0",
  "N8N_WEBHOOK_URL=" + get("N8N_WEBHOOK_URL"),
  "N8N_WEBHOOK_SECRET=" + get("N8N_WEBHOOK_SECRET"),
  "",
  "# ─── AI assistant ───────────────────────────────────────────────",
  "AI_API_KEY=" + get("AI_API_KEY"),
  "AI_BASE_URL=" + (get("AI_BASE_URL") || "https://integrate.api.nvidia.com/v1"),
  "AI_MODEL=" + (get("AI_MODEL") || "meta/llama-3.1-8b-instruct"),
  "",
  "# ═══ FRONTEND (VITE_* | used by the frontend Vercel project) ═══",
  "# Absolute URL of the backend Vercel project. Update it if Vercel assigns",
  "# the backend project a different subdomain, then redeploy the frontend.",
  "VITE_API_URL=" + API_URL + "/api",
  "VITE_ADMIN_EMAIL=" + (get("VITE_ADMIN_EMAIL") || "admin@scholnexa.com"),
  "VITE_SUPABASE_URL=" + get("VITE_SUPABASE_URL"),
  "VITE_SUPABASE_ANON=" + get("VITE_SUPABASE_ANON"),
  "",
];

fs.writeFileSync("../.env.production", lines.join("\n"), "utf8");
console.log(".env.production written");
