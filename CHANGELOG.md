# Changelog

## 2026-08 | White-label release (Scholnexa)

The project was white-labeled into a generic, reusable school management
platform. No institute-specific identity remains in the codebase.

**Branding**
- New product name **Scholnexa** with a central brand configuration
  (`frontend/src/lib/brand.ts`), new logo and favicon
  (`frontend/public/scholnexa-logo*.png`), and a royal-blue palette
  (`frontend/src/styles.css`).
- All user-visible identity (titles, login, loading screen, settings
  defaults, locales FR/AR, PDFs, emails, footers) rebranded.
- Demo data (students, teachers, receipts, structures) rewritten with clearly
  fictional records (`@demo.scholnexa.ma`, `SCHX-` prefixes).
- Exam-subject PDFs: metadata rewritten (author/title/creator = Scholnexa).

**Identifiers & API**
- `istpm-data/api/store` modules renamed to `scholnexa-*`; CSS variables
  `--istpm-*` → `--scholnexa-*`; localStorage keys namespaced under
  `scholnexa-*`.
- API paths neutralized: `/api/paiements-istpm` → `/api/monthly-payments`,
  `/api/dashboard/istpm-*` → `/api/dashboard/*` (backend, frontend and AI
  agent actions updated together | no behavior change).

**Deployment**
- Docker registry/namespace/domain parameterized (`REGISTRY`,
  `IMAGE_NAMESPACE`, `DOMAIN`) across `ci-cd.yml`, `deploy.sh`,
  `docker-compose.production.yml`.
- `.env.example`, `backend/.env.example`, `frontend/.env.example` and
  `.env.production.example` added/refreshed.
- Docs rewritten: README, deployment guide, environment reference,
  white-label guide, CI/CD setup.

## Earlier history

Detailed per-feature change history is available in the git history
(`git log`). The frontend evolved through several iterations (local-first
demo store with optimistic API sync, branded PDF generation, monthly payment
system, stamp tooling) before this white-label release.

## Unreleased

- Replaced the placeholder Scholnexa logos with the official client assets
  (optimized PNGs in `frontend/public/`, sources kept in `assets/`):
  dark mark for the sidebar/splash/favicon/PDFs, white lockup for the login
  page. The PDF/email letterhead now rasterizes the mark PNG directly.
