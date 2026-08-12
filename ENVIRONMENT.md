# Environment Variables

Reference for every environment variable used by Scholnexa. Example files:

| File | Used for |
|---|---|
| `backend/.env.example` | Backend local development (`cp .env.example .env`) |
| `frontend/.env.example` | Frontend local development (`cp .env.example .env`) |
| `.env.production.example` | VPS production stack (`cp .env.production.example .env.production`) |

> **Never commit** `.env`, `.env.production` or any file containing real
> secrets. All secret values must be supplied through the deployment platform
> (GitHub secrets, Vercel env, VPS `.env.production`).

---

## Backend (`backend/.env` or process environment)

### Core

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `3000` | HTTP port |
| `HOST` | `0.0.0.0` | Bind address |
| `LOG_LEVEL` | `info` | Pino log level |

### Database (Supabase PostgreSQL)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:postgres@localhost:5432/school_crm` | Supabase PostgreSQL connection string. Use the **transaction pooler** for the API (`postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres`) and the **session pooler** (`:5432`, same host) for migrations. **Password must be percent-encoded** — e.g. `y.brox95@gmail.com` becomes `y.brox95%40gmail.com` — or the `@` is parsed as the host separator. SSL is enabled automatically for `*.supabase.com` hosts. New Supabase projects expose the `db.<ref>.supabase.co` direct host on IPv6 only; use the pooler host for IPv4 reachability. |

### Authentication

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `change-me-in-production` | **Must be overridden in production** (`openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime (e.g. `24h`, `7d`) |

### Redis (cache + BullMQ)

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | `redis://localhost:6379` | Redis connection string |

### Supabase Storage (exam documents)

| Variable | Default | Description |
|---|---|---|
| `SUPABASE_URL` | `http://localhost:54321` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | *(empty)* | **Required in production** — document storage fails without it |
| `SUPABASE_STORAGE_BUCKET` | `examens` | Storage bucket (created automatically on startup) |

### Email (SMTP)

| Variable | Default | Description |
|---|---|---|
| `SMTP_HOST` | *(empty)* | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | *(empty)* | SMTP username |
| `SMTP_PASS` | *(empty)* | SMTP password |
| `FROM_EMAIL` | `noreply@scholnexa.com` | Sender address |
| `ADMIN_EMAIL` | `admin@scholnexa.com` | Admin contact address |

### CORS

| Variable | Default | Description |
|---|---|---|
| `CORS_ORIGIN` | `http://localhost:5173` | Comma-separated allowed origins |

### Admin API

| Variable | Default | Description |
|---|---|---|
| `ADMIN_API_KEY` | `change-me-to-a-random-secret` | **Must be overridden in production** (`openssl rand -base64 32`) |

### Integrations (optional)

| Variable | Default | Description |
|---|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | *(empty)* | WhatsApp Cloud API |
| `WHATSAPP_ACCESS_TOKEN` | *(empty)* | WhatsApp Cloud API |
| `WHATSAPP_API_VERSION` | `v22.0` | WhatsApp API version |
| `N8N_WEBHOOK_URL` | *(empty)* | n8n automation webhook |
| `N8N_WEBHOOK_SECRET` | *(empty)* | n8n webhook secret |

### AI assistant (optional)

| Variable | Default | Description |
|---|---|---|
| `AI_API_KEY` | *(empty)* | OpenAI-compatible API key (e.g. NVIDIA NIM) |
| `AI_BASE_URL` | `https://integrate.api.nvidia.com/v1` | API base URL |
| `AI_MODEL` | `meta/llama-3.1-8b-instruct` | Model name |

### Vercel serverless deployment

When the backend runs on Vercel as a standalone project (root `backend/`,
configured by `backend/vercel.json`, functions in `backend/api/`), the same
variables above apply, with these platform-specific notes:

| Variable | Notes |
|---|---|
| `NODE_ENV` | set automatically to `production` by Vercel |
| `VERCEL` | set automatically to `1`; enables serverless-safe behavior (1-connection DB pool, no pino-pretty transport) |
| `JWT_SECRET`, `ADMIN_API_KEY` | **mandatory** — the app refuses to start in production with the default placeholder values |
| `DATABASE_URL` | must reach an externally accessible Postgres (Supabase pooler recommended) |
| `CORS_ORIGIN` | include every frontend origin that will call the API; in the two-project Vercel setup (Mode C) the frontend calls the backend across origins, so this must contain the frontend project URL plus a `-*.vercel.app` preview wildcard |

See `README-DEPLOY.md` → *Mode C — Everything on Vercel (two projects)* and
*A.5 Backend on Vercel too* for the full architecture, function limits, and
what must remain on an always-on host (Postgres, Redis, the BullMQ worker,
object storage).

---

## Frontend (`frontend/.env`, Vercel, Netlify)

All frontend variables must be prefixed with `VITE_` to be exposed to the
browser bundle.

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3000/api` | Backend API base URL. **Baked at build time** — set it on the hosting platform and redeploy after changing it. On Vercel use the absolute URL of the backend project, e.g. `https://<backend>.vercel.app/api`. |
| `VITE_ADMIN_EMAIL` | `admin@scholnexa.com` | Contact email shown in the admin/support UI |
| `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON` | *(empty)* | Supabase project URL + anon key. **Optional** — the app logs in with its own JWT against the backend; these are only needed if you later add direct Supabase client calls. |

---

## VPS production stack (`.env.production`)

Used by `deploy.sh` / `docker-compose.production.yml`. See
`.env.production.example` for the complete annotated list.

| Variable | Required | Description |
|---|---|---|
| `DOMAIN` | ✅ | Production domain (frontend + API) |
| `DB_PASSWORD` | ✅ | PostgreSQL password |
| `REDIS_PASSWORD` | ✅ | Redis password |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | ✅ | MinIO credentials |
| `JWT_SECRET` | ✅ | JWT signing key |
| `ADMIN_API_KEY` | ✅ | Admin API key |
| `GRAFANA_PASSWORD` | | Grafana admin password (defaults to `admin`) |
| `ACME_EMAIL` | | Let's Encrypt notifications |
| `SMTP_*`, `FROM_EMAIL`, `ADMIN_EMAIL` | | Email delivery |
| `WHATSAPP_*`, `N8N_*`, `AI_*` | | Optional integrations |
| `REGISTRY` | | Container registry namespace override (default `ghcr.io/scholnexa`) |

---

## CI/CD (GitHub Actions)

See `AGENTS.md` for the full list of secrets (`VPS_HOST`, `VPS_USERNAME`,
`VPS_SSH_KEY`, `ENV_PRODUCTION`, `GHCR_PAT`) and variables (`DOMAIN`,
`IMAGE_NAMESPACE`, `GHCR_USERNAME`).
