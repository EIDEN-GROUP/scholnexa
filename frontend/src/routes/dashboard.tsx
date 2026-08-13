import { Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { DashSidebarShell } from "@/components/dash-sidebar";
import { useDashboardI18n, useDashboardNav } from "@/lib/dashboard-i18n";
import { getStoredRole, useAuth } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  // UI-only gate: no token, no network   just "has a role been picked yet?".
  beforeLoad: ({ location }) => {
    if (!getStoredRole()) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { dir } = useDashboardI18n();
  const { role } = useAuth();
  const { nav, brand } = useDashboardNav(role);
  const { pathname } = useLocation();

  return (
    <DashSidebarShell brand={brand} nav={nav} dir={dir}>
      {/* Transition de page : à chaque changement de route, le contenu entre en
          fondu + léger glissement. Pas d'AnimatePresence ici : le `<Outlet />`
          est « vivant » (il se re-rend avec le match courant), donc une sortie
          en mode="wait" pouvait rester bloquée et laisser l'écran vide au
          retour (ex. Planning → Tableau de bord) jusqu'à une nouvelle
          navigation. La remontée seule est fiable. */}
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        <Outlet />
      </motion.div>
    </DashSidebarShell>
  );
}
