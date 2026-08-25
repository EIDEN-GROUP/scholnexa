import { useRouterState } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLandingI18nOptional, type LandingLocale } from "@/lib/landing-i18n";

function LanguageToggleButton({
  locale,
  onToggle,
  label,
}: {
  locale: LandingLocale;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={cn(
        "flex h-10 items-center gap-1 rounded-full border border-border bg-card/95 p-1 ps-2.5 shadow-[var(--shadow-soft)] backdrop-blur transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
    >
      <Languages className="me-0.5 h-4 w-4 shrink-0 text-foreground/60" strokeWidth={2} aria-hidden />
      {/* Les deux codes sont visibles : le bouton se lit comme un sélecteur de
          langue, pas comme un bouton de chat. */}
      <span
        aria-hidden
        className={cn(
          "grid h-7 min-w-8 place-items-center rounded-full px-1.5 text-[10px] font-black uppercase tracking-wide transition",
          locale === "fr" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        FR
      </span>
      <span
        aria-hidden
        className={cn(
          "grid h-7 min-w-8 place-items-center rounded-full px-1.5 text-[10px] font-black uppercase tracking-wide transition",
          locale === "ar" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
        )}
      >
        AR
      </span>
      <span className="sr-only">{locale === "fr" ? "العربية" : "Français"}</span>
    </button>
  );
}

/**
 * Fixed FR/AR control, visible on every public surface (landing, login) and on
 * the dashboard. It drives the shared landing i18n context whose `setLocale`
 * writes through to the dashboard's storage key and notifies the other provider
 * via a window event, so both universes switch in lockstep.
 */
export function LanguageToggleFloating() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const i18n = useLandingI18nOptional();

  const onDashboard = pathname.startsWith("/dashboard");
  const show = pathname === "/" || pathname.startsWith("/login") || onDashboard;
  if (!show || !i18n) return null;

  const langLabel =
    i18n.locale === "fr" ? "Passer en arabe" : "التبديل إلى الفرنسية";

  return (
    <div
      className={cn(
        "fixed z-[60] flex flex-col items-center gap-2",
        "end-[max(1rem,env(safe-area-inset-right))]",
        onDashboard
          ? // Mobile : au-dessus de la barre d'onglets fixe. Desktop : le bouton
            // prend l'angle, SOUS le bouton du chat support (relevé à 4.25rem).
            "bottom-[calc(5rem+max(0.5rem,env(safe-area-inset-bottom)))] lg:bottom-6"
          : // Public pages: toggle hugs the corner, BackToTop stacks above it.
            "bottom-[max(1rem,env(safe-area-inset-bottom))]",
      )}
    >
      <LanguageToggleButton
        locale={i18n.locale}
        onToggle={i18n.toggleLocale}
        label={langLabel}
      />
    </div>
  );
}
