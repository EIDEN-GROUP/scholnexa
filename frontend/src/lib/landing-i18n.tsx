import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { fr as dateFnsFr, ar as dateFnsAr } from "date-fns/locale";
import frLanding from "@/locales/landing/fr.json";
import arLanding from "@/locales/landing/ar.json";
import frDashboard from "@/locales/dashboard/fr.json";
import arDashboard from "@/locales/dashboard/ar.json";

export type LandingLocale = "fr" | "ar";
export type LandingTranslations = typeof frLanding;
export type DashboardTranslations = typeof frDashboard;

/**
 * La landing et le dashboard partagent la même langue : la clé de stockage de
 * la landing est dédiée mais retombe sur celle du dashboard (`essor-locale`)
 * comme valeur par défaut, et chaque changement écrit les deux clés pour que
 * les deux univers restent synchronisés.
 */
const STORAGE_KEY = "essor-landing-locale";
const DASHBOARD_STORAGE_KEY = "essor-locale";

/**
 * Cross-provider sync. The dashboard keeps its own i18n context (`lib/dashboard-i18n`),
 * so every locale change is broadcast on the window and adopted by the other
 * provider — otherwise one universe would render FR while the other renders AR.
 */
export const LOCALE_SYNC_EVENT = "essor:locale-sync";
export type LocaleSyncEventDetail = { locale: LandingLocale };

function broadcastLocale(locale: LandingLocale) {
  window.dispatchEvent(
    new CustomEvent<LocaleSyncEventDetail>(LOCALE_SYNC_EVENT, {
      detail: { locale },
    }),
  );
}

const landingDictionaries: Record<LandingLocale, LandingTranslations> = {
  fr: frLanding,
  ar: arLanding,
};

const dashboardDictionaries: Record<LandingLocale, DashboardTranslations> = {
  fr: frDashboard,
  ar: arDashboard,
};

type LandingI18nContextValue = {
  locale: LandingLocale;
  setLocale: (locale: LandingLocale) => void;
  toggleLocale: () => void;
  dir: "ltr" | "rtl";
  numberLocale: string;
  landing: LandingTranslations;
  dashboard: DashboardTranslations;
};

const LandingI18nContext = createContext<LandingI18nContextValue | null>(null);

function readStoredLocale(): LandingLocale {
  if (typeof window === "undefined") return "fr";
  return localStorage.getItem(STORAGE_KEY) === "ar" ||
    localStorage.getItem(DASHBOARD_STORAGE_KEY) === "ar"
    ? "ar"
    : "fr";
}

export function getDateFnsLocale(locale: LandingLocale) {
  return locale === "ar" ? dateFnsAr : dateFnsFr;
}

export function LandingI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LandingLocale>("fr");

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((next: LandingLocale) => {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
    localStorage.setItem(DASHBOARD_STORAGE_KEY, next);
    broadcastLocale(next);
  }, []);

  // Adopt locale changes made from the dashboard's own toggle.
  useEffect(() => {
    const onSync = (e: Event) => {
      const next = (e as CustomEvent<LocaleSyncEventDetail>).detail?.locale;
      if (next === "fr" || next === "ar") setLocaleState(next);
    };
    window.addEventListener(LOCALE_SYNC_EVENT, onSync);
    return () => window.removeEventListener(LOCALE_SYNC_EVENT, onSync);
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "fr" ? "ar" : "fr");
  }, [locale, setLocale]);

  const landing = landingDictionaries[locale];
  const dashboard = dashboardDictionaries[locale];
  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";
  const numberLocale = locale === "ar" ? "ar-MA" : "fr-MA";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, dir, numberLocale, landing, dashboard }),
    [locale, setLocale, toggleLocale, dir, numberLocale, landing, dashboard],
  );

  return <LandingI18nContext.Provider value={value}>{children}</LandingI18nContext.Provider>;
}

export function useLandingI18n() {
  const ctx = useContext(LandingI18nContext);
  if (!ctx) throw new Error("useLandingI18n must be used within LandingI18nProvider");
  return { ...ctx, t: ctx.landing };
}

export function useLandingI18nOptional() {
  const ctx = useContext(LandingI18nContext);
  if (!ctx) return null;
  return { ...ctx, t: ctx.landing };
}

/** Dictionnaire dashboard exposé dans le même provider (aperçus hero / démo). */
export function useDashboardI18n() {
  const ctx = useContext(LandingI18nContext);
  if (!ctx) throw new Error("useDashboardI18n must be used within LandingI18nProvider");
  return { ...ctx, t: ctx.dashboard };
}

export function interpolate(template: string, vars: Record<string, string | number>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ""));
}

// La visite guidée de la landing calque exactement les pages rendues par
// `HeroPreviewPageBody` (voir components/hero-preview-page-body.tsx) :
// un module = une page réelle du dashboard, dans l'ordre de la navigation.
export const DEMO_STEP_PAGES = [
  "dashboard",
  "calendar",
  "etudiants",
  "examens",
  "bulletins",
  "formateurs",
  "stages",
  "paiements",
  "settings",
] as const;

export const PREVIEW_TOP_NAV_IDS = [
  "dashboard",
  "calendar",
  "etudiants",
  "examens",
  "bulletins",
] as const;

export const PREVIEW_SECONDARY_NAV_IDS = [
  "formateurs",
  "stages",
  "paiements",
  "settings",
] as const;
