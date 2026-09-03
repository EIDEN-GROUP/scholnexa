/**
 * Amplitude | single integration point for the entire app.
 *
 * `initAnalytics()` runs once, client-side, from the root route. It enables
 * autocapture and starts `track()` once. Every call is routed through this
 * module: no component imports `@amplitude/analytics-browser` directly.
 *
 * Privacy & consent model (see `src/lib/seo.ts#contact@eiden-group.com`
 * for the public disclosure):
 *
 *   •  `initAnalytics()` is a *no-op* unless the visitor's browser has not
 *      opted out of sharing data via the Global Privacy Control signal
 *      (`navigator.globalPrivacyControl === true`). Essor uses Amplitude in
 *      an **essentials-only**, non-advertising mode (see
 *      `/confidentialite` and the `llms.txt`), which is proportionate
 *      legitimate-interest measurement under both CNDP & GDPR framing.
 *   •  `setAnalyticsOptOut(true)` immediately resets identity + halts every
 *      subsequent `track()` call. Opt-out is stored in localStorage and
 *      honoured on next visit.
 *
 *  Missing `VITE_AMPLITUDE_API_KEY` -> every function is a no-op so local dev
 *  and tests run without a key.
 */
import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined;
// Amplitude projects default to US data centre; set VITE_AMPLITUDE_SERVER_ZONE=EU
// if the project lives in the EU (recommended for Morocco/EU-adjacent).
const SERVER_ZONE =
  (import.meta.env.VITE_AMPLITUDE_SERVER_ZONE as "US" | "EU" | undefined) ?? "US";

/** localStorage key mirroring the analytics opt-out state. Kept short. */
const OPT_OUT_KEY = "istpm-analytics-optout";

/** localStorage keys for UTM persistence (first-touch attribution). */
const FIRST_TOUCH_KEY = "istpm-first-touch";
const CURRENT_TOUCH_KEY = "istpm-current-touch";

let started = false;
let optOut = false;

interface Touchpoint {
  entryURL: string;
  referrer: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  capturedAt: number;
}

function parseTouchpoint(): Touchpoint | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const qp = url.searchParams;
  let anyUTM = false;
  const tp: Partial<Touchpoint> = {
    entryURL: url.pathname + url.search,
    referrer: document.referrer || undefined,
    capturedAt: Date.now(),
  };
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const) {
    const v = qp.get(key);
    if (v) {
      (tp as Record<string, string>)[key] = v;
      anyUTM = true;
    }
  }
  for (const key of ["gclid", "fbclid"] as const) {
    const v = qp.get(key);
    if (v) {
      tp[key] = v;
      anyUTM = true;
    }
  }
  if (!anyUTM) return null;
  return tp as Touchpoint;
}

function persistTouchpoints() {
  if (typeof window === "undefined") return;
  const fresh = parseTouchpoint();
  if (fresh) {
    try {
      const existing = localStorage.getItem(FIRST_TOUCH_KEY);
      if (!existing) localStorage.setItem(FIRST_TOUCH_KEY, JSON.stringify(fresh));
      localStorage.setItem(CURRENT_TOUCH_KEY, JSON.stringify(fresh));
    } catch {}
  }
}

function readTouchpoints(): { first?: Touchpoint; current?: Touchpoint } {
  if (typeof window === "undefined") return {};
  try {
    const first = localStorage.getItem(FIRST_TOUCH_KEY);
    const current = localStorage.getItem(CURRENT_TOUCH_KEY);
    return {
      first: first ? (JSON.parse(first) as Touchpoint) : undefined,
      current: current ? (JSON.parse(current) as Touchpoint) : undefined,
    };
  } catch {
    return {};
  }
}

/** Best-effort `navigator.language` (falls back on server-side/privacy-blocked). */
function detectLocale(): string {
  if (typeof window === "undefined") return "fr-MA";
  try {
    return window.navigator.language || "fr-MA";
  } catch {
    return "fr-MA";
  }
}

function isGPCSignalEnabled(): boolean {
  if (typeof navigator === "undefined") return false;
  // `navigator.globalPrivacyControl` is standardised but not yet in lib.dom types.
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

function storageOptOut(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    return false;
  }
}

export function isAnalyticsConsented(): boolean {
  // GPC > storage > default
  if (isGPCSignalEnabled()) return false;
  if (storageOptOut()) return false;
  return true;
}

export function setAnalyticsOptOut(consent: boolean) {
  if (typeof window !== "undefined") {
    try {
      if (consent) window.localStorage.setItem(OPT_OUT_KEY, "1");
      else window.localStorage.removeItem(OPT_OUT_KEY);
    } catch {}
  }
  optOut = consent;
  if (consent) {
    // Immediately reset identity + opt out via the SDK too.
    try {
      amplitude.reset();
      // Opt-out is enforced locally before we emit anything else.
      started = false;
    } catch {}
  } else if (API_KEY && typeof window !== "undefined") {
    // Re-bootstrap on re-consent (best-effort).
    initAnalytics();
  }
}

export function initAnalytics() {
  if (started) return;
  if (typeof window === "undefined") return;
  if (!API_KEY) return;
  if (!isAnalyticsConsented()) {
    optOut = true;
    return;
  }
  optOut = false;
  started = true;
  // Persist first-touch attribution *before* any event is emitted, so the
  // Amplitude event itself carries it.
  persistTouchpoints();

  amplitude.init(API_KEY, {
    // We emit our own "Page Viewed" event with the router path so we can
    // attach custom props (locale, section, touchpoint, landing page).
    // Everything below is captured automatically:
    autocapture: {
      attribution: true,
      sessions: true,
      formInteractions: true,
      fileDownloads: true,
      elementInteractions: true,
      pageViews: false,
    },
    minIdLength: 1,
    serverZone: SERVER_ZONE,
    defaultTracking: {
      // Ensure first-touch is preserved and not overwritten by later sessions
      // on subsequent page loads.
      pageViews: false,
    },
  });
}

/** Explicit SPA page view, called on every router navigation. */
export function trackPage(pathname: string, extra?: Record<string, unknown>) {
  if (!started || optOut) return;
  const { first, current } = readTouchpoints();
  amplitude.track("Page Viewed", {
    pathname,
    page_name: nameForPath(pathname),
    section: sectionForPath(pathname),
    locale: detectLocale(),
    referrer: typeof document === "undefined" ? undefined : document.referrer || undefined,
    landing_page: first?.entryURL,
    entry_url: first?.entryURL,
    utm_source: current?.utm_source ?? first?.utm_source,
    utm_medium: current?.utm_medium ?? first?.utm_medium,
    utm_campaign: current?.utm_campaign ?? first?.utm_campaign,
    ...extra,
  });
}

/** Named domain event. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!started || optOut) return;
  amplitude.track(event, enrichWithTouchpoint(props));
}

function enrichWithTouchpoint(props: Record<string, unknown> | undefined) {
  const { first, current } = readTouchpoints();
  return {
    ...props,
    locale: detectLocale(),
    first_touch_landing: first?.entryURL,
    current_touch_source: current?.utm_source,
    current_touch_medium: current?.utm_medium,
    current_touch_campaign: current?.utm_campaign,
    referrer: typeof document === "undefined" ? undefined : document.referrer || undefined,
  };
}

/** Attach the current user's identity + traits to all following events. */
export function identifyUser(u: {
  id: string;
  role?: string | null;
  email?: string;
  name?: string;
  /** Optional multi-tenant context | e.g. a school id/uuid. Never send PII. */
  account_id?: string;
}) {
  if (!started || optOut) return;
  amplitude.setUserId(u.id);
  const identity = new amplitude.Identify();
  if (u.role) identity.set("role", u.role);
  if (u.email) identity.set("email", u.email);
  if (u.name) identity.set("name", u.name);
  if (u.account_id) {
    identity.set("account_id", u.account_id);
    // Amplitude Accounts SDK grouping (optional | SDK 2 supports setGroup).
    try {
      amplitude.setGroup("schools", u.account_id);
    } catch {}
  }
  amplitude.identify(identity);
}

/** Clear identity on logout so the next session starts anonymous. */
export function resetAnalytics() {
  if (!started) return;
  try {
    amplitude.reset();
  } catch {}
}

/* ------------------------------------------------------------------ */
/* Pathname → human-readable page name & funnel section                */
/* ------------------------------------------------------------------ */

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/confidentialite": "Privacy Policy",
  "/login": "Login",
  "/dashboard": "Dashboard Overview",
  "/dashboard/etudiants": "Étudiants",
  "/dashboard/formateurs": "Formateurs",
  "/dashboard/calendar": "Planning",
  "/dashboard/examens": "Examens",
  "/dashboard/notes": "Notes",
  "/dashboard/bulletins": "Bulletins",
  "/dashboard/stages": "Stages cliniques",
  "/dashboard/parametres": "Paramètres",
  "/dashboard/settings": "Paramètres",
};

export function nameForPath(pathname: string): string {
  if (!pathname || pathname === "/") return "Home";
  return PAGE_NAMES[pathname] ?? capitalizeLastSegment(pathname);
}

export function sectionForPath(pathname: string): "landing" | "auth" | "dashboard" {
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname === "/login" || pathname === "/") return pathname === "/" ? "landing" : "auth";
  return "landing";
}

function capitalizeLastSegment(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return "Home";
  const last = parts[parts.length - 1];
  return last.charAt(0).toUpperCase() + last.slice(1);
}
