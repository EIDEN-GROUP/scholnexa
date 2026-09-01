/**
 * Static, non-interactive product shot of the REAL Essor dashboard —
 * used as the hero visual on the landing page. It reproduces the top of
 * `dashboard.index` (vue Direction) at miniature scale: left icon rail,
 * greeting header + chips, workspace tabs, the 4 KPI cards with sparklines,
 * the « Taux de réussite » card (barres par filière), « Aujourd'hui » and
 * the notifications feed. The hero frame crops the bottom with a soft fade.
 *
 * This is intentionally NOT the interactive demo miniature — no tabs, no
 * toasts, no links — just a faithful picture of the current dashboard.
 */
import {
  BookOpen,
  CalendarDays,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PenLine,
  Settings,
  Stethoscope,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";
import {
  mirrorHeroChips,
  mirrorKpis,
  mirrorNotifications,
  mirrorReussite,
} from "@/lib/dashboard-mirror-data";

/* Icônes de la barre latérale — même ordre que `useDashboardNav`. */
const RAIL_ICONS = [
  LayoutDashboard,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Users,
  Stethoscope,
  CreditCard,
  Settings,
] as const;

const NOTIF_ICONS = {
  inscription: UserPlus,
  paiement: Wallet,
  note: PenLine,
} as const;

const TONE_COLORS = {
  teal: "#2563EB",
  amber: "#FF6B4A",
} as const;

/** Sparkline décorative déterministe (même principe que `Sparkline`). */
function MiniSpark({ seed, stroke, w = 64, h = 26 }: { seed: number; stroke: string; w?: number; h?: number }) {
  const pts: number[] = [];
  for (let i = 0; i < 11; i++) {
    pts.push(50 + 30 * Math.sin(i / 1.6 + seed) + 14 * Math.sin(i / 0.7 + seed * 1.7) + i * 1.5);
  }
  const max = Math.max(...pts), min = Math.min(...pts), rng = max - min || 1;
  const coords = pts.map((v, i) => [
    (i / (pts.length - 1)) * w,
    h - 3 - ((v - min) / rng) * (h - 6),
  ]);
  const line = coords.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const gid = `hero-spark-${seed}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="shrink-0">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function seedOf(label: string) {
  let s = 0;
  for (let i = 0; i < label.length; i++) s += label.charCodeAt(i);
  return (s % 9) + 1;
}

export function HeroDashboardShot() {
  return (
    <div className="flex h-full w-full select-none bg-gradient-to-br from-[#F7F9FC] to-[#EEF2F8] text-[#0B1220]">
      {/* ── Barre latérale (rail d'icônes) ── */}
      <aside className="flex w-11 shrink-0 flex-col items-center gap-1 border-r border-[#0B1220]/8 bg-white/80 backdrop-blur-sm py-2.5 sm:w-12">
        <img src={BRAND.logoMarkPath} alt="" className="mb-2 h-6 w-6 object-contain sm:h-7 sm:w-7" />
        {RAIL_ICONS.map((Icon, i) => (
          <span
            key={i}
            className={cn(
              "grid h-6 w-6 place-items-center rounded-lg transition-all sm:h-7 sm:w-7",
              i === 0 
                ? "bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-white shadow-md" 
                : "text-[#0B1220]/60 hover:text-[#0B1220] hover:bg-[#0B1220]/5",
            )}
          >
            <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" strokeWidth={i === 0 ? 2.5 : 1.8} />
          </span>
        ))}
        <span className="mt-auto flex flex-col items-center gap-1.5">
          <LogOut className="h-3 w-3 text-[#0B1220]/50 sm:h-3.5 sm:w-3.5" />
          <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] text-[8px] font-bold text-white shadow-sm sm:h-6 sm:w-6 sm:text-[9px]">
            D
          </span>
        </span>
      </aside>

      {/* ── Contenu ── */}
      <div className="min-w-0 flex-1 px-3 py-3 sm:px-4">
        {/* En-tête : salutation + chips */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold leading-tight tracking-tight sm:text-base">
              Bonjour, Dr. Youssef Benali
            </p>
            <p className="mt-0.5 truncate text-[9px] text-[#0B1220]/60 sm:text-[10px]">
              Directeur · Mardi 25 Août 2026
            </p>
          </div>
          <div className="flex shrink-0 gap-1.5">
            {mirrorHeroChips.map((c) => (
              <div key={c.label} className="rounded-lg border border-[#0B1220]/8 bg-white/90 backdrop-blur px-2 py-1 text-center shadow-sm">
                <p className="text-[6px] font-semibold uppercase tracking-wider text-[#0B1220]/60 sm:text-[7px]">{c.label}</p>
                <p className="font-display text-[11px] font-bold leading-none sm:text-xs">{c.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Onglets du workspace */}
        <div className="mt-2.5 flex items-center gap-1 rounded-full border border-[#0B1220]/8 bg-white/90 backdrop-blur px-1.5 py-1 shadow-sm">
          {[
            { label: "Vue d'ensemble", Icon: LayoutDashboard, active: true },
            { label: "Académique", Icon: BookOpen, active: false },
            { label: "Analyse", Icon: Wallet, active: false },
          ].map(({ label, Icon, active }) => (
            <span
              key={label}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold transition-all sm:text-[9px]",
                active 
                  ? "bg-gradient-to-br from-[#2563EB]/15 to-[#1E40AF]/10 text-[#2563EB] shadow-sm" 
                  : "text-[#0B1220]/60 hover:text-[#0B1220]",
              )}
            >
              <Icon className="h-2.5 w-2.5" />
              {label}
            </span>
          ))}
        </div>

        {/* KPI + Taux de réussite */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          <div className="col-span-1 grid grid-cols-1 gap-2">
            {mirrorKpis.map((k) => (
              <div key={k.label} className="flex items-center justify-between gap-1.5 rounded-xl border border-[#0B1220]/8 bg-white/90 backdrop-blur p-2 shadow-sm hover:shadow-md transition-shadow">
                <div className="min-w-0">
                  <p className="truncate text-[6px] font-semibold uppercase tracking-[0.14em] text-[#0B1220]/60 sm:text-[7px]">
                    {k.label}
                  </p>
                  <p className="mt-0.5 font-display text-sm font-bold leading-none sm:text-base">{k.value}</p>
                </div>
                <MiniSpark seed={seedOf(k.label)} stroke={k.tone === 'teal' ? '#2563EB' : '#FF6B4A'} w={44} h={20} />
              </div>
            ))}
          </div>

          {/* Taux de réussite — barres par filière (dégradé de marque) */}
          <div className="col-span-2 rounded-xl border border-[#0B1220]/8 bg-white/90 backdrop-blur p-2.5 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[6px] font-semibold uppercase tracking-[0.14em] text-[#0B1220]/60 sm:text-[7px]">Taux de réussite</p>
                <p className="font-display text-base font-bold leading-none sm:text-lg">{mirrorReussite.value} %</p>
              </div>
              <div className="flex items-center gap-0.5 rounded-full border border-[#0B1220]/8 bg-[#F7F9FC] p-0.5">
                <span className="rounded-full bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-1.5 py-0.5 text-[6px] font-bold text-white sm:text-[7px]">Réussite</span>
                <span className="px-1.5 py-0.5 text-[6px] font-semibold text-[#0B1220]/60 sm:text-[7px]">Recouvrement</span>
              </div>
            </div>
            <div className="mt-1.5 flex h-[68px] items-end justify-between gap-1 sm:h-[76px]" aria-hidden>
              {mirrorReussite.bars.map((b) => (
                <div key={b.name} className="flex h-full w-full max-w-[26px] flex-col items-center justify-end gap-0.5">
                  <div
                    className="w-full rounded-t-[4px] transition-all hover:opacity-80"
                    style={{
                      height: `${b.value}%`,
                      background: "linear-gradient(180deg, #2563EB 0%, #1E40AF 100%)",
                    }}
                  />
                  <span className="text-[5px] font-semibold text-[#0B1220]/60 sm:text-[6px]">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aujourd'hui — état vide (comme le vrai dashboard) */}
        <div className="mt-2.5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 font-display text-[10px] font-bold sm:text-[11px]">
              <span className="h-2.5 w-0.5 rounded-full bg-gradient-to-b from-[#2563EB] to-[#1E40AF]" aria-hidden />
              Aujourd&rsquo;hui
            </p>
            <span className="text-[7px] font-semibold text-[#2563EB] hover:text-[#1E40AF] transition-colors sm:text-[8px]">Voir le planning →</span>
          </div>
          <div className="mt-1 flex flex-col items-center gap-1 rounded-xl border border-[#0B1220]/8 bg-white/90 backdrop-blur py-3 shadow-sm">
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-[#2563EB]/15 to-[#1E40AF]/10 text-[#2563EB]">
              <CalendarDays className="h-3 w-3" />
            </span>
            <p className="text-[8px] text-[#0B1220]/60 sm:text-[9px]">Aucune séance prévue aujourd&rsquo;hui.</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-2.5">
          <p className="flex items-center gap-1.5 font-display text-[10px] font-bold sm:text-[11px]">
            <span className="h-2.5 w-0.5 rounded-full bg-gradient-to-b from-[#2563EB] to-[#1E40AF]" aria-hidden />
            Notifications
          </p>
          <div className="mt-1 divide-y divide-[#0B1220]/8 overflow-hidden rounded-xl border border-[#0B1220]/8 bg-white/90 backdrop-blur shadow-sm">
            {mirrorNotifications.slice(0, 5).map((n) => {
              const Icon = NOTIF_ICONS[n.type];
              return (
                <div key={n.texte} className="flex items-start gap-1.5 px-2 py-1.5 hover:bg-[#2563EB]/5 transition-colors">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#2563EB]/15 to-[#1E40AF]/10 text-[#2563EB]">
                    <Icon className="h-2 w-2" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[8px] leading-tight font-medium sm:text-[9px]">{n.texte}</span>
                    <span className="block text-[6px] leading-tight text-[#0B1220]/50 sm:text-[7px]">{n.date}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
