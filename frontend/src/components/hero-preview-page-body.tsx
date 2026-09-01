import { Fragment } from "react";
import {
  BellRing,
  BookOpen,
  Building2,
  CalendarDays,
  Download,
  FileUp,
  LayoutDashboard,
  PenLine,
  Plus,
  Search,
  SendHorizontal,
  Upload,
  UserPlus,
  Users,
  Wallet,
} from "lucide-react";
import { useLandingI18n } from "@/lib/landing-i18n";
import { cn } from "@/lib/utils";
import {
  MIRROR_PAGE_SIZE,
  mirrorBulletins,
  mirrorEtudiants,
  mirrorExamens,
  mirrorFormateurs,
  mirrorHeroChips,
  mirrorKpis,
  mirrorNotifications,
  mirrorPaiementKpis,
  mirrorPaiementsRows,
  mirrorPlanning,
  mirrorReussite,
  mirrorSettingsSections,
  mirrorStages,
  STATUT_PAIEMENT_COURT,
  type DashboardMiniaturePageId,
} from "@/lib/dashboard-mirror-data";

const NOTIF_ICONS = {
  inscription: UserPlus,
  paiement: Wallet,
  note: PenLine,
} as const;

const SEANCE_TONE: Record<string, string> = {
  teal: "bg-[#2563EB]/12 text-[#2563EB] border-[#2563EB]/25",
  amber: "bg-[#FF6B4A]/15 text-[#C14A2E] border-[#FF6B4A]/35",
  blue: "bg-[#60A5FA]/15 text-[#1E40AF] border-[#60A5FA]/35",
  violet: "bg-[#A78BFA]/20 text-[#6D28D9] border-[#A78BFA]/40",
};

function MiniPageHeader({
  eyebrow,
  title,
  actions,
}: {
  eyebrow: string;
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-end justify-between gap-1.5">
      <div className="min-w-0">
        <p className="text-[7px] font-medium uppercase tracking-[0.18em] text-[#0B1220]/60 sm:text-[8px]">{eyebrow}</p>
        <p className="font-display text-sm font-bold leading-tight tracking-tight text-[#0B1220] sm:text-base">{title}</p>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-1">{actions}</div> : null}
    </div>
  );
}

function GhostPill({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-[#0B1220]/15 bg-white px-1.5 py-0.5 text-[7px] font-semibold text-[#0B1220] shadow-sm transition hover:border-[#2563EB]/40 hover:bg-[#2563EB]/5 sm:text-[8px]"
    >
      <Icon className="h-2 w-2" />
      {label}
    </button>
  );
}

function GoldPill({ icon: Icon, label, onClick }: { icon: typeof Plus; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-2 py-0.5 text-[7px] font-bold text-white shadow-sm transition hover:shadow-md sm:text-[8px]"
    >
      <Icon className="h-2 w-2" />
      {label}
    </button>
  );
}

export function HeroPreviewPageBody({
  page,
  showLocked,
}: {
  page: DashboardMiniaturePageId;
  showLocked: (msg: string) => void;
}) {
  const { t: tl } = useLandingI18n();
  const lock = () => showLocked(tl.preview.locked.openCard);

  /** Pied « 1–N sur N » des tableaux paginés (5 lignes/page sur le vrai dashboard). */
  const pagerFooter = (total: number, label: string) => (
    <div className="flex shrink-0 items-center justify-between gap-2 border-t border-[#0B1220]/10 px-2.5 py-1.5">
      <p className="text-[7px] tabular-nums text-[#0B1220]/60 sm:text-[8px]">
        1–{Math.min(MIRROR_PAGE_SIZE, total)} sur {total} {label}
      </p>
      <div className="flex items-center gap-1">
        <span className="grid h-4 w-4 place-items-center rounded-full border border-[#0B1220]/15 text-[7px] text-[#0B1220]/60 hover:border-[#2563EB]/40 hover:text-[#2563EB] transition cursor-pointer">‹</span>
        <span className="text-[7px] font-semibold tabular-nums text-[#0B1220] sm:text-[8px]">
          Page 1 / {Math.max(1, Math.ceil(total / MIRROR_PAGE_SIZE))}
        </span>
        <span className="grid h-4 w-4 place-items-center rounded-full border border-[#0B1220]/15 text-[7px] text-[#0B1220]/60 hover:border-[#2563EB]/40 hover:text-[#2563EB] transition cursor-pointer">›</span>
      </div>
    </div>
  );

  const th = "px-1.5 py-1 text-[6px] font-semibold uppercase tracking-wider text-[#0B1220]/60 sm:text-[7px]";
  const td = "px-1.5 py-1 text-[7px] text-[#0B1220] sm:text-[8px]";

  switch (page) {
    /* ──────────────────────────────────────────────────────────────── */
    /*  Tableau de bord — réplique fidèle de `dashboard.index`          */
    /* ──────────────────────────────────────────────────────────────── */
    case "dashboard":
      return (
        <div className="flex h-full min-h-0 flex-col text-[#0B1220]">
          <div className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-2 sm:px-3">
            {/* Salutation + chips */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-display text-xs font-bold tracking-tight sm:text-sm">Bonjour, Dr. Youssef Benali</p>
                <p className="mt-0.5 truncate text-[7px] text-[#0B1220]/60 sm:text-[8px]">Directeur · Mardi 25 Août 2026</p>
              </div>
              <div className="flex shrink-0 gap-1">
                {mirrorHeroChips.map((c) => (
                  <button key={c.label} type="button" onClick={lock} className="rounded-md border border-[#0B1220]/10 bg-white px-1.5 py-0.5 text-center shadow-sm">
                    <p className="text-[5px] font-semibold uppercase tracking-wider text-[#0B1220]/60 sm:text-[6px]">{c.label}</p>
                    <p className="font-display text-[9px] font-bold leading-none sm:text-[10px]">{c.value}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Onglets workspace */}
            <div className="mt-2 flex items-center gap-1 rounded-full border border-[#0B1220]/10 bg-white px-1 py-0.5 shadow-sm">
              {[
                { label: "Vue d'ensemble", Icon: LayoutDashboard, active: true },
                { label: "Académique", Icon: BookOpen, active: false },
                { label: "Analyse", Icon: Wallet, active: false },
              ].map(({ label, Icon, active }) => (
                <button
                  key={label}
                  type="button"
                  onClick={lock}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[7px] font-semibold sm:text-[8px]",
                    active ? "bg-[#2563EB]/8 text-[#0B1220]" : "text-[#0B1220]/60/80 hover:bg-[#2563EB]/5",
                  )}
                >
                  <Icon className="h-2 w-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* KPI + Taux de réussite */}
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              <div className="col-span-1 grid grid-cols-1 gap-1.5">
                {mirrorKpis.map((k) => (
                  <button
                    key={k.label}
                    type="button"
                    onClick={lock}
                    className="flex items-center justify-between gap-1 rounded-lg border border-[#0B1220]/10 bg-white p-1.5 text-left shadow-sm transition hover:border-[#2563EB]/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[5px] font-semibold uppercase tracking-[0.14em] text-[#0B1220]/60 sm:text-[6px]">{k.label}</p>
                      <p className="mt-0.5 font-display text-xs font-bold leading-none sm:text-sm">{k.value}</p>
                    </div>
                    <span className="h-1 w-4 rounded-full" style={{ backgroundColor: k.tone === "amber" ? "#FF6B4A" : "#2563EB" }} />
                  </button>
                ))}
              </div>

              <div className="col-span-2 rounded-lg border border-[#0B1220]/10 bg-white p-2 shadow-sm">
                <div className="flex items-start justify-between gap-1.5">
                  <div>
                    <p className="text-[5px] font-semibold uppercase tracking-[0.14em] text-[#0B1220]/60 sm:text-[6px]">Taux de réussite</p>
                    <p className="font-display text-sm font-bold leading-none sm:text-base">{mirrorReussite.value} %</p>
                  </div>
                  <div className="flex items-center gap-0.5 rounded-full border border-[#0B1220]/10 bg-[#F7F9FC] p-0.5">
                    <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[5px] font-bold text-white sm:text-[6px]">Réussite</span>
                    <button type="button" onClick={lock} className="px-1.5 py-0.5 text-[5px] font-semibold text-[#0B1220]/60 hover:text-[#0B1220] sm:text-[6px]">
                      Recouvrement
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex h-[54px] items-end justify-between gap-0.5 sm:h-[60px]" aria-hidden>
                  {mirrorReussite.bars.map((b) => (
                    <button key={b.name} type="button" onClick={lock} className="flex h-full w-full max-w-[22px] flex-col items-center justify-end gap-0.5">
                      <div
                        className="w-full rounded-t-[3px]"
                        style={{ height: `${b.value}%`, background: "linear-gradient(180deg, rgba(37,99,235,0.95) 0%, rgba(37,99,235,0.5) 100%)" }}
                      />
                      <span className="text-[4px] font-semibold text-[#0B1220]/60 sm:text-[5px]">{b.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Aujourd'hui */}
            <div className="mt-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1 font-display text-[8px] font-bold sm:text-[9px]">
                  <span className="h-2 w-0.5 rounded-full bg-[#2563EB]" aria-hidden />
                  Aujourd&rsquo;hui
                </p>
                <button type="button" onClick={lock} className="text-[6px] font-semibold text-[#0B1220] hover:underline sm:text-[7px]">
                  Voir le planning →
                </button>
              </div>
              <div className="mt-1 flex flex-col items-center gap-0.5 rounded-lg border border-[#0B1220]/10 bg-white py-2 shadow-sm">
                <span className="grid h-4 w-4 place-items-center rounded-md bg-[#2563EB]/10">
                  <CalendarDays className="h-2.5 w-2.5" />
                </span>
                <p className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Aucune séance prévue aujourd&rsquo;hui.</p>
              </div>
            </div>

            {/* Notifications */}
            <div className="mt-2 pb-1">
              <p className="flex items-center gap-1 font-display text-[8px] font-bold sm:text-[9px]">
                <span className="h-2 w-0.5 rounded-full bg-[#2563EB]" aria-hidden />
                Notifications
              </p>
              <div className="mt-1 divide-y divide-[#0B1220]/8 overflow-hidden rounded-lg border border-[#0B1220]/10 bg-white shadow-sm">
                {mirrorNotifications.map((n) => {
                  const Icon = NOTIF_ICONS[n.type];
                  return (
                    <button key={n.texte} type="button" onClick={lock} className="flex w-full items-start gap-1.5 px-2 py-1 text-left transition hover:bg-[#2563EB]/10">
                      <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-[#2563EB]/10">
                        <Icon className="h-2 w-2" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[7px] leading-tight sm:text-[8px]">{n.texte}</span>
                        <span className="block text-[5px] leading-tight text-[#0B1220]/60 sm:text-[6px]">{n.date}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Planning — « Emploi du temps », vue semaine (grille réelle)     */
    /* ──────────────────────────────────────────────────────────────── */
    case "calendar":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Planning"
            title="Emploi du temps"
            actions={
              <>
                <div className="flex items-center gap-0.5 rounded-full border border-[#0B1220]/10 bg-white p-0.5 shadow-sm">
                  <span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[6px] font-bold text-white sm:text-[7px]">Semaine</span>
                  <button type="button" onClick={lock} className="px-1.5 py-0.5 text-[6px] font-semibold text-[#0B1220]/60 hover:text-[#0B1220] sm:text-[7px]">Jour</button>
                </div>
                <GhostPill icon={Upload} label="Importer CSV" onClick={lock} />
                <GhostPill icon={Download} label="Exporter" onClick={lock} />
              </>
            }
          />

          {/* Grille semaine × créneaux (créneaux réels) */}
          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="grid" style={{ gridTemplateColumns: "64px repeat(5, minmax(0, 1fr))" }}>
              <div className={cn(th, "border-b border-[#0B1220]/10 bg-[#2563EB]/5")}>Créneau</div>
              {mirrorPlanning.days.map((d) => (
                <div key={d} className={cn(th, "border-b border-[#0B1220]/10 bg-[#2563EB]/5 text-center")}>{d}</div>
              ))}
              {mirrorPlanning.creneaux.map((creneau, ci) => (
                <Fragment key={`row-${ci}`}>
                  <div className="border-b border-[#0B1220]/8 px-1 py-1 text-[6px] font-semibold tabular-nums text-[#0B1220]/60 sm:text-[7px]">
                    {creneau}
                  </div>
                  {mirrorPlanning.days.map((_, di) => {
                    const seance = mirrorPlanning.seances[di]?.[ci];
                    return seance ? (
                      <button
                        key={`s-${ci}-${di}`}
                        type="button"
                        onClick={lock}
                        className={cn(
                          "m-0.5 rounded-md border px-1 py-0.5 text-left transition hover:brightness-105",
                          SEANCE_TONE[seance.tone],
                        )}
                      >
                        <span className="block truncate text-[6px] font-bold leading-tight sm:text-[7px]">{seance.m}</span>
                        <span className="block truncate text-[5px] leading-tight opacity-75 sm:text-[6px]">{seance.g} · {seance.s}</span>
                      </button>
                    ) : (
                      <div key={`e-${ci}-${di}`} className="m-0.5 rounded-md border border-dashed border-[#0B1220]/8" />
                    );
                  })}
                </Fragment>
              ))}
            </div>
          </div>

          {/* Légende */}
          <div className="flex shrink-0 flex-wrap gap-1">
            {[
              { label: "Cours magistral", tone: "teal" },
              { label: "TP / Labo", tone: "amber" },
              { label: "Imagerie", tone: "blue" },
              { label: "Clinique", tone: "violet" },
            ].map(({ label, tone }) => (
              <span key={label} className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[6px] font-semibold sm:text-[7px]", SEANCE_TONE[tone])}>
                {label}
              </span>
            ))}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Étudiants — CNE · Nom · Filière · Niveau · Statut · Paiement    */
    /* ──────────────────────────────────────────────────────────────── */
    case "etudiants":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Scolarité"
            title="Étudiants"
            actions={
              <>
                <GhostPill icon={Upload} label="Importer" onClick={lock} />
                <GhostPill icon={FileUp} label="Exemple CSV" onClick={lock} />
                <GhostPill icon={Download} label="Exporter" onClick={lock} />
                <GoldPill icon={Plus} label="Ajouter" onClick={() => showLocked(tl.preview.locked.addClient)} />
              </>
            }
          />

          {/* Barre archivés */}
          <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
            <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">
              <strong className="font-semibold text-[#0B1220]">12</strong> étudiant(s) archivé(s)
            </span>
            <span className="h-3 w-px bg-[#2563EB]/10" />
            <span className="text-[7px] font-medium sm:text-[8px]">Afficher les archivés</span>
          </div>

          {/* Filtres */}
          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher par CNE, nom…</span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {["Toutes les filières", "Tous les semestres", "Tous les statuts"].map((f) => (
                <div key={f} className="flex items-center justify-between rounded-md border border-[#0B1220]/10 px-1.5 py-0.5">
                  <span className="truncate text-[6px] text-[#0B1220]/60 sm:text-[7px]">{f}</span>
                  <span className="text-[6px] text-[#0B1220]/60">▾</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>CNE</th>
                    <th className={th}>Nom & prénom</th>
                    <th className={th}>Filière</th>
                    <th className={cn(th, "text-center")}>Niveau</th>
                    <th className={th}>Statut</th>
                    <th className={th}>Paiement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorEtudiants.map((e) => (
                    <tr key={e.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-mono text-[6px] text-[#0B1220]/60 sm:text-[7px]")}>{e.cne}</td>
                      <td className={cn(td, "font-medium")}>{e.nom}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{e.filiere}</td>
                      <td className={cn(td, "text-center font-semibold")}>{e.niveau}</td>
                      <td className={td}>
                        <span className="rounded-full bg-[#2563EB] px-1.5 py-px text-[5px] font-bold uppercase text-white sm:text-[6px]">{e.statut}</span>
                      </td>
                      <td className={td}>
                        <span className={cn("rounded-full px-1.5 py-px text-[5px] font-bold uppercase sm:text-[6px]", STATUT_PAIEMENT_COURT[e.paiement].cls)}>
                          {STATUT_PAIEMENT_COURT[e.paiement].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorEtudiants.length, "étudiants")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Examens — Examen · Module · Groupe · Type · Date · Statut       */
    /* ──────────────────────────────────────────────────────────────── */
    case "examens":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Direction"
            title="Examens"
            actions={<GoldPill icon={Plus} label="Nouvel examen" onClick={lock} />}
          />

          {/* Filtres + résumé */}
          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher par titre, module, formateur…</span>
            </div>
            <p className="mt-1 text-[7px] text-[#0B1220]/60 sm:text-[8px]">
              <strong className="font-semibold text-[#0B1220]">24</strong> examen(s) sur 31 · 27 avec sujet déposé
            </p>
          </div>

          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>Examen</th>
                    <th className={th}>Groupe</th>
                    <th className={th}>Type</th>
                    <th className={th}>Date</th>
                    <th className={th}>Formateur</th>
                    <th className={th}>Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorExamens.map((x) => (
                    <tr key={x.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-medium")}>
                        <span className="block truncate">{x.titre}</span>
                        <span className="block text-[6px] text-[#0B1220]/60 sm:text-[7px]">{x.module}</span>
                      </td>
                      <td className={cn(td, "font-semibold")}>{x.groupe}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{x.type}</td>
                      <td className={cn(td, "tabular-nums text-[#0B1220]/60")}>{x.date}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{x.formateur}</td>
                      <td className={td}>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[5px] font-bold uppercase sm:text-[6px]",
                            x.statut === "Planifié" ? "bg-[#60A5FA]/20 text-[#1E40AF]"
                              : x.statut === "En cours" ? "bg-[#FF6B4A]/20 text-[#C14A2E]"
                                : "bg-[#2563EB]/30 text-[#1E40AF]",
                          )}
                        >
                          {x.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorExamens.length, "examens")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Bulletins — Étudiant · Niveau · Moyenne · Mention · Décision    */
    /* ──────────────────────────────────────────────────────────────── */
    case "bulletins":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Résultats"
            title="Bulletins"
            actions={
              <>
                <span className="rounded-full bg-[#2563EB]/10 px-1.5 py-0.5 text-[7px] font-semibold text-[#0B1220] sm:text-[8px]">
                  {mirrorBulletins.aPublier} à publier
                </span>
                <GoldPill icon={SendHorizontal} label="Tout publier" onClick={lock} />
              </>
            }
          />

          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher un étudiant…</span>
            </div>
          </div>

          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>Étudiant</th>
                    <th className={cn(th, "text-center")}>Niveau</th>
                    <th className={cn(th, "text-right")}>Moyenne</th>
                    <th className={th}>Mention</th>
                    <th className={th}>Décision</th>
                    <th className={th}>Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorBulletins.rows.map((b) => (
                    <tr key={b.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-medium")}>{b.etudiant}</td>
                      <td className={cn(td, "text-center font-semibold")}>{b.niveau}</td>
                      <td className={cn(td, "text-right font-bold tabular-nums")}>{b.moyenne}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{b.mention}</td>
                      <td className={td}>
                        <span className="rounded-lg bg-gradient-to-br from-[#2563EB]/20 to-[#60A5FA]/20 border border-[#2563EB]/30 px-1.5 py-px text-[5px] font-bold uppercase text-[#1E40AF] sm:text-[6px]">{b.decision}</span>
                      </td>
                      <td className={td}>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[5px] font-bold uppercase sm:text-[6px]",
                            b.statut === "Publié" ? "bg-[#2563EB] text-white" : "bg-[#FF6B4A]/20 text-[#C14A2E]",
                          )}
                        >
                          {b.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorBulletins.rows.length, "bulletins")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Formateurs — Matricule · Nom · Département · Modules · Statut   */
    /* ──────────────────────────────────────────────────────────────── */
    case "formateurs":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Corps enseignant"
            title="Formateurs"
            actions={
              <>
                <GhostPill icon={Upload} label="Importer" onClick={lock} />
                <GhostPill icon={Download} label="Exporter" onClick={lock} />
                <GoldPill icon={Plus} label="Ajouter un formateur" onClick={lock} />
              </>
            }
          />

          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher un formateur…</span>
            </div>
          </div>

          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[340px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>Matricule</th>
                    <th className={th}>Nom & prénom</th>
                    <th className={th}>Département</th>
                    <th className={cn(th, "text-center")}>Modules</th>
                    <th className={th}>Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorFormateurs.map((f) => (
                    <tr key={f.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-mono text-[6px] text-[#0B1220]/60 sm:text-[7px]")}>{f.matricule}</td>
                      <td className={cn(td, "font-medium")}>{f.nom}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{f.departement}</td>
                      <td className={cn(td, "text-center")}>
                        <span className="inline-block rounded-full bg-[#2563EB]/10 px-1.5 py-px text-[6px] font-bold sm:text-[7px]">{f.modules}</span>
                      </td>
                      <td className={td}>
                        <span className="rounded-full bg-[#2563EB] px-1.5 py-px text-[5px] font-bold uppercase text-white sm:text-[6px]">{f.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorFormateurs.length, "formateurs")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Stages — Étudiant · Structure · Service · Période · Statut      */
    /* ──────────────────────────────────────────────────────────────── */
    case "stages":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Formation pratique"
            title="Stages cliniques"
            actions={
              <>
                <GhostPill icon={Building2} label="Structures d'accueil" onClick={lock} />
                <GoldPill icon={Users} label="Affectation" onClick={lock} />
              </>
            }
          />

          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher un stagiaire…</span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {["Toutes les filières", "Toutes les structures", "Tous les statuts"].map((f) => (
                <div key={f} className="flex items-center justify-between rounded-md border border-[#0B1220]/10 px-1.5 py-0.5">
                  <span className="truncate text-[6px] text-[#0B1220]/60 sm:text-[7px]">{f}</span>
                  <span className="text-[6px] text-[#0B1220]/60">▾</span>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[360px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>Étudiant</th>
                    <th className={th}>Structure d'accueil</th>
                    <th className={th}>Service</th>
                    <th className={th}>Période</th>
                    <th className={th}>Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorStages.map((s) => (
                    <tr key={s.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-medium")}>{s.etudiant}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{s.structure}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{s.service}</td>
                      <td className={cn(td, "tabular-nums text-[#0B1220]/60")}>{s.periode}</td>
                      <td className={td}>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-px text-[5px] font-bold uppercase sm:text-[6px]",
                            s.statut === "En cours" ? "bg-[#2563EB] text-white"
                              : s.statut === "Validé" ? "bg-[#22D3EE]/30 text-[#0E7490]"
                                : s.statut === "Soutenance" ? "bg-[#60A5FA]/20 text-[#1E40AF]"
                                  : "bg-[#FF6B4A]/20 text-[#C14A2E]",
                          )}
                        >
                          {s.statut}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorStages.length, "stages")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Paiements — 5 KPI + table par étudiant (vue réelle)             */
    /* ──────────────────────────────────────────────────────────────── */
    case "paiements":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader
            eyebrow="Finances"
            title="Paiements"
            actions={
              <>
                <GhostPill icon={BellRing} label="Relances (3)" onClick={lock} />
                <GoldPill icon={Plus} label="Nouveau paiement" onClick={lock} />
              </>
            }
          />

          {/* 5 cartes KPI */}
          <div className="grid shrink-0 grid-cols-5 gap-1">
            {mirrorPaiementKpis.map((k) => (
              <button key={k.label} type="button" onClick={lock} className="rounded-lg border border-[#0B1220]/10 bg-white p-1.5 text-left shadow-sm transition hover:border-[#2563EB]/40">
                <span className="mb-1 block h-0.5 w-4 rounded-full" style={{ backgroundColor: k.tone === "teal" ? "#2563EB" : k.tone === "amber" ? "#FF6B4A" : k.tone === "red" ? "#EF4444" : "#60A5FA" }} />
                <p className="truncate text-[5px] font-semibold uppercase tracking-wider text-[#0B1220]/60 sm:text-[6px]">{k.label}</p>
                <p className="font-display text-[10px] font-bold leading-none sm:text-[11px]">{k.value}</p>
              </button>
            ))}
          </div>

          {/* Filtres */}
          <div className="shrink-0">
            <div className="flex items-center gap-1 rounded-lg border border-[#0B1220]/10 bg-white px-2 py-1 shadow-sm">
              <Search className="h-2.5 w-2.5 shrink-0 text-[#0B1220]/60" />
              <span className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">Rechercher par CNE, étudiant, reçu…</span>
            </div>
            <div className="mt-1 grid grid-cols-3 gap-1">
              {["Toutes les filières", "Tous les semestres", "Tous les statuts"].map((f) => (
                <div key={f} className="flex items-center justify-between rounded-md border border-[#0B1220]/10 px-1.5 py-0.5">
                  <span className="truncate text-[6px] text-[#0B1220]/60 sm:text-[7px]">{f}</span>
                  <span className="text-[6px] text-[#0B1220]/60">▾</span>
                </div>
              ))}
            </div>
          </div>

          {/* Table par étudiant */}
          <div className="shrink-0 overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[380px] text-left">
                <thead>
                  <tr className="border-b border-[#0B1220]/10 bg-[#2563EB]/5">
                    <th className={th}>Étudiant</th>
                    <th className={th}>Filière</th>
                    <th className={cn(th, "text-center")}>Semestre</th>
                    <th className={cn(th, "text-right")}>Total réglé</th>
                    <th className={cn(th, "text-right")}>Reste dû</th>
                    <th className={th}>Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0B1220]/8">
                  {mirrorPaiementsRows.map((r) => (
                    <tr key={r.id} className="hover:bg-[#2563EB]/10">
                      <td className={cn(td, "font-medium")}>{r.etudiant}</td>
                      <td className={cn(td, "text-[#0B1220]/60")}>{r.filiere}</td>
                      <td className={cn(td, "text-center font-semibold")}>{r.semestre}</td>
                      <td className={cn(td, "text-right font-semibold tabular-nums")}>{r.regle} MAD</td>
                      <td className={cn(td, "text-right tabular-nums", r.reste === "0" ? "text-[#0B1220]/60" : "font-semibold text-[#9A2F2F]")}>
                        {r.reste} MAD
                      </td>
                      <td className={td}>
                        <span className={cn("rounded-full px-1.5 py-px text-[5px] font-bold uppercase sm:text-[6px]", STATUT_PAIEMENT_COURT[r.statut].cls)}>
                          {STATUT_PAIEMENT_COURT[r.statut].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {pagerFooter(mirrorPaiementsRows.length, "étudiants")}
          </div>
        </div>
      );

    /* ──────────────────────────────────────────────────────────────── */
    /*  Paramètres — sections réelles du module Paramètres              */
    /* ──────────────────────────────────────────────────────────────── */
    case "settings":
      return (
        <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-y-auto overscroll-contain text-[#0B1220]">
          <MiniPageHeader eyebrow="Administration" title="Paramètres" />

          <div className="grid shrink-0 gap-1.5 sm:grid-cols-2">
            {mirrorSettingsSections.map((s) => (
              <div key={s.title} className="overflow-hidden rounded-xl border border-[#0B1220]/10 bg-white shadow-sm">
                <div className="border-b border-[#0B1220]/10 px-2 py-1.5">
                  <p className="font-display text-[10px] font-semibold sm:text-[11px]">{s.title}</p>
                  <p className="text-[7px] text-[#0B1220]/60 sm:text-[8px]">{s.desc}</p>
                </div>
                <ul className="divide-y divide-[#0B1220]/8">
                  {s.rows.map((r) => (
                    <li key={r.label} className="flex items-center justify-between gap-2 px-2 py-1">
                      <span className="truncate text-[7px] text-[#0B1220]/60 sm:text-[8px]">{r.label}</span>
                      <span className="shrink-0 text-[7px] font-semibold tabular-nums sm:text-[8px]">{r.value}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-end border-t border-[#0B1220]/10 px-2 py-1.5">
                  <button type="button" onClick={lock} className="rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-2 py-0.5 text-[7px] font-bold text-white shadow-sm transition hover:shadow-md sm:text-[8px]">
                    Enregistrer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
