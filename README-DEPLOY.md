# Scholnexa — Deployment Guide

> **Version:** 1.0.0
> **Stack:** Fastify 5 + React 19 + PostgreSQL 16 + Redis 7 + MinIO
> **Deployment:** Vercel / Netlify (frontend) + VPS Docker Swarm (backend & infrastructure)

---

## Architecture decisions

- The **frontend is a pure SPA** and can be hosted on Vercel, Netlify, any
  static host, or nginx on the VPS.
- The **backend requires persistent infrastructure**: PostgreSQL, Redis +
  BullMQ workers, MinIO object storage and scheduled jobs. It is **not**
  serverless-compatible and must run on a VPS (Docker Swarm) or equivalent
  persistent Node.js hosting.
- All modes below are fully supported and tested configurations. With
  Supabase (Postgres + Storage), the whole app can also run on **Vercel alone**
  via a single multi-service project (Mode C).

```
Browser
  │
  ├── Mode A: https://app.example.com        (Vercel/Netlify/static host)
  ├── Mode B: https://example.com            (nginx on the VPS, Docker Swarm)
  └── Mode C: https://app.vercel.app         (single Vercel project, multi-service)

                        │
                        ▼
              https://api.example.com/api/*   (Fastify on the VPS)
              https://app.vercel.app/api/*    (Fastify on Vercel, Mode C)
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
   PostgreSQL        Redis +         MinIO
   (persistent)      BullMQ          (documents)
```

---

## Mode A — Frontend on Vercel, backend on a VPS (recommended)

### A.1 Vercel project settings

| Setting | Value |
|---|---|
| Framework preset | **Vite** |
| Root directory | `frontend` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm ci` |
| Node version | 22.x |

> **Note:** if you deploy the frontend as a *standalone* project (Mode A), the
> Vercel project settings are: Framework preset **Vite**, Root directory
> `frontend`, Build command `npm run build`, Output directory `dist`.
> The SPA fallback rewrite is defined in the root `vercel.json` (Mode C) — for
> a standalone project, add it as `frontend/vercel.json` or in the dashboard.

### A.2 Vercel environment variables

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://api.example.com/api` |

> Vite bakes `VITE_API_URL` into the bundle at build time — changing it
> requires a redeploy.

### A.3 Backend CORS

The backend accepts a comma-separated `CORS_ORIGIN` list. For Vercel preview
deployments, include both the production domain and the preview pattern:

```env
CORS_ORIGIN=https://app.example.com,https://app-example-com.vercel.app
```

### A.5 Backend on Vercel too (full-serverless mode)

The backend can also be deployed to Vercel as serverless functions, so the
whole application runs without a VPS — **except** the parts that require a
persistent process or persistent infrastructure. This is an *additional*
option; Mode A (backend on a VPS) remains the recommended production setup
because it has no function-time limits.

**What runs on Vercel:** the full Fastify API (all `/api/*` routes) plus
`/health`, as two serverless functions. The app is pre-bundled into a single
self-contained file during the build (`api/[...path].js`) because the
platform's TypeScript compiler does not resolve the `@/*` path alias used in
`src/` — see `backend/scripts/build-vercel-function.mjs`.

**What must stay on an always-on host (VPS) or be a managed service:**

| Component | Why it cannot be serverless | Options |
|---|---|---|
| PostgreSQL (Supabase) | persistent database | **Supabase Postgres** (recommended), VPS Postgres, Neon, RDS |
| Redis (BullMQ) | the queue lives here; the API can still *enqueue* jobs | VPS Redis, Upstash |
| BullMQ worker (`npm run worker`) | long-lived consumer process | VPS container, or any always-on host |
| Document storage | persistent object storage | **Supabase Storage** (recommended, replaces MinIO), VPS MinIO, R2, S3 |
| Scheduled jobs / email & WhatsApp sends | run in the worker | keep the worker running on the VPS |

> If you deploy **only** to Vercel with no worker running anywhere, request/
> response features still work, but background jobs (emails, reminders,
> WhatsApp) will not execute until a worker is available.

**Known serverless limitations (do not fake these away):**

- **Function duration:** `maxDuration` is set to 60s for the catch-all in the
  root `vercel.json` → `services.backend.functions` (Hobby plan default;
  300s on Pro). Slow requests (large AI agent turns, heavy reports) can time
  out.
- **Request body limit:** 4.5 MB (Hobby/Pro). Exam documents are uploaded as
  base64 JSON, so PDFs/Word files must stay under that limit; larger files
  need direct-to-S3 uploads or the VPS backend.
- **Rate limiting** (`@fastify/rate-limit`) is in-memory, so it is enforced
  per function instance, not globally.
- **Cold starts:** each function instance boots the Fastify app once (the
  instance is reused while warm).
- **No WebSockets / no long-lived connections** (none are used today).

**Backend Vercel project settings**

| Setting | Value |
|---|---|
| Framework preset | **Other** |
| Root directory | `backend` |
| Build command | `npm run vercel-build` (defined in `backend/package.json`) |
| Output directory | *(none — functions are deployed)* |
| Install command | `npm ci` |
| Node version | 22.x |

> **Note:** in the multi-service setup (Mode C) the two functions are
> configured in the root `vercel.json` under `services.backend.functions`
> (`api/[...path].js` catch-all + `api/health.ts`). The generated
> `api/[...path].js` is gitignored and recreated on every build.

> **Local `vercel dev`:** run `npm run vercel-build` once before `vercel dev`
> so the catch-all function file exists.

**Backend environment variables** (same set as the VPS — see
`backend/.env.example` and `ENVIRONMENT.md`):

| Variable | Notes |
|---|---|
| `DATABASE_URL` | must point to an externally reachable Postgres (managed or VPS) |
| `JWT_SECRET`, `ADMIN_API_KEY`, `MINIO_*` | **required** — the app refuses to boot in production with default values |
| `REDIS_URL` | needed only if queues are used; otherwise optional |
| `CORS_ORIGIN` | comma-separated; must include the frontend origin(s) |
| `NODE_ENV` | set automatically to `production` by Vercel |
| `VERCEL` | set automatically to `1` — enables serverless-safe behavior (1-connection DB pool, no pino-pretty transport) |

Point the frontend at it with `VITE_API_URL=https://<backend-project>.vercel.app/api`.

---

## Mode C — Everything on Vercel (single multi-service project)

With Supabase providing PostgreSQL and Storage, the whole application can
run on a **single Vercel project** using the multi-service feature: the
frontend SPA and the Fastify serverless functions are declared as two
services in one root `vercel.json`, and both share the same domain.

### C.1 Root `vercel.json`

The repository root already contains the multi-service config:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "services": {
    "frontend": {
      "root": "frontend",
      "framework": "vite",
      "buildCommand": "npm run build",
      "outputDirectory": "dist",
      "rewrites": [
        { "source": "/((?!api/).*)", "destination": "/index.html" }
      ]
    },
    "backend": {
      "root": "backend",
      "framework": "node",
      "buildCommand": "npm run vercel-build",
      "functions": {
        "api/[...path].js": { "maxDuration": 60, "memory": 1024 },
        "api/health.ts": { "maxDuration": 10 }
      }
    }
  },
  "rewrites": [
    { "source": "/api(/.*)?", "destination": { "type": "service", "service": "backend" } },
    { "source": "/(.*)", "destination": { "type": "service", "service": "frontend" } }
  ]
}
```

Routing: `/api/*` → backend service, everything else → frontend SPA. Both
services live on the same domain, so the frontend calls the API with the
**same-origin relative URL** `VITE_API_URL=/api` (works on production and
preview deployments alike — no CORS needed).

> `"framework": "node"` on the backend service is **required**: Vercel would
> otherwise auto-detect the `fastify` framework from `backend/package.json`
> and fail with *"must specify an entrypoint"*. The `node` slug is the generic
> Node preset — it disables framework detection and lets the `api/` functions
> be discovered automatically. (The services schema only accepts strings, so
> the classic `framework: null` "Other" value is invalid here.)

### C.2 Vercel project settings

| Setting | Value |
|---|---|
| Root directory | `.` (repo root — the `vercel.json` declares the services) |
| Framework preset | *(multi-service — set by `vercel.json`)* |
| Build command | `npm run vercel-build` for the backend service, `npm run build` for the frontend (both in `vercel.json`) |

1. Create one project from the repo root.
2. Import `.env.production` into the project (or set the variables in the
   dashboard).
3. Deploy. `/api/*` reaches the backend functions; `/` serves the SPA.

### C.3 Env notes

- `VITE_API_URL=/api` — relative, same-origin, baked at build time.
- `CORS_ORIGIN` can keep the production origin (`https://<project>.vercel.app`
  and a `-*.vercel.app` preview wildcard); with same-origin calls it is
  effectively moot but harmless.
- Everything else (Supabase, JWT, SMTP, AI) is identical to the backend
  variable set in `backend/.env.example`.

### C.4 What still needs an always-on host

Same table as Mode A.5 — the BullMQ worker, scheduled jobs and long-running
tasks must run on a VPS (or a managed queue + cron service). Request/response
features (CRUD, login, payments, documents via Supabase Storage) work fully
on Vercel alone.

---

## Mode B — Full VPS deployment (Docker Swarm)

### B.1 Requirements

- Ubuntu 22.04+ (or any Linux with Docker Engine 24+)
- Docker Engine + Docker Compose plugin
- A domain pointing to the VPS (A record)
- Optional: certbot for TLS on the host reverse proxy

### B.2 Environment

```bash
cp .env.production.example .env.production
# fill in: DOMAIN, DB_PASSWORD, REDIS_PASSWORD, JWT_SECRET, ADMIN_API_KEY, ...
```

Generate secure values:

```bash
openssl rand -hex 32      # JWT_SECRET
openssl rand -hex 16      # DB_PASSWORD, REDIS_PASSWORD
openssl rand -base64 32   # ADMIN_API_KEY
```

### B.3 Deploy

```bash
docker swarm init
./deploy.sh                # builds/pulls images, deploys the stack, runs migrations
docker stack ps scholnexa  # verify
```

`deploy.sh`:

1. Reads `.env.production`.
2. Pulls (or builds) the frontend, API, and backup images.
3. Deploys the `scholnexa` stack (postgres, redis, minio, backend, worker,
   backups, monitoring).
4. Waits for the backend and runs `node dist/db/migrate.js`.

### B.4 Reverse proxy & HTTPS

The stack publishes:

| Service | Host port |
|---|---|
| frontend (nginx SPA) | `3003` |
| backend API | `3004` |

Configure a host-level nginx (or any proxy) to route:

```nginx
server {
  listen 80;
  server_name example.com;

  location /api/ { proxy_pass http://127.0.0.1:3004; }
  location /health { proxy_pass http://127.0.0.1:3004; }
  location / { proxy_pass http://127.0.0.1:3003; }
}
```

Then obtain TLS certificates:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d example.com
```

### B.5 Database migrations

Migrations run automatically:

- on deploy (`deploy.sh`),
- in CI/CD as a one-off Swarm service.

Manual migration:

```bash
docker run --rm --network scholnexa_scholnexa \
  -e DATABASE_URL="postgres://postgres:${DB_PASSWORD}@postgres:5432/school_crm" \
  ghcr.io/scholnexa/school-crm-api:latest \
  node --import tsx/esm dist/db/migrate.js
```

### B.6 Health checks

- API: `GET https://example.com/health` → `{"status":"ok",...}`
- Frontend: `GET /` serves the SPA.

### B.7 Updating the application

```bash
git pull origin main
./deploy.sh
```

With CI/CD enabled, pushing to `main` rebuilds and redeploys automatically
(see `AGENTS.md`).

### B.8 Rollback

Images are tagged both `:latest` and `:${sha}`. To roll back:

```bash
REGISTRY=ghcr.io/scholnexa docker stack deploy -c docker-compose.production.yml \
  scholnexa --with-registry-auth
# or retag the previous sha image as latest and re-run ./deploy.sh
```

---

## CI/CD

`.github/workflows/ci-cd.yml`:

1. Lint / test / build backend and frontend (on push & PR to `main`/`develop`).
2. On push to `main`: build & push the three images to GHCR.
3. SSH to the VPS: pull images, write `.env.production` from the
   `ENV_PRODUCTION` secret, deploy the stack, run migrations.

Required GitHub secrets & variables: see `AGENTS.md`.

---

## Monitoring & backups

The production stack includes:

- **Prometheus + cAdvisor + Grafana** (metrics, dashboard on `monitor.<domain>`)
- **Loki + Promtail** (log aggregation)
- **Daily `pg_dump`** backups with 30-day retention (`db-backup` service,
  volume `dbbackups`)

## Troubleshooting

| Symptom | Fix |
|---|---|
| Frontend cannot reach the API | Check `VITE_API_URL` was set at build time; check backend `CORS_ORIGIN` includes the frontend origin |
| 502 on `/api/*` | Backend container unhealthy — `docker service logs scholnexa_backend --tail 50` |
| Migration failed | `docker service logs scholnexa-migrate --tail 50`; DB credentials in `.env.production` |
| SSL certificate errors | Re-run `certbot --nginx -d example.com`; verify the A record |
| Redis connection refused | Verify `REDIS_PASSWORD` matches between `.env.production` and compose |
