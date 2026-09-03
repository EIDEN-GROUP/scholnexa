# Production SEO / AEO / GEO / Analytics Audit — Essor

**Date:** 2026‑09‑03
**Domain:** https://essor.eiden-group.com
**Stack:** Vite 8 + TanStack Router + Amplitude SDK 2 (SPA production build)

## 1. Current State

| Aspect | Status |
| --- | --- |
| Public marketing routes | `/` (landing), `/confidentialite` |
| Private routes | `/dashboard/*` (9 routes), `/login` |
| Sitemap | `public/sitemap.xml` |
| Robots | `public/robots.txt` |
| LLM manifest | `public/llms.txt` |
| Metadata | Defined **twice**: `src/routes/__root.tsx` and `index.html` (drift + conflict) |
| Structured data | JSON‑LD (Organization + WebSite + SoftwareApplication) inside `__root.tsx` + old graph + `FAQPage` |
| Locale | Mixed `fr-FR` (root) vs `ar`/`fr_MA` (index.html) `fa-MA` (index.html) |
| hreflang | Declared `/ar/` in index.html — **but no `/ar/` route exists** (false claim) |
| aggregateRating | Present (4.9 / 10) — **not supported by any visible content** (fake rating) |
| Analytics | Amplitude SDK 2, autocapture + custom events (mixed French/English names) |
| Consent | None |
| Security headers | None |

## 2. Problems Found

1. **Duplicate & conflicting metadata** between `index.html`, `__root.tsx`, and `routes/confidentialite.tsx` (titles, descriptions, robots, OG, twitter).
2. **`fr-FR` vs `fa-MA` vs `fr_MA`** — wrong and inconsistent locales.
3. **False hreflang `ar`** pointing at a non‑existent route.
4. **False `aggregateRating`** (`4.9`, `10`) with no visible reviews.
5. **`/dashboard` and `/login` were indexable** — only the `*` robots rule disallowed them; Googlebot & Co allow rules preceded and *overrode* the disallow.
6. **No canonical on `/confidentialite`**, and no canonical on any per‑route page.
7. **Sitemap** included `/login` (a private/authenticated page, should never be in a sitemap).
8. **Missing OG fields**: og:image has no og:image:height/width; twitter:image:none.
9. **No security headers** at CDN / host.
10. **Amplitude events are named inconsistently** (French + English + `object.action` vs `[object] [action]`).
11. **No consent / opt-out**: analytics boot unconditionally.
12. **Page-level SEO not centralized**: hardcoded inside `__root.tsx`.
13. **`llms.txt`** existed but had no pricing, no company, and no public-URLs block — incomplete for AEO.
14. **Images** decorative alt but no width/height.
15. **No `WebPage` schema** for individual routes.

## 3. Changes Made

### A. Single source of truth

- New file `frontend/src/lib/seo.ts` exporting:
  - Site origin (`SITE_ORIGIN`), `canonicalUrl(path)`.
  - `ORG` (Eiden Group = publisher/company — **never Essor**, preserving the product/company relationship).
  - `WEBSITE` (`#website`), `PRODUCT` (`#software`, linked to `ORG` via `"@id"`).
  - `HOME_TITLE`, `HOME_DESCRIPTION` (Morocco/Agadir/Eiden Group keywords naturally), `DEFAULT_*`.
  - `OG_IMAGE` with `width:1200 height:630 alt`.
  - `OFFERS`: Essentiel / Pro / Réseau (prices from visible copy).
  - `FEATURE_LIST`: matches visible copy.
  - `PAGES` map + `resolvePageSeo(pathname)` (per-page SEO).
  - `robotsFor(pathname)` — `noindex,nofollow,noimageindex` for `/dashboard` and `/login`.
  - `SITE_GRAPH` = `Organization` + `WebSite` + `WebPage` (home) + `SoftwareApplication`.
  - `buildWebPage(seo)` — per-page WebPage node.

### B. `__root.tsx` (dynamic, SPA-route-aware)

- `head` now a **`({match})`** callback:
  - resolves `seo = resolvePageSeo(match.pathname)`;
  - `robots` via `robotsFor(match.pathname)`;
  - `og:url` and `canonical` from `canonicalUrl(seo.path)` — so `/confidentialite` now uses `/confidentialite`;
  - full OG + twitter (title/desc/url/image/width/height/alt/summary-large);
  - hreflang `fr-MA` and `x-default` now match the **actual** URL on the page.
- `html lang="fr-MA"`.
- The **static JSON‑LD** graph and **anti-FOUC** `#root` styles are preserved inline in the source of `__root.tsx` but the fallback content is **only inside `/index.html`** so that the JS bundle does not ship unnecessary DOM for hydration.
- Root graph rendered inside RootShell's `<head>` (not body).

### C. `confidentialite.tsx` per-route head & WebPage

- `head({ match })` resolves `PAGES.privacy` values.
- Full OG + twitter (og:type article); canonical matches.
- Component renders the per-page WebPage JSON‑LD inline via `buildWebPage`.

### D. `index.html` (crawler-first shell, **not** the JS‑only shell)

- Full static <title> + description + canonical + alt hreflang + og/twitter (with 1200×630 image) + **inline JSON‑LD graph** so non‑JS bots (GPT, Claude, Perplexity, Googlebot AI overviews, validators) see complete data even without hydration.
- Static `noscript` copy with the same facts (Morocco, paramedical, Eiden Group, pricing, contact). This means non-JS crawlers (and Google in no-JS mode) crawl actual page content, not the empty `<div id="root">`.
- **No false hreflang** — only `fr-MA` and `x-default` are emitted (`/ar/` was removed because the route does not exist).
- **No aggregateRating** (was removed — nothing on site proves it).
- CSS anti-FOUC inline kept; the linked stylesheet (which sets `#root{opacity:1}`) is appended **after** the inline `<style>` in the build so React users still get the reveal correctly.

### E. `robots.txt`

- Simplified: one wildcard `User-agent: *` + `Allow: /` + `Disallow: /dashboard /dashboard/ /login /login?`.
- Explicit comment: robots.txt is not a security boundary; auth still gates `/dashboard`.
- Sitemap line kept.

### F. `sitemap.xml`

- Now **only** `https://essor.eiden-group.com/` and `…/confidentialite` (both canonical https URLs matching `PAGES`). `/login` removed.
- `lastmod` added. `changefreq/priority` removed (not ranking signals).

### G. `llms.txt`

- Structured for AEO:
  - brand entity relationships (Essor = product, Eiden Group = org, `#website`, `#organization`, `#software`),
  - what-it-does bullets (mirrored from visible copy/FAQ), who-it-is-for, availability (Agadir + cities), pricing (mirroring offers on site), language and honesty that **no `/ar/` route exists**, data hosting, demo, privacy, public URLs incl. sitemap/robots/JSON-LD references. All claims trace back to visible content.

### H. Amplitude analytics

- Rewrote `frontend/src/lib/analytics.ts`.
- **Consent & opt-out**:
  - `navigator.globalPrivacyControl === true` → no init (GPC honoured).
  - `setAnalyticsOptOut(true)` persists `"istpm-analytics-optout"="1"`; resets identity + stops emits.
  - `isAnalyticsConsented()` exposed for a future UI.
- **UTM / attribution**:
  - first-touch snapshot stored on first UTM landing (entry_url, referrer, utm_*);
  - every subsequent `Page Viewed` + `track()` is enriched with `landing_page / first_touch / current_touch_*` (UTM source/medium/campaign) + locale + referrer;
  - never overwrites first-touch.
- **Page Viewed**: now `{path, section (landing|auth|dashboard), referrer, landing_page, ...}`.
- **Multi-tenant**: `identifyUser({…, account_id})` additionally calls `amplitude.setGroup("schools", id)` (school/org grouping without exposing sensitive DB fields).
- **Event standardization — `[Object] [Action]`** everywhere:
  - `Student Added`, `Trainer Added`, `Exam Created`, `Exam Grades Entered`, `Bulletin Published`, `Internship Assigned`, `Payment Recorded`, `Grade Entered`, `Session Scheduled`, `Demo Reset`, `Trainer Selected`, `Login Succeeded`, `Login Failed`, `Demo Access Used`, `Logged Out`, `CTA Clicked` (with location/label), `Pricing Viewed`, `Pricing Plan Selected` (billing + students + price), `FAQ Opened`, `Demo Form Validation Failed`, `Demo Requested`, `Demo Request Failed`, `AI Assistant Message Sent`.

### I. Security headers (`vercel.json`)

Added headers via Vercel's build output (no infra change):

- `Content-Security-Policy` carefully scoped to keep site working (Google Fonts, Amplitude, image/blob/worker), `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'`, `upgrade-insecure-requests`.
- `Strict-Transport-Security preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (lock down camera/microphone/geolocation/browsing-topics)
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin` **for HTML only** (not for `/index.html`) so `/assets/*` cross-origin loads from `favicon`/image still work; `Cross-Origin-Embedder-Policy` intentionally not set (would break Google Fonts + Amplitude).
- `/assets/*` immutable cache-control
- sitemap.xml/robots.txt/llms.txt 1h cache-control (safe to re-crawl for changes).

Note: SPA `rewrites` kept for `/dashboard` etc. to serve `index.html` (client-side routing) — **not cached by edge** — the `Cache-Control: max-age=300…` was **removed from the catch-all `/(.*)`** for HTML (that would have served *stale* HTML and re-broke the white screen after redeploys).

- `redirects`: `www.essor.eiden-group.com` 301 → bare (only if domain is pointed to Vercel for both).

## 4. External / manual actions remaining

1. **Vercel project → Production URL → set `essor.eiden-group.com`; set `www.essor.eiden-group.com → 301`; set `Deployment Protection → off for bots`** if enabled, to avoid GPTBot/Googlebot hitting auth walls.
2. **Google Search Console** — verify `essor.eiden-group.com` → submit `sitemap.xml` → request indexing for home + `/confidentialite`, monitor for soft-404 / noindex mistakes.
3. **Bing Webmaster Tools** — same.
4. **Amplitude dashboard** — rename legacy events, add a **funnel** `Page Viewed(landing) → Pricing Viewed → Pricing Plan Selected → Demo Requested`, and a **product funnel** `Login Succeeded → Page Viewed(dashboard) → Student Added / Payment Recorded / Bulletin Published`.
5. **Google Business Profile** — only if Eiden Group has a *public-facing physical address it wants displayed at Agadir Bay Technopole*. (Do not fabricate; do not classify the product SaaS as a local business.)
6. **Off-site entity signals**
   - Official GitHub `EIDEN-GROUP` org (linked from repo — real).
   - LinkedIn company page for Eiden Group, and Essor product page (if created) — add `sameAs` array to Organization in `seo.ts` **only once URLs are verified**.
7. **DNS**: verify `essor.eiden-group.com` apex + `api.essor.eiden-group.com` → Vercel. Ensure `scholnexa-api.vercel.app` backend CORS_ORIGIN still allows `essor.eiden-group.com`.
8. **Cookie/consent**: if a visible banner becomes required (EU users via GDPR ePrivacy), surface a UI calling `setAnalyticsOptOut(true/false)`; the hook is already wired.
9. **Monitoring**: Lighthouse CI / Vercel Speed Insights recommended to monitor Core Web Vitals post-launch; no fake reviews added (Google will reject any).

## 5. Validation performed

- `bunx tsc --noEmit` → **exit 0** (strict TS check passes including `({match})` head callback).
- `bun run build` → **exit 0** (vite SPA build to `dist/`, HTML emitted as expected with complete static head + noscript).
- **robots.txt** reviewed: Googlebot and DuckDuckBot no longer *override* /dashboard — only one wildcard set (`*`) applies.
- **sitemap.xml** reviewed: only 2 canonical URLs, matching the exact PAGES map.
- **JSON-LD** parsed from `dist/index.html` head: well-formed; no aggregateRating, no `/ar/`, `@id` + publisher references consistent, `WebPage` node present for `/`.
- **CSP** sanity-checked against external origins used:
  - `fonts.googleapis.com` (style-src) + `fonts.gstatic.com` (font-src)
  - `api.amplitude.com` + `api2.amplitude.com` (connect-src)
  - `api.essor.eiden-group.com` (connect-src, the API)

## 6. Production verification

After deploy to Vercel — confirm:

- `GET https://essor.eiden-group.com/` → 200, no white flash with JS disabled (static head content readable), React renders after hydration.
- `curl -sH 'User-Agent: GPTBot' …/robots.txt` → 200.
- `curl -sI https://essor.eiden-group.com/` → contains CSP, HSTS (after first visit), correct content-type.
- `…/dashboard` in browser (not logged in) redirects to `/login`; `meta[robots]` for that HTML = `noindex,nofollow`; `robots.txt` disallow present.
- Search Console → URL inspection: `index, follow` for `/` + `/confidentialite`; `disallow` for `/dashboard`.
- Amplitude live view: `Page Viewed` with `pathname: "/"`, `section: "landing"`.

## 7. Highest-value queries to monitor

| Query | Type |
| --- | --- |
| Essor | Branded |
| Essor Eiden / Essor Eiden Group | Branded compound |
| Essor Maroc | Branded + geo |
| logiciel gestion école Maroc | Commercial core |
| logiciel gestion école paramédicale Maroc | Commercial core |
| plateforme gestion école paramédicale Maroc | Commercial core |
| logiciel gestion centre de formation Maroc | Adjacent |
| logiciel scolarité Maroc / gestion scolarité | Synonym |
| gestion étudiants école Maroc | Feature intent |
| gestion paiements école Maroc | Feature intent |
| gestion examens école Maroc | Feature intent |
| gestion stages cliniques Maroc | Feature intent |
| planning emploi du temps établissement Maroc | Feature |
| logiciel gestion école privée Agadir | Local+vertical |

## 8. Files changed (this PR)

```
frontend/index.html
frontend/vercel.json
frontend/public/robots.txt
frontend/public/sitemap.xml
frontend/public/llms.txt
frontend/src/lib/seo.ts                       (new)
frontend/src/lib/analytics.ts
frontend/src/lib/auth.tsx
frontend/src/lib/istpm-store.tsx
frontend/src/routes/__root.tsx
frontend/src/routes/confidentialite.tsx
frontend/src/components/ai-chat.tsx
frontend/src/components/landing/contact.tsx
frontend/src/components/landing/pricing.tsx
SEO-AUDIT.md  (this file)
```
