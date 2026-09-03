import { useEffect, type ReactNode } from "react";
import { Outlet, createFileRoute, useLocation, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { DashSidebarShell } from "@/components/dash-sidebar";
import { AppLoadingGate, BrandLoader } from "@/components/brand-loader";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DashboardI18nProvider, useDashboardI18n, useDashboardNav } from "@/lib/dashboard-i18n";
import { IstpmProvider } from "@/lib/istpm-store";

/**
 * Dashboard subtree. Rendered client-only (`ssr: false`): the store reads
 * localStorage during init, framer-motion / canvas / IndexedDB are used
 * throughout, and the 1.2 MB seed must stay out of the SSR bundle. The landing
 * page at `/` is unaffected and keeps its SSR.
 *
 * The provider stack lived in the source app's `main.tsx`; here it wraps only
 * this route. `QueryClientProvider` already exists in `__root.tsx` — reused.
 */
// Login is enforced: `/dashboard/*` requires an authenticated session. Visitors
// without one are bounced to `/login`.
export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: DashboardRoot,
});

function DashboardRoot() {
  return (
    <AuthProvider>
      <DashboardI18nProvider>
        <AuthGate>
          <IstpmProvider>
            <AppLoadingGate>
              <MotionConfig
                reducedMotion="user"
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <DashboardLayout />
              </MotionConfig>
            </AppLoadingGate>
          </IstpmProvider>
        </AuthGate>
      </DashboardI18nProvider>
    </AuthProvider>
  );
}

/** Blocks the dashboard subtree until a session exists; redirects to `/login`. */
function AuthGate({ children }: { children: ReactNode }) {
  const { role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !role) navigate({ to: "/login", replace: true });
  }, [loading, role, navigate]);

  if (loading || !role) return <BrandLoader />;
  return <>{children}</>;
}

function DashboardLayout() {
  const { dir } = useDashboardI18n();
  const { role } = useAuth();
  const { nav, brand } = useDashboardNav(role);
  const { pathname } = useLocation();

  return (
    <DashSidebarShell brand={brand} nav={nav} dir={dir}>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </DashSidebarShell>
  );
}
