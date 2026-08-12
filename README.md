# Scholnexa — School Management System

**Scholnexa** is a production-grade, white-label school management platform:
students, teachers, groups, exams, grade reports (bulletins), monthly payments,
internships (stages), planning and documents — in one application.

It ships as a reusable **demo / white-label product**: the identity (name,
logo, colours, contact details) is centralized in `frontend/src/lib/brand.ts`
and `frontend/public/` so any school can rebrand it in minutes (see
[WHITELABEL.md](./WHITELABEL.md)).

> This project was white-labeled from a single-institute system into a generic,
> reusable platform. No institute-specific identity remains in the codebase.

## Architecture

```
                    ┌──────────────┐
                    │  Vercel /    │
                    │  Netlify /   │
                    │  nginx (SPA) │
                    └──────┬───────┘
                           │ HTTPS
                    ┌──────▼───────┐       ┌───────────┐
                    │  nginx /     │───────│  MinIO    │
                    │  reverse     │       │  (S3)     │
                    │  proxy       │       └───────────┘
                    └──────┬───────┘
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
   │  Fastify    │  │  BullMQ     │  │  Grafana +  │
   │  API        │  │  Worker     │  │  Loki +     │
   │  (Docker)   │  │  (Docker)   │  │  Prometheus │
   └──────┬──────┘  └──────┬──────┘  └─────────────┘
          │                │
   ┌──────▼──────┐  ┌──────▼──────┐
   │ PostgreSQL  │  │  Redis      │
   └─────────────┘  └─────────────┘
```

## Tech stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, TanStack Router v1, TanStack Query, Tailwind v4, shadcn/ui, Framer Motion, Recharts |
| **Backend** | Fastify 5, TypeScript, Drizzle ORM, Zod validation |
| **Database** | PostgreSQL 16 (self-hosted) |
| **Cache / Queue** | Redis 7 + BullMQ |
| **Storage** | MinIO (S3-compatible) |
| **Auth** | Self-managed JWT + bcrypt |
| **Deployment** | Docker Compose (dev) / Docker Swarm (prod) · Vercel (frontend) |

## Features

- **Students** — full CRUD, import/export CSV, search/filter, statuses, risk flags
- **Teachers (formateurs)** — profiles, grades, archives, group assignment
- **Academic organisation** — filières, semesters, groups/classes, modules, rooms, time slots
- **Exams & grade reports** — exam types, note entry, bulletins with mentions and decisions, publishing
- **Payments** — monthly tuition tracking, receipts (stamped PDFs), recovery rates
- **Internships (stages)** — partner structures, conventions and reports (stamped PDFs), validation
- **Planning & calendar** — sessions, holidays, vacations, teacher availability
- **Dashboard** — KPIs, charts, risk lists, action items
- **AI assistant** — natural-language queries over the platform data
- **Admin API** — `/api/admin/*` for multi-product integrations (X-API-Key protected)
- **WhatsApp / email / n8n integrations**, notifications, reminders, support
- **i18n** — French & Arabic UI

## Repository layout

```
├── frontend/          # Vite + React SPA (Vercel/Netlify-ready)
├── backend/           # Fastify API + BullMQ worker + Drizzle schema/migrations
├── docker/            # Backup service image
├── monitoring/        # Prometheus / Loki / Promtail configs
├── .github/workflows/ # CI/CD (build, push images, deploy to VPS)
├── deploy.sh          # VPS Docker Swarm deploy script
└── docker-compose*.yml
```

## Local development

### 1. Infrastructure (PostgreSQL + Redis + MinIO)

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env
npm ci
npm run dev            # → http://localhost:3000 (health: /health)
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev            # → http://localhost:5173
```

### 4. Demo data

```bash
cd backend
npm run db:migrate
npm run seed           # creates demo users + sample records
```

Demo accounts (see `backend/scripts/seed-demo.ts`):

| Role | Email | Password |
|---|---|---|
| Directeur | `direction@demo.scholnexa.ma` | `directeur123` |
| Enseignant | `enseignant@demo.scholnexa.ma` | `enseignant123` |
| Responsable | `responsable@demo.scholnexa.ma` | `responsable123` |

## Environment variables

See [ENVIRONMENT.md](./ENVIRONMENT.md) for the complete reference, and the
`.env.example` files:

- `backend/.env.example` — backend (local)
- `frontend/.env.example` — frontend (local)
- `.env.production.example` — VPS production stack

Key variables:

| Variable | Where | Purpose |
|---|---|---|
| `VITE_API_URL` | frontend | Backend API base URL (`https://api.example.com/api`) |
| `DATABASE_URL` | backend | PostgreSQL connection string |
| `REDIS_URL` | backend | Redis connection string |
| `JWT_SECRET` | backend | JWT signing key (mandatory override in prod) |
| `ADMIN_API_KEY` | backend | Admin API key (mandatory override in prod) |
| `CORS_ORIGIN` | backend | Comma-separated allowed frontend origins |
| `DOMAIN` | VPS/CI | Production domain |

## Deployment

Two supported modes (details in [README-DEPLOY.md](./README-DEPLOY.md)):

### Mode A — Vercel frontend + VPS backend (recommended)

1. Deploy `frontend/` to Vercel (framework preset: Vite, output `dist`, SPA rewrites included in `vercel.json`).
2. Set `VITE_API_URL=https://api.yourdomain.com/api` on Vercel.
3. Deploy the backend stack to a VPS (`./deploy.sh`).
4. Point the backend's `CORS_ORIGIN` at the Vercel domain.

### Mode B — Full VPS (frontend + backend in Docker Swarm)

```bash
cp .env.production.example .env.production   # fill in values
./deploy.sh                                   # builds/pulls images, deploys stack, migrates DB
```

Both modes keep the persistent infrastructure (PostgreSQL, Redis, BullMQ
worker, MinIO, backups) on the VPS — the backend is **not** serverless and
should not be deployed to function-as-a-service runtimes.

## Documentation

| File | Contents |
|---|---|
| `README-DEPLOY.md` | Full deployment guide (Vercel + VPS, HTTPS, updates, rollback, troubleshooting) |
| `ENVIRONMENT.md` | Environment variable reference |
| `WHITELABEL.md` | Rebranding guide (name, logo, colours, contact, demo data) |
| `backend/STRUCTURE.md` | Backend file-by-file breakdown |
| `frontend/STRUCTURE.md` | Frontend file-by-file breakdown |
| `AGENTS.md` | CI/CD secrets & variables setup |
