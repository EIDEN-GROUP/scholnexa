# SEO & Performance Audit: Essor

## Current State Analysis
- **Framework:** Vite + TanStack Router (SPA-build mode)
- **Deployment:** Vercel (Production) / Docker Swarm (VPS)
- **Metadata Management:** Dispersed across `index.html` and `__root.tsx`.
- **Analytics:** Amplitude (Browser SDK 2)

## 1. Audit Checklist & Findings

| Category | Status | Notes |
| :--- | :--- | :--- |
| Metadata Integrity | Pending | Inspecting duplication in `index.html` vs `__root.tsx`. |
| Structured Data (JSON-LD) | Pending | Auditing `aggregateRating` and Organization schema validity. |
| Sitemap/Robots | Pending | Verifying content against public routes. |
| Amplitude Events | Pending | Auditing current event tracking and funnel coverage. |
| Performance (CWV) | Pending | Checking hero loading and script impact. |
| Security Headers | Pending | Reviewing existing `vercel.json` / nginx headers. |

## 2. Identified Issues
*(To be populated during audit)*

## 3. Implementation Plan
*(To be populated)*

## 4. Production Verification
*(To be populated)*
