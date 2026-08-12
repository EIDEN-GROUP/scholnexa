# Scholnexa — Deployment Guide

> **Version:** 1.0.0
> **Stack:** Fastify 5 + React 19 + PostgreSQL 16 (Supabase) + Redis 7 + Supabase Storage
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
  using two separate Vercel projects (Mode C): one for the SPA, one for the
  Fastify serverless functions.

```
Browser
  │
  ├── Mode A: https://app.example.com        (Vercel/Netlify/static host)
  ├── Mode B: https://example.com            (nginx on the VPS, Docker Swarm)
  └── Mode C: https://<frontend>.vercel.app  (Vercel — two projects)

                        │
                        ▼
              https://api.example.com/api/*        (Fastify on the VPS)
              https://<backend>.vercel.app/api/*   (Fastify on Vercel, Mode C)
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

> **Note:** for a standalone frontend project, the SPA fallback rewrite is
> defined in `frontend/vercel.json` (or as a rewrite rule in the dashboard).

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

- **Function duration:** `maxDuration` is set to 60s for the catch-all in
  `backend/vercel.json` (Hobby plan default; 300s on Pro). Slow requests
  (large AI agent turns, heavy reports) can time out.
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

> **Note:** the two functions are configured in `backend/vercel.json`
> (`api/[...path].js` catch-all + `api/health.ts`). The catch-all bundle is
> **committed** on purpose — Vercel validates `functions` patterns and
> discovers `api/` functions *before* the build command runs, so the file
> must exist in the repo at clone time. `npm run vercel-build` regenerates it
> deterministically on every deploy.

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

## Mode C — Everything on Vercel (two projects)

With Supabase providing PostgreSQL and Storage, the whole application can run
on Vercel alone using **two separate Vercel projects** (the classic monorepo
pattern): one project serves the frontend SPA, the other deploys the backend
`api/` serverless functions.

> **Why two projects and not the multi-service (`services`) feature?** Vercel's
> multi-service config only supports framework presets that run the backend as
> a single monolithic app (`@vercel/fastify`, `@vercel/backends`, …). None of
> them deploy classic `api/`-directory `@vercel/node` functions — which is the
> architecture this backend uses (`api/[...path].js` + `api/health.ts`, pre-
> bundled by `vercel-build`). The two-project model uses exactly that
> battle-tested functions pipeline, so it is the supported way to run this
> backend on Vercel.

### C.1 Project 1 — Frontend

| Setting | Value |
|---|---|
| Project name | `scholnexa` (URL `https://scholnexa.vercel.app`) |
| Framework preset | **Vite** |
| Root directory | `frontend` |
| Build command | `npm run build` (from `frontend/vercel.json`) |
| Output directory | `dist` |
| Install command | `npm ci` |
| Node version | 22.x |

`frontend/vercel.json` contains the SPA fallback rewrite so deep links like
`/dashboard` serve `index.html`:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### C.2 Project 2 — Backend

| Setting | Value |
|---|---|
| Project name | `scholnexa-api` (URL `https://scholnexa-api.vercel.app`) |
| Framework preset | **Other** |
| Root directory | `backend` |
| Build command | *(none set — Vercel auto-runs `npm run vercel-build`, which takes precedence over `build`)* |
| Install command | `npm ci` |
| Node version | 22.x |

`backend/vercel.json` pins the "Other" preset (`"framework": null`), which
**disables the fastify auto-detection** and lets Vercel discover the `api/`
functions. Note that `buildCommand` must **not** be set: on a framework-null
project Vercel treats an explicit build command as a static-site build and
fails with *"No Output Directory named public"*. `vercel-build` is still
picked up automatically from `package.json`:

```json
{
  "framework": null,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/[...path].js" }
  ],
  "functions": {
    "api/[...path].js": { "maxDuration": 60, "memory": 1024 },
    "api/health.ts": { "maxDuration": 10 }
  }
}
```

The `backend/public/` directory (a small landing page + `robots.txt`) exists
to satisfy Vercel's static-output check for framework-null projects — the
`api/` functions deploy alongside it.

> **Why the `rewrites` entry is required:** Vercel CLI 58.x generates routing
> for classic `api/[...path].js` catch-alls that only forwards **single-
> segment** `/api/*` paths to the function; multi-segment paths like
> `/api/auth/login` are 404'd at the routing layer (the browser then reports
> a misleading CORS error, since the 404 carries no CORS headers). The
> explicit rewrite forces every `/api/*` path to the catch-all. Verified with
> `vercel build` locally (the generated route is `^/api(?:/(.*))$` →
> `/api/[...path].js`).

Routing: every request to `https://scholnexa-api.vercel.app/*` hits the
catch-all function, which drives the full Fastify router
(`/api/auth/login`, `/api/etudiants`, `/health`, …). `api/health.ts`
additionally serves `/health` directly.

### C.3 Environment variables

Import the same `.env.production` file into **both** projects:

- **Frontend project** reads the `VITE_*` variables. `VITE_API_URL` must be the
  **absolute backend URL** (`https://scholnexa-api.vercel.app/api`) — it is
  baked at build time, so change + redeploy the frontend if the backend URL
  differs.
- **Backend project** reads everything else (Supabase, JWT, SMTP, CORS, AI).

`CORS_ORIGIN` on the backend must include the frontend origin:
`https://scholnexa.vercel.app,https://scholnexa-*.vercel.app`. The `-*.vercel.app`
wildcard covers preview deployments (`*` entries are compiled to RegExp in
`backend/src/app.ts`).

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
