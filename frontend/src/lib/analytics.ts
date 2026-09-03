/**
 * Amplitude analytics — single integration point for the whole app.
 *
 * `initAnalytics()` runs once, client-side, from the root route. It enables
 * autocapture (clicks, form interactions, sessions, file downloads, rage/dead
 * clicks, marketing attribution) so most of the product is tracked with no
 * per-component code. On top of that, `track()` records named domain events at
 * the points that matter (funnel + core dashboard actions), and `identifyUser()`
 * ties every event to a signed-in user.
 *
 * Missing `VITE_AMPLITUDE_API_KEY` -> every function is a no-op, so local dev
 * and tests run without a key.
 */
import * as amplitude from "@amplitude/analytics-browser";

const API_KEY = import.meta.env.VITE_AMPLITUDE_API_KEY as string | undefined;
// Amplitude projects are US by default; set VITE_AMPLITUDE_SERVER_ZONE=EU if the
// project lives in the EU data centre.
const SERVER_ZONE =
  (import.meta.env.VITE_AMPLITUDE_SERVER_ZONE as "US" | "EU" | undefined) ?? "US";

let started = false;

export function initAnalytics() {
  if (started || typeof window === "undefined" || !API_KEY) return;
  started = true;

  amplitude.init(API_KEY, {
    // We emit our own "Page Viewed" with the router path; everything else is
    // captured automatically.
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
  });
}

/** Explicit SPA page view, called on every router navigation. */
export function trackPage(path: string) {
  if (!started) return;
  amplitude.track("Page Viewed", {
    path,
    section: path.startsWith("/dashboard") ? "dashboard" : path === "/login" ? "auth" : "landing",
  });
}

/** Named domain event. */
export function track(event: string, props?: Record<string, unknown>) {
  if (!started) return;
  amplitude.track(event, props);
}

/** Attach the current user's identity + traits to all following events. */
export function identifyUser(u: {
  id: string;
  role?: string | null;
  email?: string;
  name?: string;
}) {
  if (!started) return;
  amplitude.setUserId(u.id);
  const identity = new amplitude.Identify();
  if (u.role) identity.set("role", u.role);
  if (u.email) identity.set("email", u.email);
  if (u.name) identity.set("name", u.name);
  amplitude.identify(identity);
}

/** Clear identity on logout so the next session starts anonymous. */
export function resetAnalytics() {
  if (!started) return;
  amplitude.reset();
}
