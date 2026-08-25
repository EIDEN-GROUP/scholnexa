import { useEffect, useState } from "react";
import { createRootRoute, Outlet, Link } from "@tanstack/react-router";
import { MotionConfig } from "framer-motion";
import { BackToTop } from "@/components/back-to-top";
import { PageTransition } from "@/components/page-transition";
import { LanguageToggleFloating } from "@/components/language-toggle";
import { LandingI18nProvider } from "@/lib/landing-i18n";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page introuvable
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}

function RootComponent() {
  // Client-only gate: the curtain animates on navigation, so it must not render
  // before hydration.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    // App-wide motion defaults: one smooth easing curve for every framer-motion
    // component that doesn't override it, and `reducedMotion="user"` so the whole
    // app honours the OS "reduce motion" setting automatically.
    <MotionConfig reducedMotion="user" transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      {/* Shared FR/AR context for the landing funnel, the hero previews and the
          floating controls below. It falls back to (and writes through to) the
          dashboard's `gestio-locale` key so both universes stay in sync. */}
      <LandingI18nProvider>
        <div className="relative">
          <Outlet />
          {hydrated ? <PageTransition /> : null}
        </div>
        <LanguageToggleFloating />
        <BackToTop />
      </LandingI18nProvider>
    </MotionConfig>
  );
}

export const Route = createRootRoute({
  notFoundComponent: NotFoundComponent,
  component: RootComponent,
});
