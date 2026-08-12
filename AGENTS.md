# CI/CD Auto-Deploy Setup

This project ships a GitHub Actions pipeline (`.github/workflows/ci-cd.yml`)
that builds both applications, pushes the three Docker images to GHCR and
deploys the stack to a VPS over SSH.

## GitHub Secrets Required

Add these in **Settings → Secrets and variables → Actions → Secrets**:

| Secret | Description |
|--------|-------------|
| `VPS_HOST` | VPS IP address |
| `VPS_USERNAME` | SSH user (e.g. `scholnexa`) |
| `VPS_SSH_KEY` | Private SSH key for CI to SSH into the VPS (see below) |
| `ENV_PRODUCTION` | Full contents of `.env.production` file (base64-encoded or as-is) |
| `GHCR_PAT` | GitHub PAT with `read:packages` scope so the VPS can pull images |

## GitHub Variables

Add these in **Settings → Secrets and variables → Actions → Variables**:

| Variable | Default | Description |
|----------|---------|-------------|
| `DOMAIN` | `scholnexa.example.com` | Production domain (frontend + API) |
| `IMAGE_NAMESPACE` | `scholnexa` | GitHub owner/org that owns the GHCR packages |
| `GHCR_USERNAME` | `scholnexa` | GitHub username used to log into GHCR |

## SSH Key for GitHub Actions

Generate a deploy key on the VPS:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github-actions -N ""
cat ~/.ssh/github-actions.pub >> ~/.ssh/authorized_keys
```

Then paste the *private* key (`cat ~/.ssh/github-actions`, including the
`-----BEGIN ... PRIVATE KEY-----` delimiters) as the `VPS_SSH_KEY` secret.

## GHCR Access for VPS

Create a GitHub Personal Access Token (Settings → Developer settings →
Personal access tokens → Fine-grained tokens) with:
- **Repository access:** the repositories holding the images
- **Permissions:** `Contents: read`, `Packages: read`

Add this token as the `GHCR_PAT` secret, then test it on the VPS:

```bash
echo "YOUR_PAT" | docker login ghcr.io -u scholnexa --password-stdin
```

## How CI/CD Works

On every push/PR to `main` or `develop`:
1. **Backend CI** — `npm ci` → lint → test → build
2. **Frontend CI** — `npm ci` → lint → build (with `VITE_API_URL`)

On push to `main` only (after CI passes):
3. **Docker Build** — build & push 3 images to GHCR:
   - `ghcr.io/<namespace>/school-crm-api`
   - `ghcr.io/<namespace>/school-crm-frontend`
   - `ghcr.io/<namespace>/school-crm-backup`
4. **Deploy** — SSH into the VPS → pull images → `docker stack deploy` → run migrations

## Vercel Deployments

The frontend and backend can each be deployed to Vercel as separate projects:

| Project | Root directory | Build command |
|---|---|---|
| Frontend | `frontend` | `npm run build` (Vite, output `dist`) |
| Backend (optional) | `backend` | `npm run vercel-build` (bundles the Fastify app into `api/[...path].js`) |

When the backend runs on Vercel, the BullMQ worker (`npm run worker`), the
PostgreSQL, Redis, and MinIO services must remain on the VPS (or be managed
services) — serverless functions cannot host persistent processes. See
`README-DEPLOY.md` § A.5 for the full split and limits.

## Reverse Proxy (host nginx)

A host-level nginx reverse proxy (or any preferred proxy) serves the domain:

- `/api/*` + `/health` → `localhost:3004` (backend Fastify)
- `/` → `localhost:3003` (frontend nginx)

SSL certificates are managed by certbot with auto-renewal.

## Local Deployment

```bash
# On the VPS:
cd /opt/scholnexa
./deploy.sh
```

## Architecture

```
User → https://DOMAIN
  ↓
nginx (port 80/443, TLS termination)
  ├── /api/* → localhost:3004 → Backend Fastify (Docker Swarm)
  ├── /health → localhost:3004 → Backend health check
  └── / → localhost:3003 → Frontend nginx (Docker Swarm)
```
