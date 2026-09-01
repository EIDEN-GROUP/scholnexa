import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { ArrowRight, Building2, Calendar, CalendarDays, Check, ClipboardList, CreditCard, FileText, Gift, Globe, GraduationCap, LayoutDashboard, Loader2, LogOut, Mail, MapPin, MessageSquare, Phone, Send, Settings, Sparkles, Stethoscope, TrendingUp, UserPlus, Users, AlertCircle, FileSpreadsheet, BadgeDollarSign, Star, UsersRound, Lock, MousePointerClick, Menu, BookOpen} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { format } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, } from "@/components/ui/accordion";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HeroPreviewPageBody } from "@/components/hero-preview-page-body";
import { HeroDashboardShot } from "@/components/hero-dashboard-shot";
import type { DashboardMiniaturePageId } from "@/lib/dashboard-mirror-data";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { useLandingI18n, getDateFnsLocale, interpolate, DEMO_STEP_PAGES, PREVIEW_TOP_NAV_IDS, PREVIEW_SECONDARY_NAV_IDS, } from "@/lib/landing-i18n";
import { submitDemoRequest } from "@/lib/contact-demo";
import { BRAND } from "@/lib/brand";

const MotionLink = motion.create(Link);

// Mêmes icônes que la navigation réelle du dashboard (`useDashboardNav`).
const PREVIEW_NAV_ICONS = {
  dashboard: LayoutDashboard,
  calendar: Calendar,
  etudiants: GraduationCap,
  examens: ClipboardList,
  bulletins: FileText,
  formateurs: Users,
  stages: Stethoscope,
  paiements: CreditCard,
  settings: Settings,
} as const;

const PAIN_ACCENT = [
  { accent: "border-t-[#2563EB]", bg: "bg-[color-mix(in_srgb,#2563EB_5%,#F8FAFC_95%)]" },
  { accent: "border-t-[#1E293B]", bg: "bg-[color-mix(in_srgb,#1E293B_8%,#F8FAFC_92%)]" },
  { accent: "border-t-[#0B1220]", bg: "bg-[color-mix(in_srgb,#0B1220_5%,#F8FAFC_95%)]" },
] as const;

const PAIN_ICONS = [FileSpreadsheet, CreditCard, UserPlus] as const;

// Une icône par carte module — dans le même ordre que `modules.items`
// (qui suit la navigation réelle du dashboard).
const MODULE_ICONS = [LayoutDashboard, Calendar, GraduationCap, ClipboardList, Users, Stethoscope, CreditCard, FileText, Settings] as const;

const TESTIMONIAL_AVATARS = [
  { initials: "FB", avatarColor: "#1a4f8a", stars: 5 },
  { initials: "KM", avatarColor: "#0c5752", stars: 5 },
  { initials: "SR", avatarColor: "#7c3aed", stars: 5 },
  { initials: "YF", avatarColor: "#b45309", stars: 5 },
  { initials: "HA", avatarColor: "#be185d", stars: 5 },
  { initials: "AC", avatarColor: "#0f766e", stars: 5 },
  { initials: "NB", avatarColor: "#6d28d9", stars: 5 },
  { initials: "OT", avatarColor: "#b91c1c", stars: 4 },
] as const;

/* Tarif par tranche d'étudiants : base jusqu'à 100 étudiants, puis +step par
   tranche supplémentaire de 100 (comptée entamée). L'annuel reste « 2 mois
   offerts » : yearly = monthly × 10. Réseau reste sur mesure. */
const PRICING_MODEL = {
  essentiel: { base: 1000, step: 400, included: 100, popular: false },
  pro: { base: 2000, step: 800, included: 100, popular: true },
  reseau: null,
} as const;

/** Paliers proposés dans le sélecteur d'effectif. */
const STUDENT_OPTIONS = [100, 250, 500] as const;
const DEFAULT_STUDENTS = 250;

function planMonthly(planId: string, students: number): number | null {
  const model = PRICING_MODEL[planId as keyof typeof PRICING_MODEL];
  if (!model) return null;
  const extraBrackets = Math.max(0, Math.ceil((students - model.included) / 100));
  return model.base + extraBrackets * model.step;
}

// Per-plan icon shown at the top of each pricing card.
const PRICING_ICONS = [Sparkles, BadgeDollarSign, Building2] as const;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Essor · Tout avance, simplement. | Plateforme tout-en-un pour écoles paramédicales au Maroc" },
      {
        name: "description",
        content:
          "Essor centralise la gestion de votre école, votre équipe et vos étudiants : plannings, paiements, bulletins, stages cliniques et reporting. Pensée pour les écoles paramédicales au Maroc. En ligne en 48h. Sans engagement.",
      },
      { property: "og:title", content: "Essor · Tout avance, simplement." },
      {
        property: "og:description",
        content: "La plateforme tout-en-un pour écoles paramédicales au Maroc. Inscriptions, plannings, paiements, bulletins et stages cliniques centralisés.",
      },
      { property: "og:url", content: "https://essor.eiden-group.com/" },
      { name: "twitter:title", content: "Essor · Tout avance, simplement." },
      {
        name: "twitter:description",
        content: "La plateforme tout-en-un pour gérer votre école, vos étudiants et votre équipe au Maroc.",
      },
    ],
  }),
  component: LandingPage,
});

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

declare global {
  interface Window {
    clarity?: (action: string, key: string, value?: string) => void;
  }
}

function track(event: string, value?: string) {
  window.clarity?.("event", event, value);
}

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

function usePreviewTopNav() {
  const { t } = useLandingI18n();
  const labels = [
    t.previewNav.dashboard,
    t.previewNav.calendar,
    t.previewNav.etudiants,
    t.previewNav.examens,
    t.previewNav.bulletins,
  ];
  return PREVIEW_TOP_NAV_IDS.map((id, i) => ({
    id,
    label: labels[i],
    icon: PREVIEW_NAV_ICONS[id],
  }));
}

function usePreviewSecondaryNav() {
  const { t } = useLandingI18n();
  const labels: Record<string, string> = {
    formateurs: t.previewNav.formateurs,
    stages: t.previewNav.stages,
    paiements: t.previewNav.paiements,
    settings: t.previewNav.settings,
  };
  return PREVIEW_SECONDARY_NAV_IDS.map((id) => ({
    id,
    label: labels[id],
    icon: PREVIEW_NAV_ICONS[id],
  }));
}

function useTourSteps() {
  const { t } = useLandingI18n();
  const icons = [
    LayoutDashboard,
    Calendar,
    GraduationCap,
    ClipboardList,
    FileText,
    Users,
    Stethoscope,
    CreditCard,
    Settings,
  ];
  return t.demo.steps.map((step, i) => ({
    page: DEMO_STEP_PAGES[i],
    icon: icons[i],
    ...step,
  }));
}

// ─────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────
function Header() {
  const { t } = useLandingI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 48);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navScroll = (id: string) => {
    scrollToId(id);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 supports-[padding:max(0px)]:pt-[max(0px,env(safe-area-inset-top))]">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease }}
          className={cn(
            "border-b backdrop-blur-xl transition-[background-color,border-color,box-shadow] duration-300 ease-out",
            isScrolled
              ? "border-[#0B1220]/10 bg-white/85 shadow-[0_10px_35px_-15px_rgba(16,40,36,0.25)]"
              : "border-transparent bg-white/60",
          )}
        >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex min-w-0 shrink items-center gap-2 sm:gap-3 transition-colors text-[#0B1220] hover:text-[#0B1220]/80"
          >
                <img
                  src={BRAND.logoPath}
                  alt={BRAND.name}
                  className="h-12 w-auto shrink-0 sm:h-16 lg:h-20"
                />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex sm:gap-2 md:gap-3">
            {[
              { label: t.nav.modules, id: "modules" },
              { label: t.nav.demo, id: "demo" },
              { label: t.nav.pricing, id: "tarifs" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToId(item.id)}
                className="relative rounded-full px-3 py-2 text-sm font-medium text-[#0B1220]/70 transition hover:bg-[#0B1220]/5 hover:text-[#0B1220] md:px-4"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <MotionLink
              to="/login"
              className="hidden rounded-full px-3 py-2 text-sm font-semibold text-[#0B1220]/70 transition hover:bg-[#0B1220]/5 hover:text-[#0B1220] sm:inline-flex md:px-4"
            >
              {t.nav.connexion}
            </MotionLink>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#0B1220]/15 text-[#0B1220] transition hover:bg-[#0B1220]/5 sm:hidden"
              aria-expanded={menuOpen}
              aria-controls="landing-nav-sheet"
              aria-label={t.a11y.openMenu}
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" strokeWidth={2} />
            </button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="inline-flex max-w-[11rem] items-center justify-center gap-1.5 rounded-full bg-[#0B1220] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_30px_-12px_rgba(16,40,36,0.55)] transition hover:bg-[#020617] sm:max-w-none sm:gap-2 sm:px-6 sm:text-sm"
            >
              <span className="truncate sm:whitespace-normal">{t.nav.bookDemo}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
            </motion.button>
          </div>
        </div>
        </motion.div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" id="landing-nav-sheet" className="flex w-[min(100%,20rem)] flex-col border-l border-[#0B1220]/10 bg-white sm:max-w-sm">
          <SheetHeader className="text-left">
            <SheetTitle className="text-[#0B1220]">{t.nav.navigation}</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1 border-t border-[#0B1220]/10 pt-4" aria-label="Menu mobile">
            {[
              { label: t.nav.modules, id: "modules" },
              { label: t.nav.demoInteractive, id: "demo" },
              { label: t.nav.pricing, id: "tarifs" },
              { label: t.nav.faq, id: "faq" },
              { label: t.nav.contact, id: "contact" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navScroll(item.id)}
                className="rounded-xl px-3 py-3 text-left text-base font-medium text-[#0B1220]/75 transition hover:bg-[#2563EB]/20 hover:text-[#0B1220]"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto border-t border-[#0B1220]/10 pt-4">
            <div className="flex items-center gap-2">
              <MotionLink
                to="/login"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-[#0B1220]/20 px-4 py-3.5 text-sm font-bold text-[#0B1220] transition hover:bg-[#0B1220]/5"
              >
                {t.nav.connexion}
              </MotionLink>
              <button
                type="button"
                onClick={() => { scrollToId("contact"); setMenuOpen(false); }}
                className="landing-cta-primary flex min-w-0 flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-black uppercase tracking-wide transition"
              >
                <span className="truncate">{t.nav.bookDemo20}</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─────────────────────────────────────────────
// Hero miniature dashboard
// ─────────────────────────────────────────────
function HeroDashboardShowcase() {
  const { t } = useLandingI18n();
  const reduceMotion = useReducedMotion();

  // Les icônes de la barre flottante reproduisent la navigation réelle du
  // dashboard (même ordre que `useDashboardNav`) : Accueil, Planning,
  // Étudiants, Scolarité, Stages, Paiements.
  const toolIcons = [LayoutDashboard, CalendarDays, GraduationCap, BookOpen, Stethoscope, CreditCard];

  return (
    <div className="relative w-full [perspective:1600px]">
      {/* Soft glow behind the window */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-[#2563EB]/25 via-transparent to-[#1E293B]/10 blur-3xl" />

      {/* Stacked panels behind for depth */}
      <div className="pointer-events-none absolute -right-5 -top-5 hidden h-full w-full rounded-3xl border border-white/40 bg-white/25 backdrop-blur-sm lg:block" aria-hidden />
      <div className="pointer-events-none absolute -right-2.5 -top-2.5 hidden h-full w-full rounded-3xl border border-white/50 bg-white/45 lg:block" aria-hidden />

      {/* Floating toolbar chip */}
      <motion.div
        animate={!reduceMotion ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-5 left-5 z-30 hidden items-center gap-1 rounded-2xl border border-[#0B1220]/10 bg-white/90 px-2 py-1.5 shadow-[0_16px_35px_-18px_rgba(16,40,36,0.5)] backdrop-blur sm:flex"
      >
        {toolIcons.map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-lg transition",
              i === 0 ? "bg-[#0B1220] text-[#2563EB]" : "bg-[#0B1220]/5 text-[#0B1220]",
            )}
          >
            <Icon className="h-3 w-3" />
          </span>
        ))}
      </motion.div>

      {/* Main browser window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, ease, delay: 0.2 }}
        className="relative z-10 min-w-0 overflow-hidden rounded-2xl border border-[#0B1220]/10 bg-white shadow-[0_40px_90px_-45px_rgba(16,40,36,0.75)]"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-[#0B1220]/10 bg-[#0B1220] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#DFC9A5]/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]/50" />
          <span className="ml-2 flex-1 truncate rounded-md border border-[#2563EB]/20 bg-white/10 px-2 py-0.5 font-mono text-[9px] text-[#2563EB]">
            {t.hero.previewUrl}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#2563EB]/30 bg-[#2563EB]/15 px-1.5 py-0.5 text-[9px] font-semibold text-[#2563EB]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
            {t.hero.live}
          </span>
        </div>

        {/* Static product shot of the real dashboard (cropped by the frame fade) */}
        <div className="relative h-[340px] overflow-hidden bg-[#F8FAFC] sm:h-[420px]">
          <HeroDashboardShot />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/70 to-transparent" />
        </div>
      </motion.div>

      {/* Floating KPI chip (top-right) */}
      <motion.div
        animate={!reduceMotion ? { y: [0, -10, 0] } : {}}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-3 top-14 z-30 hidden rounded-2xl border border-[#0B1220]/10 bg-white/95 px-3 py-2 shadow-[0_20px_45px_-20px_rgba(16,40,36,0.5)] backdrop-blur sm:block"
      >
        <p className="text-[9px] font-medium uppercase tracking-wider text-[#1E293B]">Paiements reçus</p>
        <p className="font-display text-base font-bold text-[#0B1220]">163</p>
      </motion.div>

      {/* Floating stat card with sparkline (bottom-left) */}
      <motion.div
        animate={!reduceMotion ? { y: [0, 10, 0] } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -left-3 z-30 w-40 rounded-2xl border border-[#0B1220]/10 bg-white/95 p-3 shadow-[0_24px_50px_-22px_rgba(16,40,36,0.5)] backdrop-blur sm:-left-6 sm:w-44"
      >
        <p className="text-[10px] font-medium text-[#1E293B]">Encaissé ce mois</p>
        <div className="mt-0.5 flex items-end justify-between gap-2">
          <p className="font-display text-lg font-bold text-[#0B1220]">
            143k <span className="text-[10px] font-normal text-[#1E293B]">MAD</span>
          </p>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#2563EB]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#1E40AF]">
            <TrendingUp className="h-2.5 w-2.5" /> +12%
          </span>
        </div>
        <svg viewBox="0 0 120 34" preserveAspectRatio="none" className="mt-1.5 h-8 w-full" aria-hidden>
          <polyline
            points="0,26 20,22 40,24 60,14 80,16 100,7 120,4"
            fill="none"
            stroke="#0B1220"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="120" cy="4" r="3" fill="#2563EB" />
        </svg>
      </motion.div>

      {/* Floating promo badge (bottom-right) */}
      <motion.div
        animate={!reduceMotion ? { y: [0, -8, 0] } : {}}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-6 -right-2 z-30 flex flex-col items-center rounded-2xl border border-[#0B1220]/10 bg-white/95 p-3 text-center shadow-[0_24px_50px_-20px_rgba(16,40,36,0.4)] backdrop-blur sm:-right-6"
      >
        <Gift className="mb-1 h-5 w-5 text-[#2563EB]" />
        <p className="text-[9px] font-black uppercase tracking-widest text-[#1E293B]">{t.hero.promoLabel}</p>
        <p className="text-[11px] font-bold text-[#0B1220]">{t.hero.promoText}</p>
      </motion.div>
    </div>
  );
}

// ─────────────────────────────────────────────
// S1 Hero - REDESIGNED DARK
// ─────────────────────────────────────────────
function Hero() {
  const { t } = useLandingI18n();
  const reduceMotion = useReducedMotion();
  const trustItems = [
    { icon: Lock, text: t.hero.trustServers },
    { icon: BadgeDollarSign, text: t.hero.trust48h },
    { icon: Check, text: t.hero.trustNoCommit },
  ];
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#ffffff_0%,#F1F5F9_60%,#E2E8F0_100%)] py-12 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Dynamic Background */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,_rgba(201,160,102,0.35)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,_rgba(16,40,36,0.08)_0%,_transparent_50%)]" />
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(to right, #0B1220 1px, transparent 1px), linear-gradient(to bottom, #0B1220 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 35%, #000 40%, transparent 100%)" }} />

          <motion.div
            animate={!reduceMotion ? { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#2563EB]/40 blur-[120px]"
          />
          <motion.div
            animate={!reduceMotion ? { scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] } : {}}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#0B1220]/15 blur-[120px]"
          />

          {/* Floating glass tiles */}
          <motion.div
            animate={!reduceMotion ? { y: [0, -14, 0], rotate: [6, 10, 6] } : {}}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="glass-tile absolute right-[6%] top-16 hidden h-20 w-20 rotate-6 lg:block"
          >
            <span className="absolute left-4 top-4 h-3.5 w-3.5 rounded-md bg-[#2563EB]" />
            <span className="absolute bottom-4 right-4 h-3.5 w-6 rounded-md bg-[#0B1220]/70" />
          </motion.div>
          <motion.div
            animate={!reduceMotion ? { y: [0, 12, 0], rotate: [-8, -12, -8] } : {}}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
            className="glass-tile absolute left-[42%] top-28 hidden h-16 w-16 -rotate-8 xl:block"
          >
            <span className="absolute left-3.5 top-3.5 h-3 w-3 rounded-full bg-[#DFC9A5]" />
            <span className="absolute bottom-3.5 right-3.5 h-3 w-3 rounded-sm bg-[#2563EB]" />
          </motion.div>
        </div>

        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Copy Area */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.1 } } }}
            >

              <motion.h1 variants={fadeUp} className="mt-8 text-balance text-3xl font-black leading-[1.1] tracking-tight text-[#0B1220] sm:text-6xl">
                {t.hero.titleLine1} <br />
                <span className="bg-gradient-to-r from-[#2563EB] to-[#0B1220] bg-clip-text text-transparent">{t.hero.titleHighlight}</span>, &nbsp;
                {t.hero.titleLine2}
              </motion.h1>

              <motion.p variants={fadeUp} className="mt-6 max-w-lg text-sm leading-relaxed text-[#0B1220]/70 sm:text-medium">
                {t.hero.subtitle}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-6">
                <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white bg-[#0B1220] grid place-items-center text-[10px] font-bold text-[#F8FAFC] shadow-lg">
                        {["FB", "KM", "SR", "AM"][i-1]}
                      </div>
                    ))}
                </div>
                <div className="text-sm">
                    <div className="flex items-center gap-0.5 text-[#FF6B4A]">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                    </div>
                    <p className="mt-1 text-[#0B1220]/75">{t.hero.socialProof}</p>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToId("contact")}
                  className="group landing-cta-primary inline-flex items-center justify-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wide transition-all"
                >
                  {t.hero.ctaPrimary}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => scrollToId("demo")}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#0B1220]/20 bg-white/80 px-5 py-4 text-xs font-bold text-[#0B1220] shadow-sm backdrop-blur transition hover:border-[#0B1220]/40 hover:bg-white"
                >
                  {t.hero.ctaSecondary}
                  <MousePointerClick className="h-4 w-4" />
                </motion.button>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-4">
                {trustItems.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 rounded-full border border-[#0B1220]/10 bg-white/60 px-3 py-1.5 text-xs font-medium text-[#0B1220]/75 backdrop-blur">
                    <Icon className="h-3.5 w-3.5 text-[#2563EB]" />
                    {text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Visual Area */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative lg:ml-8"
            >
              <HeroDashboardShowcase />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S2 Animated Feature Tour + Interactive Demo
// ─────────────────────────────────────────────
function DemoSection() {
  const { t } = useLandingI18n();
  const tourSteps = useTourSteps();
  const previewTopNav = usePreviewTopNav();
  const previewSecondaryNav = usePreviewSecondaryNav();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [page, setPage] = useState<DashboardMiniaturePageId>("dashboard");
  const [notice, setNotice] = useState<string | null>(null);

  const currentStep = tourSteps[step];

  const showLocked = (msg: string) => {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 4500);
  };

  // resumeTimer: after manual interaction, resume auto-advance in 10s
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRef = useRef(true); // true = auto-advancing

  const goToStep = (i: number) => {
    setStep(i);
    setPage(tourSteps[i].page);
    autoRef.current = false;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => { autoRef.current = true; }, 10000);
  };

  const prevStep = () => goToStep((step - 1 + tourSteps.length) % tourSteps.length);
  const nextStep = () => goToStep((step + 1) % tourSteps.length);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (autoRef.current) {
        setStep((s) => {
          const next = (s + 1) % tourSteps.length;
          setPage(tourSteps[next].page);
          return next;
        });
      }
    }, 8000);
    return () => {
      window.clearInterval(id);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, []);

  const panelTransition = reduceMotion
    ? { duration: 0.15 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const };

  const StepIcon = currentStep.icon;

  // Shared dashboard frame used in both layouts
  function DashboardFrame() {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-[#0B1220]/8 bg-gradient-to-br from-[#F7F9FC] to-[#EEF2F8] shadow-[0_20px_60px_-20px_rgba(11,18,32,0.25)]">
        {/* Browser bar */}
        <div className="flex items-center gap-2 border-b border-[#0B1220]/10 bg-gradient-to-r from-[#0B1220] to-[#1E293B] px-3 py-2 sm:px-4 sm:py-2.5">
          <span className="h-2 w-2 rounded-full bg-[#2563EB] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#FF6B4A] sm:h-2.5 sm:w-2.5" />
          <span className="h-2 w-2 rounded-full bg-[#22D3EE] sm:h-2.5 sm:w-2.5" />
          <span className="ml-2 flex-1 truncate rounded border border-[#2563EB]/30 bg-white/10 px-2 py-0.5 font-mono text-[10px] text-[#2563EB] sm:ml-3 sm:px-3 sm:text-xs">
            essor.app · {currentStep.label.toLowerCase()}
          </span>
          <span className="flex items-center gap-1 rounded-full border border-[#2563EB]/40 bg-[#2563EB]/20 px-1.5 py-0.5 text-[10px] font-semibold text-white sm:px-2 sm:text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="hidden sm:inline">{t.demo.liveDemo}</span>
            <span className="sm:hidden">{t.hero.live}</span>
          </span>
        </div>
        {/* App shell with sidebar */}
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="flex w-14 shrink-0 flex-col border-r border-[#0B1220]/8 bg-white/90 backdrop-blur-sm sm:w-16">
            {/* Logo */}
            <div className="flex h-14 items-center justify-center border-b border-[#0B1220]/8 sm:h-16">
              <img src={BRAND.logoMarkPath} alt="Essor" className="h-7 w-7 object-contain sm:h-8 sm:w-8" />
            </div>
            {/* Nav items */}
            <nav className="flex flex-1 flex-col gap-0.5 p-1.5 sm:p-2">
              {[...previewTopNav, ...previewSecondaryNav].map((n) => {
                const Icon = n.icon;
                const active = page === n.id;
                return (
                  <motion.button
                    key={n.id}
                    type="button"
                    onClick={() => { const idx = tourSteps.findIndex(t => t.page === n.id); if (idx !== -1) goToStep(idx); else setPage(n.id); }}
                    whileTap={{ scale: 0.95 }}
                    title={n.label}
                    className={cn(
                      "group relative flex h-9 w-full items-center justify-center rounded-lg transition-all sm:h-10",
                      active 
                        ? "bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-sm" 
                        : "text-[#0B1220]/60 hover:bg-[#2563EB]/10 hover:text-[#2563EB]",
                    )}
                  >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={active ? 2.5 : 2} />
                    {/* Tooltip on hover */}
                    <span className="pointer-events-none absolute left-full ml-2 hidden whitespace-nowrap rounded-md border border-[#0B1220]/10 bg-white px-2 py-1 text-xs font-medium text-[#0B1220] shadow-lg opacity-0 transition-opacity group-hover:opacity-100 sm:block">
                      {n.label}
                    </span>
                  </motion.button>
                );
              })}
            </nav>
            {/* User avatar at bottom */}
            <div className="border-t border-[#0B1220]/8 p-1.5 sm:p-2">
              <button
                className="flex h-9 w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-[10px] font-bold text-white shadow-sm transition-transform hover:scale-105 sm:h-10 sm:text-xs"
                onClick={() => showLocked(t.hero.loginToAccessReal)}
                title={t.demo.adminRole}
              >
                A
              </button>
            </div>
          </div>
          {/* Main content */}
          <div className="flex flex-1 flex-col">
            {/* Top bar */}
            <div className="flex h-14 items-center justify-between border-b border-[#0B1220]/8 bg-white/70 backdrop-blur-sm px-3 sm:h-16 sm:px-5">
              <div>
                <p className="text-sm font-bold tracking-tight text-[#0B1220] sm:text-base">Essor</p>
                <p className="text-[10px] uppercase tracking-widest text-[#0B1220]/60 sm:text-[11px]">{t.hero.specializedCenter}</p>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  className="rounded-lg border border-[#0B1220]/15 bg-white px-2 py-1 text-[10px] font-medium text-[#0B1220]/80 transition-all hover:border-[#2563EB]/30 hover:bg-[#2563EB]/5 sm:text-xs"
                  onClick={() => showLocked(t.hero.loginToAccessReal)}
                >
                  <LogOut className="inline h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </button>
              </div>
            </div>
            {/* Page content */}
            <main className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false} mode="wait">
                {notice && (
                  <motion.div
                    key={notice}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease }}
                    className="pointer-events-none absolute left-2 right-2 top-2 z-20 flex justify-center sm:left-4 sm:right-4 sm:top-3"
                  >
                    <p className="max-w-xs rounded-lg border border-[#0B1220]/15 bg-white/95 px-3 py-1.5 text-center text-xs text-[#0B1220] shadow-lg backdrop-blur-sm sm:max-w-md sm:px-4 sm:py-2 sm:text-sm">
                      {notice}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={page}
                  role="tabpanel"
                  aria-live="polite"
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                  transition={panelTransition}
                  className="h-full overflow-y-auto overscroll-contain p-3 sm:p-5"
                >
                  <HeroPreviewPageBody page={page} showLocked={showLocked} />
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const el = document.getElementById("demo");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { track("demo_section_view"); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="demo" className="relative overflow-hidden border-t border-[#2563EB]/20 bg-[color-mix(in_srgb,#2563EB_8%,#F8FAFC_92%)] py-12 sm:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(16,40,36,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,40,36,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-4 py-2 text-sm font-bold uppercase tracking-wider text-[#F8FAFC] shadow-[0_14px_30px_-14px_rgba(16,40,36,0.6)] sm:px-5 sm:text-base">
            <MousePointerClick className="h-4 w-4 sm:h-[1.125rem] sm:w-[1.125rem]" />
            {t.demo.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.demo.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground sm:text-xl">
            {t.demo.subtitle}
          </motion.p>
        </motion.div>

        {/* ─── DESKTOP LAYOUT (lg+) sidebar step list + annotation + dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-10 hidden lg:grid lg:grid-cols-[300px_1fr] lg:gap-8 lg:items-start"
        >
          {/* Left: step list */}
          <div className="flex flex-col gap-2">
            {tourSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <motion.button
                  key={s.page}
                  type="button"
                  onClick={() => goToStep(i)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all",
                    active
                      ? "border-[#0B1220] bg-[#0B1220] text-[#F8FAFC] shadow-[0_20px_45px_-20px_rgba(16,40,36,0.6)]"
                      : "border-[#0B1220]/10 bg-white text-[#0B1220] shadow-sm hover:border-[#2563EB]/40 hover:shadow-md",
                  )}
                >
                  <span className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition",
                    active ? "border-[#2563EB]/40 bg-[#2563EB]/15" : "border-[#0B1220]/10 bg-[#0B1220]/5 group-hover:border-[#2563EB]/30",
                  )}>
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-base font-bold leading-tight", active ? "text-[#F8FAFC]" : "text-[#0B1220]")}>{s.label}</p>
                    <p className={cn("mt-0.5 text-sm", active ? "text-[#F8FAFC]/65" : "text-[#1E293B]")}>{s.tag}</p>
                  </div>
                  {active && <span className="shrink-0 text-[#2563EB] text-sm">→</span>}
                </motion.button>
              );
            })}
          </div>

          {/* Right: annotation card + dashboard */}
          <div className="flex flex-col gap-4">
            {/* Annotation card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease }}
                className="relative rounded-2xl bg-[#0B1220] p-5 text-[#F8FAFC] shadow-[0_25px_60px_-25px_rgba(16,40,36,0.65)]"
              >
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/10">
                    <StepIcon className="h-5 w-5 text-[#2563EB]" strokeWidth={1.5} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-[#2563EB]/70 uppercase tracking-widest">
                        {t.demo.moduleOf} {step + 1} / {tourSteps.length}
                      </span>
                      <span className="rounded-full border border-[#2563EB]/30 bg-[#2563EB]/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#2563EB]">
                        {currentStep.tag}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-2xl font-black">{currentStep.headline}</h3>
                    <p className="mt-2 text-base leading-relaxed text-[#F8FAFC]/75">{currentStep.description}</p>
                  </div>
                </div>
                {/* Controls */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {tourSteps.map((_, i) => (
                      <button key={i} onClick={() => goToStep(i)}
                        className={cn("h-1.5 rounded-full transition-all", i === step ? "w-6 bg-[#2563EB]" : "w-1.5 bg-[#F8FAFC]/30 hover:bg-[#F8FAFC]/60")}
                        aria-label={`${t.a11y.module} ${i + 1}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={prevStep} aria-label={t.a11y.previous} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2563EB]/40 text-[#2563EB]/70 transition hover:border-[#2563EB] hover:text-[#2563EB]">←</button>
                    <button onClick={nextStep} aria-label={t.a11y.next} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 text-[#2563EB]/70 transition hover:border-[#2563EB] hover:bg-[#2563EB]/20 hover:text-[#2563EB]">→</button>
                  </div>
                </div>
                <div className="absolute -bottom-[10px] left-10 h-0 w-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#0B1220]" />
              </motion.div>
            </AnimatePresence>
            <DashboardFrame />
          </div>
        </motion.div>

        {/* ─── MOBILE LAYOUT (< lg) horizontal tab bar + annotation card + dashboard ─── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease }}
          className="mt-8 flex flex-col gap-4 lg:hidden"
        >
          {/* Tab bar horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x">
            {tourSteps.map((s, i) => {
              const Icon = s.icon;
              const active = i === step;
              return (
                <motion.button
                  key={s.page}
                  type="button"
                  onClick={() => goToStep(i)}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 text-center transition-all",
                    active
                      ? "border-[#0B1220] bg-[#0B1220] text-[#F8FAFC] shadow-[0_16px_35px_-16px_rgba(16,40,36,0.6)]"
                      : "border-[#0B1220]/10 bg-white text-[#0B1220] shadow-sm",
                  )}
                >
                  <Icon className={cn("h-5 w-5", active ? "text-[#2563EB]" : "text-[#1E293B]/70")} strokeWidth={1.5} />
                  <span className={cn("text-xs font-bold whitespace-nowrap sm:text-sm", active ? "text-[#F8FAFC]" : "text-[#1E293B]")}>{s.label}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Annotation card compact */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease }}
              className="rounded-2xl bg-[#0B1220] p-4 text-[#F8FAFC] shadow-[0_25px_60px_-25px_rgba(16,40,36,0.65)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/10">
                  <StepIcon className="h-4 w-4 text-[#2563EB]" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono text-[#2563EB]/60 uppercase tracking-widest">Module {step + 1} / {tourSteps.length} · {currentStep.tag}</p>
                  <h3 className="mt-0.5 text-lg font-black leading-tight sm:text-xl">{currentStep.headline}</h3>
                </div>
              </div>
              <p className="mt-2.5 text-base leading-relaxed text-[#F8FAFC]/75">{currentStep.description}</p>
              {/* Progress dots + arrows */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {tourSteps.map((_, i) => (
                    <button key={i} onClick={() => goToStep(i)}
                      className={cn("h-1.5 rounded-full transition-all", i === step ? "w-5 bg-[#2563EB]" : "w-1.5 bg-[#F8FAFC]/30")}
                      aria-label={`Module ${i + 1}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={prevStep} aria-label={t.a11y.previous} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2563EB]/40 text-[#2563EB]/70 text-sm transition hover:border-[#2563EB] hover:text-[#2563EB]">←</button>
                  <button onClick={nextStep} aria-label={t.a11y.next} className="flex h-7 w-7 items-center justify-center rounded-full border border-[#2563EB]/40 bg-[#2563EB]/10 text-[#2563EB]/70 text-sm transition hover:border-[#2563EB] hover:bg-[#2563EB]/20 hover:text-[#2563EB]">→</button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dashboard */}
          <DashboardFrame />
        </motion.div>

        {/* CTA below demo */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t.demo.ctaText}
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary inline-flex items-center gap-2 px-8 py-4 text-base font-black transition"
          >
            {t.demo.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S3 Pain Points
// ─────────────────────────────────────────────
function PainPointsSection() {
  const { t } = useLandingI18n();
  const painPoints = t.pain.items.map((item, i) => ({
    ...item,
    icon: PAIN_ICONS[i],
    ...PAIN_ACCENT[i],
  }));

  return (
    <section className="relative bg-[#F8FAFC] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#0B1220]/10 bg-[#2563EB]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B1220]">
            {t.pain.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.pain.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.pain.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="mt-10 grid gap-6 md:grid-cols-3"
        >
          {painPoints.map((p) => (
            <motion.div
              key={p.title}
              variants={fadeUp}
              whileHover={{ y: -6, transition: { type: "spring", stiffness: 280 } }}
              className={cn("flex flex-col gap-4 rounded-3xl border-t-4 border border-[#0B1220]/10 p-6 shadow-[0_18px_45px_-25px_rgba(16,40,36,0.35)] transition-shadow hover:shadow-[0_28px_60px_-25px_rgba(16,40,36,0.45)]", p.accent, p.bg)}
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-[#1E293B]/20 bg-white">
                  <p.icon className="h-5 w-5 text-[#1E293B]" strokeWidth={1.5} />
                </span>
                <h3 className="text-base font-bold text-[#0B1220]">{p.title}</h3>
              </div>
              <blockquote className="border-l-2 border-[#1E293B]/30 pl-3 text-sm italic font-medium text-[#0B1220]/80">
                {p.quote}
              </blockquote>
              <p className="text-sm leading-relaxed text-[#1E293B]/80">{p.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease, delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-base font-semibold text-[#1E293B]">
            {t.pain.solutionHint}
          </p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="mt-3 text-[#2563EB]/60 text-xl">
            ↓
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S4 Solution bridge (dark bg)
// ─────────────────────────────────────────────
function SolutionSection() {
  const { t } = useLandingI18n();

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative grid min-w-0 items-center gap-8 overflow-hidden rounded-[2.5rem] bg-[#0B1220] px-6 py-12 text-[#F8FAFC] shadow-[0_45px_100px_-45px_rgba(16,40,36,0.7)] sm:gap-10 sm:px-10 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:px-14">
      <div className="pointer-events-none absolute -left-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#2563EB]/[0.14] blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#2563EB]/[0.08] blur-3xl" />
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/30 bg-white/[0.06] px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
            {t.solution.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            {t.solution.title}{" "}
            <span style={{ color: "#2563EB"}}>{t.solution.titleMuted}</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-6 text-lg text-[#F8FAFC]/80">
            {t.solution.subtitle}
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {t.solution.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-[#0B1220]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm leading-relaxed text-[#F8FAFC]/85">{b}</span>
              </li>
            ))}
          </motion.ul>
          <motion.button
            variants={fadeUp}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary mt-10 inline-flex items-center gap-2 px-7 py-4 text-base font-black transition"
          >
            {t.solution.cta}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease }}
          className="grid min-w-0 grid-cols-2 gap-3 sm:gap-4"
        >
          {t.solution.stats.map((stat) => (
            <div key={stat.label} className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-sm sm:p-6">
              <p className="text-2xl font-black tracking-tight tabular-nums text-[#F8FAFC] sm:text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs font-semibold text-[#2563EB] sm:text-sm">{stat.label}</p>
              <p className="text-[10px] text-[#2563EB] sm:text-xs">{stat.sub}</p>
            </div>
          ))}
        </motion.div>
      </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S5 Modules
// ─────────────────────────────────────────────
function ModulesSection() {
  const { t } = useLandingI18n();
  const modules = t.modules.items.map((item, i) => ({
    ...item,
    icon: MODULE_ICONS[i],
  }));

  return (
    <section id="modules" className="relative bg-[color-mix(in_srgb,#2563EB_6%,#F8FAFC_94%)] py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(16,40,36,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,40,36,0.04) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#F8FAFC] shadow-[0_14px_30px_-14px_rgba(16,40,36,0.6)]">
            {t.modules.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.modules.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.modules.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {modules.map((mod) => (
            <motion.div
              key={mod.title}
              variants={fadeUp}
              whileHover={{ y: -5, transition: { type: "spring", stiffness: 280 } }}
              className="group flex min-w-0 flex-col rounded-3xl border border-[#0B1220]/10 bg-white p-5 shadow-[0_18px_45px_-28px_rgba(16,40,36,0.35)] transition-all hover:border-[#2563EB]/50 hover:shadow-[0_30px_65px_-28px_rgba(16,40,36,0.45)] cursor-pointer sm:p-7"
              onClick={() => scrollToId("demo")}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#0B1220]/10 bg-[#2563EB]/15 transition group-hover:border-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-[#0B1220]">
                  <mod.icon className="h-5 w-5" strokeWidth={1.5} />
                </span>
              </div>
              <h3 className="mt-5 text-lg font-black text-[#0B1220]">{mod.title}</h3>
              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-[#4B6553]">{mod.benefit}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{mod.text}</p>
              <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-[#4B6553] opacity-0 transition group-hover:opacity-100">
                {t.modules.seeInDemo}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.4 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("demo")}
            className="landing-cta-secondary-light inline-flex items-center gap-2 px-8 py-4 text-sm font-black transition"
          >
            {t.modules.exploreAll}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S6 Social Proof
// ─────────────────────────────────────────────
type TestimonialItem = {
  initials: string;
  avatarColor: string;
  stars: number;
  name: string;
  role: string;
  center: string;
  city: string;
  date: string;
  highlight: string;
  quote: string;
};

function TestimonialCard({ item, dir }: { item: TestimonialItem; dir?: "ltr" | "rtl" }) {
  return (
    <div dir={dir} className="flex h-full min-w-0 flex-col gap-4 rounded-3xl border border-[#0B1220]/10 bg-white p-4 shadow-[0_18px_45px_-28px_rgba(16,40,36,0.35)] sm:p-6">
      {/* Stars + date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-0.5 text-[#FF6B4A]">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn("h-3.5 w-3.5", i < item.stars ? "fill-current" : "fill-none opacity-30")} />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">{item.date}</span>
      </div>
      {/* Highlight badge */}
      <span className="inline-flex w-fit items-center rounded-full border border-[#2563EB]/20 bg-[#2563EB]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1E40AF]">
        {item.highlight}
      </span>
      {/* Quote */}
      <blockquote className="flex-1 text-balance text-sm leading-relaxed text-[#0B1220]/75">
        &ldquo;{item.quote}&rdquo;
      </blockquote>
      {/* Author */}
      <div className="flex items-center gap-3 border-t border-[#0B1220]/8 pt-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-black text-white ring-2 ring-foreground/10"
          style={{ backgroundColor: item.avatarColor }}
          aria-label={item.name}
        >
          {item.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[#0B1220]">{item.name}</p>
          <p className="truncate text-[11px] text-[#1E293B]">{item.role} · {item.center}</p>
          <p className="flex items-center gap-0.5 text-[10px] text-[#1E293B]/70">
            <MapPin className="h-2.5 w-2.5 shrink-0" />
            {item.city}
          </p>
        </div>
      </div>
    </div>
  );
}

const TESTIMONIAL_GAP_PX = 20;

function SocialProofSection() {
  const { t, dir } = useLandingI18n();
  const testimonials = t.testimonials.items.map((entry, i) => ({
    ...entry,
    ...TESTIMONIAL_AVATARS[i],
  }));
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [cardWidthPx, setCardWidthPx] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const total = testimonials.length;
  const maxIndex = Math.max(0, total - visibleCount);
  const stepPx = cardWidthPx > 0 ? cardWidthPx + TESTIMONIAL_GAP_PX : 0;

  // Detect visible count from window width
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisibleCount(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // After breakpoint change, keep index in range
  useEffect(() => {
    setCurrent((c) => Math.min(c, Math.max(0, total - visibleCount)));
  }, [visibleCount, total]);

  const measureCards = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const vw = el.offsetWidth;
    const vc = Math.max(1, visibleCount);
    const cw = (vw - TESTIMONIAL_GAP_PX * (vc - 1)) / vc;
    setCardWidthPx(Math.max(0, cw));
  }, [visibleCount]);

  useLayoutEffect(() => {
    measureCards();
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(measureCards);
    ro.observe(el);
    window.addEventListener("resize", measureCards);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureCards);
    };
  }, [measureCards]);

  // Keep maxIndex fresh in auto-advance via ref
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;
  const maxIndexRef = useRef(maxIndex);
  maxIndexRef.current = maxIndex;

  // Auto-advance
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!isPausedRef.current) {
        setCurrent((c) => (c >= maxIndexRef.current ? 0 : c + 1));
      }
    }, 4000);
    return () => window.clearInterval(id);
  }, []);

  const prev = () => {
    setCurrent((c) => Math.max(0, c - 1));
    setIsPaused(true);
  };
  const next = () => {
    setCurrent((c) => Math.min(maxIndex, c + 1));
    setIsPaused(true);
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-[#2563EB]/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1E40AF]">
            <Star className="h-3.5 w-3.5 fill-current" />
            {t.testimonials.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.testimonials.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.testimonials.subtitle}
          </motion.p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-10 grid grid-cols-2 divide-x divide-white/10 overflow-hidden rounded-3xl bg-[#0B1220] text-[#F8FAFC] shadow-[0_35px_80px_-40px_rgba(16,40,36,0.65)] sm:grid-cols-4"
        >
          {t.testimonials.stats.map((s) => (
            <div key={s.label} className="py-6 text-center">
              <p className="text-2xl font-black tracking-tight text-[#F8FAFC] sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] sm:text-xs">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Carousel */}
        <div
          className="mt-10"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Track translate by one card + gap per index (sliding window) */}
          <div ref={viewportRef} className="min-w-0 overflow-hidden" dir="ltr">
            <motion.div
              className="flex"
              style={{ gap: TESTIMONIAL_GAP_PX }}
              animate={{ x: stepPx > 0 ? -current * stepPx : 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 34 }}
            >
              {testimonials.map((entry) => (
                <div
                  key={entry.name}
                  className="shrink-0"
                  style={{ width: cardWidthPx > 0 ? `${cardWidthPx}px` : "min(100%, 22rem)" }}
                >
                  <TestimonialCard item={entry} dir={dir} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Dots one per visible "page" */}
            <div className="flex max-w-full flex-wrap items-center gap-2">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); setIsPaused(true); }}
                  aria-label={`${t.a11y.review} ${i + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === current ? "w-7 bg-[#0B1220]" : "w-2 bg-[#0B1220]/20 hover:bg-[#1E293B]/40",
                  )}
                />
              ))}
            </div>
            {/* Arrows */}
            <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={prev}
                disabled={current === 0}
                aria-label={t.a11y.previous}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0B1220]/20 bg-white text-[#0B1220]/60 shadow-sm transition hover:border-[#0B1220] hover:text-[#0B1220] disabled:opacity-30"
              >
                ←
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={next}
                disabled={current >= maxIndex}
                aria-label={t.a11y.next}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B1220] text-[#F8FAFC] shadow-[0_14px_30px_-14px_rgba(16,40,36,0.6)] transition hover:bg-[#020617] disabled:opacity-30"
              >
                →
              </motion.button>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-sm text-muted-foreground">{t.testimonials.ctaText}</p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToId("contact")}
            className="landing-cta-primary inline-flex items-center gap-2 px-8 py-4 text-base font-black transition"
          >
            {t.testimonials.ctaButton}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S7 Pricing
// ─────────────────────────────────────────────
type Plan = {
  id: string;
  name: string;
  blurb: string;
  monthly: number | null;
  yearly: number | null;
  features: string[];
  cta: string;
  popular?: boolean;
};

function buildPricingPlans(t: ReturnType<typeof useLandingI18n>["t"], students: number): Plan[] {
  return t.pricing.plans.map((plan) => {
    const monthly = planMonthly(plan.id, students);
    return {
      ...plan,
      monthly,
      yearly: monthly == null ? null : monthly * 10,
      popular: plan.id === "pro",
    };
  });
}

function PricingCard({ plan, idx, yearly, students }: { plan: Plan; idx: number; yearly: boolean; students: number }) {
  const { t, numberLocale } = useLandingI18n();
  const Icon = PRICING_ICONS[idx] ?? PRICING_ICONS[0];
  const featured = plan.popular;

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260 }}
      className={cn(
        "relative flex h-full min-h-0 flex-col rounded-[2rem] px-6 pb-8 pt-9 text-center sm:px-8",
        featured
          ? "z-10 bg-[#0B1220] text-[#F8FAFC] shadow-[0_38px_80px_-30px_rgba(16,40,36,0.75)] lg:-my-4"
          : "bg-white text-[#0B1220] ring-1 ring-[#0B1220]/10 shadow-[0_28px_65px_-38px_rgba(16,40,36,0.5)]",
      )}
    >
      {/* Popular ribbon */}
      {featured && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, ease, delay: 0.15 }}
          className="absolute right-5 top-5 z-20 inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#0B1220] shadow-[0_12px_25px_-10px_rgba(168,127,68,0.7)] sm:text-[10px]"
        >
          <Star className="h-3 w-3 fill-current" /> {t.pricing.popular}
        </motion.div>
      )}

      {/* Icon */}
      <span
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-2xl",
          featured ? "bg-[#2563EB]/20 text-[#2563EB]" : "bg-[#2563EB]/10 text-[#2563EB]",
        )}
      >
        <Icon className="h-8 w-8" strokeWidth={1.5} />
      </span>

      {/* Name + blurb */}
      <h3 className={cn("mt-5 text-xl font-black tracking-tight sm:text-2xl", featured ? "text-[#F8FAFC]" : "text-[#0B1220]")}>
        {plan.name}
      </h3>
      <p className={cn("mx-auto mt-2 max-w-[26ch] text-xs leading-relaxed sm:text-sm", featured ? "text-[#F8FAFC]/70" : "text-[#1E293B]")}>
        {plan.blurb}
      </p>

      {/* Price */}
      <div className="mt-6 min-h-[4.5rem]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${plan.id}-${yearly}-${students}`}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease }}
          >
            {plan.monthly == null ? (
              <div className={cn("text-4xl font-black tracking-tight sm:text-5xl", featured ? "text-[#F8FAFC]" : "text-[#0B1220]")}>
                {t.pricing.custom}
              </div>
            ) : (
              <>
                <div className={cn("text-5xl font-black tracking-tight tabular-nums sm:text-6xl", featured ? "text-[#F8FAFC]" : "text-[#0B1220]")}>
                  {yearly ? plan.yearly?.toLocaleString(numberLocale) : plan.monthly?.toLocaleString(numberLocale)}
                </div>
                <p className={cn("mt-1.5 text-xs font-semibold uppercase tracking-wider sm:text-sm", featured ? "text-[#F8FAFC]/70" : "text-[#1E293B]")}>
                  {yearly ? t.pricing.perYear : t.pricing.perMonth}
                </p>
                {yearly && (
                  /* Économie rendue visible : le prix plein (×12) barré + le badge « −2 mois ». */
                  <p className={cn("mt-1 text-xs", featured ? "text-[#F8FAFC]/60" : "text-[#1E293B]/80")}>
                    <span className="line-through opacity-60">
                      {(plan.monthly! * 12).toLocaleString(numberLocale)}{t.pricing.perYear}
                    </span>
                    <span className={cn("ms-1.5 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide", featured ? "bg-[#2563EB]/25 text-[#F0DDB4]" : "bg-[#2563EB]/25 text-[#7D5C28]")}>
                      {t.pricing.yearlyDiscount}
                    </span>
                  </p>
                )}
                <p className={cn("mt-0.5 text-[11px] font-medium sm:text-xs", featured ? "text-[#F8FAFC]/60" : "text-[#1E293B]/80")}>
                  {interpolate(t.pricing.forStudents, { count: students.toLocaleString(numberLocale) })}
                </p>
                {yearly && (
                  <p className={cn("mt-1 text-xs", featured ? "text-[#F8FAFC]/60" : "text-[#1E293B]/80")}>
                    {t.pricing.yearlyEquiv}{" "}
                    <span className={featured ? "font-semibold text-[#F8FAFC]" : "font-semibold text-[#0B1220]"}>
                      {Math.round(plan.yearly! / 10).toLocaleString(numberLocale)}{t.pricing.perMonthShort}
                    </span>{" "}
                    {t.pricing.yearlyEquivSuffix}
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className={cn("mt-6 h-px w-full", featured ? "bg-[#2563EB]/20" : "bg-[#0B1220]/10")} />

      {featured && (
        <div className="mt-5 inline-flex items-center gap-1.5 self-center rounded-full border border-[#2563EB]/40 bg-[#FBF4E4] px-2.5 py-1 text-[10px] font-bold text-[#7D5C28]">
          <Gift className="h-3.5 w-3.5 shrink-0" /> {t.pricing.onboardingOffer}
        </div>
      )}

      {/* Features */}
      <ul className="mt-5 flex-1 space-y-3.5 text-left">
        {plan.features.map((f) => (
          <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.3, ease }} className="flex items-start gap-3 text-sm">
            <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", featured ? "bg-[#2563EB] text-[#0B1220]" : "bg-[#2563EB] text-[#F8FAFC]")}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className={featured ? "text-[#F8FAFC]/85" : "text-[#0B1220]/80"}>{f}</span>
          </motion.li>
        ))}
      </ul>

      {/* CTA — toute la conversion passe par la démo (pas d'inscription
          libre-serve : les comptes sont créés lors de l'onboarding). */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => scrollToId("contact")}
        className={cn(
          "mt-8 w-full rounded-full py-4 text-sm font-black uppercase tracking-widest transition hover:brightness-105",
          featured
            ? "bg-[#2563EB] text-[#0B1220] shadow-[0_18px_35px_-16px_rgba(168,127,68,0.8)]"
            : "bg-[#0B1220] text-[#F8FAFC] shadow-[0_18px_35px_-16px_rgba(16,40,36,0.6)]",
        )}
      >
        {plan.cta}
      </motion.button>
    </motion.div>
  );
}

function PricingSection() {
  const { t, numberLocale } = useLandingI18n();
  const [students, setStudents] = useState<number>(DEFAULT_STUDENTS);
  const pricingPlans = buildPricingPlans(t, students);
  const [yearly, setYearly] = useState(true);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    const el = document.getElementById("tarifs");
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { track("pricing_view"); observer.disconnect(); } }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCarouselIndex(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  return (
    <section id="tarifs" className="relative overflow-hidden bg-[#F8FAFC] py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ backgroundImage: "linear-gradient(to right, rgba(16,40,36,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,40,36,0.04) 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full bg-[#0B1220] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#F8FAFC] shadow-[0_14px_30px_-14px_rgba(16,40,36,0.6)]">
            {t.pricing.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.pricing.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.pricing.subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease }}
          className="mt-8 flex flex-col items-center gap-4"
        >
          <div className="flex w-full max-w-md overflow-hidden rounded-full border border-[#0B1220]/15 bg-white p-1 shadow-[0_18px_45px_-25px_rgba(16,40,36,0.4)]">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={cn(
                "min-h-[3rem] flex-1 rounded-full px-3 py-3 text-xs font-black uppercase tracking-wider transition-colors sm:px-6 sm:text-sm",
                !yearly ? "bg-[#0B1220] text-[#F8FAFC] shadow-md" : "bg-transparent text-[#0B1220] hover:bg-[#2563EB]/20",
              )}
            >
              {t.pricing.monthly}
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={cn(
                "flex min-h-[3rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-full px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors sm:flex-row sm:gap-2 sm:px-6 sm:py-3 sm:text-sm",
                yearly ? "bg-[#0B1220] text-[#F8FAFC] shadow-md" : "bg-transparent text-[#0B1220] hover:bg-[#2563EB]/20",
              )}
            >
              <span>{t.pricing.yearly}</span>
              <span
                className={cn(
                  "rounded-full border px-1.5 py-0.5 text-[8px] font-black leading-none sm:text-[9px]",
                  yearly ? "border-[#E3C285]/80 text-[#F0DDB4]" : "border-[#0B1220]/40 text-[#0B1220]",
                )}
              >
                {t.pricing.yearlyDiscount}
              </span>
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={yearly ? "y" : "m"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {yearly ? t.pricing.billingYearly : t.pricing.billingMonthly}
            </motion.p>
          </AnimatePresence>

          {/* Sélecteur d'effectif : les prix Essentiel / Pro s'ajustent par tranche de 100 étudiants. */}
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">{t.pricing.studentsLabel}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {STUDENT_OPTIONS.map((count) => {
                const active = students === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setStudents(count)}
                    aria-pressed={active}
                    className={cn(
                      "min-w-[4.25rem] rounded-full border px-4 py-2 text-sm font-bold tabular-nums transition-all",
                      active
                        ? "border-[#0B1220] bg-[#0B1220] text-[#F8FAFC] shadow-[0_12px_25px_-12px_rgba(16,40,36,0.6)]"
                        : "border-[#0B1220]/15 bg-white text-[#0B1220] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/10",
                    )}
                  >
                    {count.toLocaleString(numberLocale)}
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-medium text-[#1E293B]">
              {interpolate(t.pricing.forStudents, { count: students.toLocaleString(numberLocale) })}
            </p>
          </div>
        </motion.div>

        <div className="mt-10 w-full min-w-0 lg:hidden">
          <Carousel setApi={setCarouselApi} opts={{ align: "start", loop: false }} className="w-full">
            <CarouselContent className="-ml-3 sm:-ml-4">
              {pricingPlans.map((plan, idx) => (
                <CarouselItem key={plan.id} className="basis-[min(100%,22rem)] pl-3 sm:basis-[88%] sm:pl-4">
                  <PricingCard plan={plan} idx={idx} yearly={yearly} students={students} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={t.a11y.choosePlan}>
            {pricingPlans.map((plan, i) => (
              <button
                key={plan.id}
                type="button"
                role="tab"
                aria-selected={carouselIndex === i}
                aria-label={`${plan.name}, ${t.pricing.planLabel} ${i + 1} ${t.pricing.of} ${pricingPlans.length}`}
                onClick={() => carouselApi?.scrollTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  carouselIndex === i ? "w-8 bg-[#0B1220]" : "w-2 bg-[#0B1220]/25 hover:bg-[#1E293B]/40",
                )}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ show: { transition: { staggerChildren: 0.12 } } }}
          className="mt-10 hidden min-w-0 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid lg:grid-cols-3 lg:items-stretch"
        >
          {pricingPlans.map((plan, idx) => (
            <PricingCard key={plan.id} plan={plan} idx={idx} yearly={yearly} students={students} />
          ))}
        </motion.div>

        {/* Mini pricing FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease, delay: 0.2 }}
          className="mt-8 grid gap-4 rounded-3xl border border-[#0B1220]/10 bg-white p-6 shadow-[0_18px_45px_-28px_rgba(16,40,36,0.35)] sm:grid-cols-3 sm:gap-6 sm:p-8"
        >
          {t.pricing.miniFaq.map(({ q, a }) => (
            <div key={q}>
              <p className="text-sm font-bold text-[#0B1220]">{q}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#1E293B]">{a}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// S8 FAQ
// ─────────────────────────────────────────────
function FaqSection() {
  const { t } = useLandingI18n();

  return (
    <section id="faq" className="relative bg-secondary/30 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="text-center"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#0B1220]/10 bg-[#2563EB]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B1220]">
            {t.faq.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.faq.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.faq.subtitle}
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease }}
          className="mt-8 rounded-3xl border border-foreground/10 bg-card p-2 shadow-[0_25px_60px_-30px_rgba(16,40,36,0.4)] sm:p-3"
        >
          <Accordion type="multiple" className="w-full">
            {t.faq.items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-b border-border last:border-b-0">
                <AccordionTrigger className="px-3 py-4 text-left text-sm font-bold hover:no-underline sm:px-4 sm:py-5 sm:text-base">{item.q}</AccordionTrigger>
                <AccordionContent className="px-3 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-4 sm:pb-5">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Scan-to-call QR card
// ─────────────────────────────────────────────
const PHONE_TEL = import.meta.env.PUBLIC_PHONE_TEL ?? "+212777777428";

function CallQrCard() {
  const { t } = useLandingI18n();
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-foreground/10 bg-card p-4 shadow-[0_18px_45px_-28px_rgba(16,40,36,0.35)] sm:gap-5 sm:p-5">

      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">{t.contact.qr.title}</p>
        <p className="mt-1 text-sm font-semibold text-foreground">{t.contact.qr.subtitle}</p>
        <a
          href={`tel:${PHONE_TEL}`}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-foreground underline decoration-foreground/25 underline-offset-4 transition hover:text-primary hover:decoration-primary"
        >
          <Phone className="h-3.5 w-3.5 shrink-0" />
          {t.contact.phoneMorocco}
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Demo request form (calendar + email + center + phone + message)
// ─────────────────────────────────────────────
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function DemoRequestForm({ reduceMotion }: { reduceMotion: boolean | null }) {
  const { t, locale, dir } = useLandingI18n();
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [dateOpen, setDateOpen] = useState(false);

  const centerRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fieldBase =
    "w-full rounded-xl border border-foreground/15 bg-background px-4 py-3 text-sm font-medium outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/40";
  const labelBase = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground";

  const reset = () => {
    setStatus("idle");
    setErrorMsg(null);
    setDate(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const center = centerRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const phone = phoneRef.current?.value.trim() ?? "";
    const message = messageRef.current?.value.trim() ?? "";

    if (!center || !email || !phone || !date) {
      setErrorMsg(t.contact.form.errorRequired);
      return;
    }
    if (!EMAIL_RE.test(email)) {
      setErrorMsg(t.contact.form.errorEmail);
      return;
    }

    setErrorMsg(null);
    setStatus("submitting");
    track("form_submit");

    try {
      const res = await submitDemoRequest({
        data: {
          center,
          email,
          phone,
          preferredDate: format(date, "yyyy-MM-dd"),
          message: message || undefined,
        },
      });
      if (res.ok) {
        track("demo_request_sent", center);
        setStatus("sent");
      } else {
        setErrorMsg(res.error || t.contact.form.errorGeneric);
        setStatus("error");
      }
    } catch {
      setErrorMsg(t.contact.form.errorGeneric);
      setStatus("error");
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease }}
      onSubmit={handleSubmit}
      noValidate
      className="relative z-10 flex min-w-0 flex-col overflow-visible rounded-[2rem] border border-foreground/10 bg-card p-5 shadow-[0_35px_80px_-40px_rgba(16,40,36,0.5)] sm:p-8 lg:p-9"
    >
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4, ease }} className="flex flex-col items-center py-10 text-center">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, delay: 0.1 }} className="grid h-16 w-16 place-items-center rounded-full bg-[#2563EB] text-[#0B1220] shadow-[0_18px_40px_-15px_rgba(168,127,68,0.6)]">
              <Check className="h-8 w-8" strokeWidth={2.5} />
            </motion.div>
            <h3 className="mt-6 text-2xl font-black">{t.contact.form.successTitle}</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t.contact.form.successText}</p>
            <button type="button" onClick={reset} className="mt-6 text-sm font-semibold text-primary underline underline-offset-4 transition hover:text-accent">
              {t.contact.form.retry}
            </button>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
            <p className="text-lg font-black tracking-tight text-foreground">{t.contact.form.heading}</p>

            <div>
              <label htmlFor="dr-center" className={labelBase}>{t.contact.form.centerLabel}</label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute top-1/2 ltr:left-3 rtl:right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input ref={centerRef} id="dr-center" type="text" placeholder={t.contact.form.centerPlaceholder} required aria-required="true" autoComplete="organization" className={cn(fieldBase, "ltr:pl-10 rtl:pr-10")} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor="dr-email" className={labelBase}>{t.contact.form.emailLabel}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 ltr:left-3 rtl:right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input ref={emailRef} id="dr-email" type="email" inputMode="email" placeholder={t.contact.form.emailPlaceholder} required aria-required="true" autoComplete="email" className={cn(fieldBase, "ltr:pl-10 rtl:pr-10")} />
                </div>
              </div>
              <div className="min-w-0">
                <label htmlFor="dr-phone" className={labelBase}>{t.contact.form.phoneLabel}</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 ltr:left-3 rtl:right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input ref={phoneRef} id="dr-phone" type="tel" inputMode="tel" placeholder={t.contact.form.phonePlaceholder} required aria-required="true" autoComplete="tel" className={cn(fieldBase, "ltr:pl-10 rtl:pr-10")} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="dr-date" className={labelBase}>{t.contact.form.dateLabel}</label>
              <Popover open={dateOpen} onOpenChange={setDateOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    id="dr-date"
                    aria-label={t.a11y.pickDate}
                    className={cn(fieldBase, "flex items-center gap-2.5 text-left rtl:text-right", !date && "text-muted-foreground")}
                  >
                    <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">
                      {date ? format(date, "PPP", { locale: getDateFnsLocale(locale) }) : t.contact.form.datePlaceholder}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0" dir={dir}>
                  <CalendarPicker
                    mode="single"
                    selected={date}
                    onSelect={(d) => { setDate(d); setDateOpen(false); }}
                    disabled={{ before: today }}
                    defaultMonth={date ?? today}
                    locale={getDateFnsLocale(locale)}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label htmlFor="dr-message" className={labelBase}>{t.contact.form.messageLabel}</label>
              <div className="relative">
                <MessageSquare className="pointer-events-none absolute top-3 ltr:left-3 rtl:right-3 h-4 w-4 text-muted-foreground" />
                <textarea ref={messageRef} id="dr-message" rows={3} placeholder={t.contact.form.messagePlaceholder} className={cn(fieldBase, "resize-none ltr:pl-10 rtl:pr-10")} />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  key="err"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  role="alert"
                  className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-semibold text-destructive"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={status === "submitting" ? undefined : { scale: 1.03, y: -2 }}
              whileTap={status === "submitting" ? undefined : { scale: 0.97 }}
              type="submit"
              disabled={status === "submitting"}
              className="group relative mt-1 inline-flex w-full shrink-0 items-center justify-center gap-2 overflow-hidden px-6 py-3.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-80 sm:py-4 landing-cta-primary"
            >
              {!reduceMotion && status !== "submitting" && (
                <motion.span className="pointer-events-none absolute inset-0 z-0 bg-white/10" initial={{ x: "-100%" }} whileHover={{ x: "100%" }} transition={{ duration: 0.5 }} />
              )}
              {status === "submitting" ? (
                <>
                  <Loader2 className="relative z-[1] h-4 w-4 animate-spin" />
                  <span className="relative z-[1]">{t.contact.form.submitting}</span>
                </>
              ) : (
                <>
                  <span className="relative z-[1]">{t.contact.form.submit}</span>
                  <Send className="relative z-[1] h-4 w-4 transition group-hover:translate-x-0.5" />
                </>
              )}
            </motion.button>

            <p className="flex shrink-0 items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 shrink-0" /> {t.contact.form.privacy}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.form>
  );
}

// ─────────────────────────────────────────────
// S9 Contact CTA
// ─────────────────────────────────────────────
function ContactSection() {
  const { t } = useLandingI18n();
  const reduceMotion = useReducedMotion();
  return (
    <section id="contact" className="relative overflow-hidden py-14 pb-[max(4rem,calc(4rem+env(safe-area-inset-bottom)))] sm:py-20 sm:pb-[max(5rem,calc(5rem+env(safe-area-inset-bottom)))]">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 right-1/4 h-80 w-80 bg-primary/15 blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 bg-accent/20 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />
      </div>
      <div className="mx-auto grid min-w-0 max-w-7xl gap-8 px-4 sm:gap-10 sm:px-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          className="min-w-0"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#0B1220]/10 bg-[#2563EB]/20 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B1220]">
            {t.contact.badge}
          </motion.div>
          <motion.h2 variants={fadeUp} className="mt-6 text-balance text-3xl font-black tracking-tight sm:text-4xl md:text-5xl">
            {t.contact.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            {t.contact.subtitle}
          </motion.p>
          <motion.ul variants={fadeUp} className="mt-8 space-y-4">
            {(
              [
                { Icon: Globe, text: t.contact.website, href: "https://essor.eiden-group.com" },
                { Icon: Mail, text: t.contact.email, href: "mailto:contact@eiden-group.com" },
                {
                  Icon: MapPin,
                  text: t.contact.address,
                  href: "https://maps.app.goo.gl/e1PTQQJUb3kh7J48A",
                },
              ] as const
            ).map(({ Icon, text, href }) => (
              <li key={text} className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center" style={{color: "var(--essor-blue)"}}>
                  <Icon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                </span>
                <a
                  href={href}
                  {...(href.startsWith("http") ? ({ target: "_blank", rel: "noopener noreferrer" } as const) : {})}
                  className="min-w-0 break-words text-base font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition hover:text-primary hover:decoration-primary"
                >
                  {text}
                </a>
              </li>
            ))}
          </motion.ul>

          <motion.div variants={fadeUp} className="mt-8">
            <CallQrCard />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 space-y-3">
            {t.contact.bullets.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-foreground/70">
                <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={3} />
                {item}
              </div>
            ))}
          </motion.div>
        </motion.div>

        <DemoRequestForm reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Footer
// ─────────────────────────────────────────────
function Footer() {
  const { t } = useLandingI18n();

  return (
    <footer className="border-t border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src={BRAND.logoPath}
                alt={BRAND.name}
                className="h-10 w-auto brightness-0 invert sm:h-12"
              />
            </div>
            <p className="mt-3 text-sm text-background/80 leading-relaxed">
              {t.footer.tagline}
            </p>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background">{t.footer.navigation}</p>
            <ul className="space-y-2 text-sm">
              {[
                { label: t.nav.modules, id: "modules" },
                { label: t.nav.demoInteractive, id: "demo" },
                { label: t.nav.pricing, id: "tarifs" },
                { label: t.nav.faq, id: "faq" },
                { label: t.nav.contact, id: "contact" },
              ].map((item) => (
                <li key={item.id}>
                  <button onClick={() => scrollToId(item.id)} className="text-background transition hover:text-background">{item.label}</button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-background">{t.footer.contact}</p>
            <ul className="space-y-2 text-sm text-background">
              <li>
                <a href={`mailto:${t.contact.email}`} className="transition hover:text-background">
                  {t.contact.email}
                </a>
              </li>
              <li className="text-balance">{t.contact.address}</li>
              <li><a href={`tel:${PHONE_TEL}`} className="transition hover:text-background">{t.footer.phoneMorocco}</a></li>
              <li><a href="https://essor.eiden-group.com" target="_blank" rel="noopener noreferrer" className="transition hover:text-background">{t.footer.website}</a></li>
            </ul>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollToId("contact")}
              className="landing-cta-primary mt-6 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition"
            >
              {t.footer.bookDemo}
              <ArrowRight className="h-3 w-3" />
            </motion.button>
          </div>
        </div>
        <div className="mt-8 flex flex-col-reverse gap-4 border-t border-background/10 pt-6 text-xs text-background/40 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center sm:text-left">{t.footer.copyright}</span>
          {/* <MotionLink to="/login" className="text-center text-background/30 transition hover:text-background/60 sm:text-right">
            Espace client
          </MotionLink> */}
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// Page root
// ─────────────────────────────────────────────
function LandingPage() {
  const { t, dir } = useLandingI18n();

  useEffect(() => {
    document.title = t.meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", t.meta.description);
  }, [t.meta.title, t.meta.description]);

  return (
    <div dir={dir} className="landing-page min-h-screen min-w-0 overflow-x-clip bg-background text-foreground">
      <Header />
      <Hero />
      <PainPointsSection />
      <SolutionSection />
      <ModulesSection />
      <DemoSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
