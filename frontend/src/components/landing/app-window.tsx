import { cn } from "@/lib/utils";
import { EssorMark } from "./brand";
import { track } from "@/lib/analytics";
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Stethoscope,
  Users,
  Search,
  Bell,
  ArrowRight,
  LayoutGrid,
  BarChart3,
  UserPlus,
  Wallet,
  PenLine,
  Clock,
} from "lucide-react";

/**
 * Aperçu fidèle du tableau de bord Essor réel (route /dashboard, vue directeur,
 * onglet « Vue d'ensemble »). La barre latérale, l'en-tête à pastilles, les
 * onglets, les cartes KPI + graphe « réussite » et le tableau « Aujourd'hui »
 * reprennent les surfaces effectives du produit. Toute la carte ouvre la démo.
 */

const NAV = [
  { icon: LayoutDashboard, label: "Tableau de bord", c: "var(--blue)", active: true },
  { icon: CalendarDays, label: "Planning", c: "var(--lavender)" },
  { icon: GraduationCap, label: "Étudiants", c: "var(--sky)" },
  { icon: BookOpen, label: "Scolarité", c: "var(--lavender)" },
  { icon: Users, label: "Formateurs", c: "var(--blue)" },
  { icon: Stethoscope, label: "Stages cliniques", c: "var(--sky)" },
  { icon: CreditCard, label: "Paiements", c: "var(--coral)" },
  { icon: Settings, label: "Paramètres", c: "var(--muted-foreground)" },
];

const CHIPS = [
  { k: "Étudiants", v: "312" },
  { k: "Séances ajd", v: "7" },
  { k: "Réussite", v: "79 %" },
];

const KPIS = [
  { k: "Étudiants actifs", v: "294", icon: Users, c: "var(--blue)" },
  { k: "Formateurs actifs", v: "8", icon: Users, c: "var(--blue)" },
  { k: "Examens à venir", v: "5", icon: BookOpen, c: "var(--coral)" },
  { k: "Bulletins à publier", v: "12", icon: PenLine, c: "var(--coral)" },
];

const REUSSITE_BARS = [82, 76, 91, 68, 88, 79];

const SEANCES = [
  { h: "08:30", m: "Soins infirmiers", p: "N. Amrani", g: "S5-G1", s: "A2", t: "Cours", c: "bg-blue" },
  { h: "10:45", m: "Pharmacologie", p: "K. Sekkat", g: "S5-G2", s: "B1", t: "TD", c: "bg-lavender" },
  { h: "14:00", m: "Anatomie dentaire", p: "Y. Benali", g: "S1-B", s: "C3", t: "TP", c: "bg-sky" },
];

const FEED = [
  { icon: UserPlus, t: "Nouvelle inscription · Salma Idrissi", d: "Aujourd'hui" },
  { icon: Wallet, t: "Paiement reçu · 1 200 DH · O. Tazi", d: "Hier" },
];

function Spark({ stroke }: { stroke: string }) {
  return (
    <svg width={64} height={26} viewBox="0 0 64 26" aria-hidden className="shrink-0">
      <path
        d="M0 20 L11 14 L22 17 L33 8 L44 12 L55 5 L64 9"
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AppWindow({ className }: { className?: string }) {
  return (
    <a
      href="#tarifs"
      onClick={() => track("CTA Clicked", { location: "hero-preview", label: "Aperçu tableau de bord" })}
      className={cn(
        "group/aw relative block overflow-hidden rounded-2xl border border-border/80 bg-card shadow-float transition-transform duration-300 hover:-translate-y-1",
        className,
      )}
    >
      {/* chrome */}
      <div className="flex items-center gap-3 border-b border-border/70 bg-mist/70 px-4 py-3">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-coral/70" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex min-w-0 items-center gap-2 rounded-full bg-card px-3 py-1 text-[11px] text-muted-foreground">
          <Search className="size-3 shrink-0" />
          <span className="truncate">app.essor.ma / tableau de bord</span>
        </div>
        <Bell className="size-3.5 shrink-0 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] sm:grid-cols-[176px_minmax(0,1fr)]">
        {/* sidebar */}
        <aside className="hidden flex-col gap-0.5 border-r border-border/70 bg-card p-3 sm:flex">
          <div className="mb-3 flex items-center gap-2 px-1">
            <EssorMark className="h-5" />
            <span className="font-display text-xs font-bold tracking-tight">Essor</span>
          </div>
          {NAV.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px]",
                item.active
                  ? "bg-[#05142A] font-semibold text-white"
                  : "font-medium text-muted-foreground",
              )}
            >
              <item.icon
                className="size-3.5 shrink-0"
                style={{ color: item.active ? "#fff" : item.c }}
              />
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </aside>

        {/* content */}
        <div className="min-w-0 bg-paper/60 p-4 sm:p-5">
          {/* header */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-display text-lg font-bold tracking-tight">Bonjour, M. Benali</h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Directeur <span aria-hidden>·</span> lundi 1 septembre 2026
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CHIPS.map((c) => (
                <div
                  key={c.k}
                  className="rounded-xl border border-border/70 bg-card px-2.5 py-1.5"
                >
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {c.k}
                  </p>
                  <p className="font-display text-xs font-bold leading-none">{c.v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* tabs */}
          <div className="mt-3 flex gap-1 border-b border-border/70 text-[10px] font-medium">
            {[
              { l: "Vue d'ensemble", i: LayoutGrid, active: true },
              { l: "Académique", i: GraduationCap },
              { l: "Analyse", i: BarChart3 },
            ].map((t) => (
              <span
                key={t.l}
                className={cn(
                  "relative flex items-center gap-1.5 px-2.5 py-2",
                  t.active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <t.i className={cn("size-3", t.active ? "text-ink" : "")} />
                {t.l}
                {t.active ? (
                  <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-ink" />
                ) : null}
              </span>
            ))}
          </div>

          {/* kpi grid + réussite */}
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-2.5">
              {KPIS.map((s) => (
                <div key={s.k} className="rounded-xl border border-border/70 bg-card p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded-lg"
                      style={{
                        background: `color-mix(in srgb, ${s.c} 12%, transparent)`,
                        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${s.c} 22%, transparent)`,
                      }}
                    >
                      <s.icon className="size-3" style={{ color: s.c }} />
                    </span>
                    <p className="truncate text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {s.k}
                    </p>
                  </div>
                  <div className="mt-1.5 flex items-end justify-between gap-1">
                    <p className="font-display text-[15px] font-extrabold tracking-tight">{s.v}</p>
                    <Spark stroke={s.c} />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-border/70 bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Taux de réussite
                  </p>
                  <p className="mt-0.5 font-display text-lg font-bold leading-none tracking-tight">
                    79 %
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-border/70 bg-muted/60 p-0.5 text-[8px] font-semibold">
                  <span className="rounded-full bg-ink px-2 py-0.5 text-white">Réussite</span>
                  <span className="px-1.5 py-0.5 text-muted-foreground">Recouvrement</span>
                </div>
              </div>
              <div className="mt-3 flex h-16 items-end gap-2">
                {REUSSITE_BARS.map((h, i) => (
                  <span
                    key={i}
                    className="flex-1 rounded-t-sm bg-gradient-to-t from-blue/50 to-blue"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* aujourd'hui */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="flex items-center gap-1.5 font-display text-[11px] font-bold tracking-tight">
                <span aria-hidden className="h-3 w-0.5 rounded-full bg-ink" />
                Aujourd&rsquo;hui
              </p>
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-ink">
                Voir le planning <ArrowRight className="size-2.5" />
              </span>
            </div>
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card">
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 border-b border-border/60 bg-muted/40 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Horaire</span>
                <span>Module · Professeur</span>
                <span>Groupe</span>
              </div>
              {SEANCES.map((s) => (
                <div
                  key={s.h}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-x-3 border-b border-border/40 px-3 py-2 last:border-0"
                >
                  <span className="flex items-center gap-1 font-mono text-[9px] text-muted-foreground">
                    <Clock className="size-2.5" />
                    {s.h}
                  </span>
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className={cn("h-4 w-0.5 shrink-0 rounded-full", s.c)} />
                    <span className="truncate text-[10px]">
                      <span className="font-medium">{s.m}</span>
                      <span className="text-muted-foreground"> · {s.p}</span>
                    </span>
                  </span>
                  <span className="text-[9px] text-muted-foreground">{s.g}</span>
                </div>
              ))}
            </div>
          </div>

          {/* notifications */}
          <div className="mt-3">
            <p className="mb-2 flex items-center gap-1.5 font-display text-[11px] font-bold tracking-tight">
              <span aria-hidden className="h-3 w-0.5 rounded-full bg-ink" />
              Notifications
            </p>
            <div className="divide-y divide-border/40 overflow-hidden rounded-xl border border-border/70 bg-card">
              {FEED.map((f) => (
                <div key={f.t} className="flex items-center gap-2.5 px-3 py-2">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-ink/10 text-ink">
                    <f.icon className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[10px]">{f.t}</span>
                  <span className="shrink-0 text-[8px] text-muted-foreground">{f.d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* hover → démo en direct */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 bg-gradient-to-t from-[#05142A]/85 to-transparent py-4 text-[0.8rem] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover/aw:opacity-100">
        Demander une démo <ArrowRight className="size-3.5" />
      </span>
    </a>
  );
}
