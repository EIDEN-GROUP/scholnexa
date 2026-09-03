/**
 * Vues du calendrier | Jour, Semaine, Mois.
 *
 * Jour et Semaine partagent une grille horaire : chaque séance est positionnée
 * en absolu d'après son heure de début et sa durée, comme un agenda classique.
 * Les séances qui se chevauchent sont réparties sur des colonnes. La vue Mois
 * empile des pastilles compactes.
 *
 * Le glisser-déposer est piloté par `canDrag`. `conflictIds` marque en rouge
 * les séances en conflit (professeur / salle / groupe).
 */
import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import {
  couleurSeance,
  minutesDepuisMinuit,
  isoDate,
  CRENEAUX,
  PLANNING_HEURE_DEBUT,
  PLANNING_HEURE_FIN,
  TYPE_SEANCE_LABEL,
  type Seance,
} from "@/lib/istpm-data";
import { cn } from "@/lib/utils";

export type VueCalendrier = "jour" | "semaine" | "mois";

/** Hauteur d'une heure dans la grille, en pixels. */
const HEURE_PX = 68;
const MINUTE_PX = HEURE_PX / 60;
/** Granularité du dépôt : les séances s'alignent sur 15 minutes. */
const PAS_MINUTES = 15;

const JOURS_COURTS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const JOURS_LONGS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export function estAujourdhui(d: Date) {
  return isoDate(d) === isoDate(new Date());
}

/** Minute courante depuis minuit (pour le trait « maintenant »). */
function useMinuteCourante() {
  const [m, setM] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });
  useEffect(() => {
    const id = setInterval(() => {
      const n = new Date();
      setM(n.getHours() * 60 + n.getMinutes());
    }, 60_000);
    return () => clearInterval(id);
  }, []);
  return m;
}

/* ------------------------------------------------------------------ */
/*  Bloc de séance                                                     */
/* ------------------------------------------------------------------ */

function SeanceBloc({
  seance,
  nomProf,
  canDrag,
  dense,
  enConflit,
  onOpen,
  onDragStart,
}: {
  seance: Seance;
  nomProf: string;
  canDrag: boolean;
  dense?: boolean;
  enConflit?: boolean;
  onOpen: (s: Seance) => void;
  onDragStart: (s: Seance, e: DragEvent) => void;
}) {
  const c = couleurSeance(seance.module);
  const duree = minutesDepuisMinuit(seance.fin) - minutesDepuisMinuit(seance.debut);
  const court = duree <= 40;
  const moyen = duree <= 75;

  return (
    <button
      type="button"
      draggable={canDrag}
      onDragStart={(e) => onDragStart(seance, e)}
      onClick={() => onOpen(seance)}
      title={`${seance.module} · ${nomProf} · ${seance.groupe} · ${seance.salle} · ${seance.debut}–${seance.fin}`}
      className={cn(
        "group flex h-full w-full flex-col gap-px overflow-hidden rounded-[6px] py-1 pe-1.5 ps-2.5 text-start",
        "transition-[filter,box-shadow] duration-150",
        "hover:z-20 hover:shadow-[0_6px_16px_-8px_rgb(var(--istpm-ink-rgb)/0.25)] hover:brightness-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
      )}
      style={{
        backgroundColor: c.soft,
        color: c.text,
        boxShadow: `inset 3px 0 0 ${enConflit ? "var(--alert)" : c.bg}`,
      }}
    >
      <span
        className={cn(
          "truncate font-semibold leading-[1.2]",
          dense || court ? "text-[10px]" : "text-[11.5px]",
        )}
      >
        {seance.module}
      </span>

      {court || dense ? (
        <span className="truncate text-[9.5px] opacity-65">
          {seance.debut} · {seance.groupe}
        </span>
      ) : (
        <>
          <span className="truncate text-[10px] tabular-nums opacity-70">
            {seance.debut}–{seance.fin}
          </span>
          <span className="truncate text-[10px] opacity-55">
            {moyen ? `${seance.salle} · ${seance.groupe}` : `${nomProf} · ${seance.groupe}`}
          </span>
          {!moyen ? <span className="truncate text-[10px] opacity-45">{seance.salle}</span> : null}
        </>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Disposition des chevauchements                                     */
/* ------------------------------------------------------------------ */

type Place = { seance: Seance; colonne: number; colonnes: number };

/** Répartit les séances qui se chevauchent sur plusieurs colonnes. */
function disposer(seances: Seance[]): Place[] {
  const tri = [...seances].sort(
    (a, b) => minutesDepuisMinuit(a.debut) - minutesDepuisMinuit(b.debut),
  );
  const places: Place[] = [];
  let groupe: Seance[] = [];
  let finGroupe = -1;

  const vider = () => {
    if (!groupe.length) return;
    const colonnes: Seance[][] = [];
    for (const s of groupe) {
      let placee = false;
      for (const col of colonnes) {
        const derniere = col[col.length - 1];
        if (minutesDepuisMinuit(s.debut) >= minutesDepuisMinuit(derniere.fin)) {
          col.push(s);
          placee = true;
          break;
        }
      }
      if (!placee) colonnes.push([s]);
    }
    colonnes.forEach((col, i) =>
      col.forEach((s) => places.push({ seance: s, colonne: i, colonnes: colonnes.length })),
    );
    groupe = [];
    finGroupe = -1;
  };

  for (const s of tri) {
    const d = minutesDepuisMinuit(s.debut);
    if (groupe.length && d >= finGroupe) vider();
    groupe.push(s);
    finGroupe = Math.max(finGroupe, minutesDepuisMinuit(s.fin));
  }
  vider();
  return places;
}

/* ------------------------------------------------------------------ */
/*  Grille horaire (Jour / Semaine)                                    */
/* ------------------------------------------------------------------ */

function GrilleHoraire({
  jours,
  seances,
  nomProf,
  canDrag,
  conflictIds,
  onOpen,
  onDrop,
  onCreneauVide,
}: {
  jours: Date[];
  seances: Seance[];
  nomProf: (id: string) => string;
  canDrag: boolean;
  conflictIds?: Set<string>;
  onOpen: (s: Seance) => void;
  onDrop: (id: string, date: string, debut: string) => void;
  onCreneauVide?: (date: string, debut: string) => void;
}) {
  const heures = useMemo(() => {
    const out: number[] = [];
    for (let h = PLANNING_HEURE_DEBUT; h <= PLANNING_HEURE_FIN; h += 1) out.push(h);
    return out;
  }, []);

  const hauteur = (PLANNING_HEURE_FIN - PLANNING_HEURE_DEBUT) * HEURE_PX;
  const dragId = useRef<string | null>(null);
  const [survol, setSurvol] = useState<{ iso: string; y: number } | null>(null);
  const minuteMaintenant = useMinuteCourante();
  const topMaintenant = (minuteMaintenant - PLANNING_HEURE_DEBUT * 60) * MINUTE_PX;
  const maintenantVisible =
    minuteMaintenant >= PLANNING_HEURE_DEBUT * 60 && minuteMaintenant <= PLANNING_HEURE_FIN * 60;

  /** Convertit une position verticale en heure alignée sur le pas. */
  const heureDepuisY = (y: number) => {
    const minutes = Math.max(0, y / MINUTE_PX);
    const cale = Math.round(minutes / PAS_MINUTES) * PAS_MINUTES;
    const total = PLANNING_HEURE_DEBUT * 60 + cale;
    const h = Math.min(PLANNING_HEURE_FIN, Math.floor(total / 60));
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-brand/10 bg-card">
      <div
        className="grid min-w-[44rem]"
        style={{ gridTemplateColumns: `3.25rem repeat(${jours.length}, minmax(8.5rem, 1fr))` }}
      >
        {/* En-tête */}
        <div className="sticky top-0 z-30 border-b border-brand/10 bg-card" />
        {jours.map((j) => {
          const today = estAujourdhui(j);
          return (
            <div
              key={j.toISOString()}
              className="sticky top-0 z-30 flex items-center justify-center gap-2 border-b border-s border-brand/10 bg-card px-2 py-2.5"
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {JOURS_COURTS[(j.getDay() + 6) % 7]}
              </span>
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold tabular-nums",
                  today ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {j.getDate()}
              </span>
            </div>
          );
        })}

        {/* Colonne des heures */}
        <div className="relative" style={{ height: hauteur }}>
          {heures.slice(0, -1).map((h, i) => (
            <div
              key={h}
              className="absolute end-1.5 -translate-y-1/2 text-[10px] font-medium tabular-nums text-muted-foreground/70"
              style={{ top: i * HEURE_PX }}
            >
              {String(h).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {jours.map((j) => {
          const iso = isoDate(j);
          const duJour = seances.filter((s) => s.date === iso);
          const places = disposer(duJour);
          const today = estAujourdhui(j);

          return (
            <div
              key={iso}
              className={cn(
                "relative border-s border-brand/10",
                survol?.iso === iso && canDrag && "bg-primary/[0.04]",
              )}
              style={{ height: hauteur }}
              onDragOver={(e) => {
                if (!canDrag) return;
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                setSurvol({ iso, y: e.clientY - rect.top });
              }}
              onDragLeave={() => setSurvol((v) => (v?.iso === iso ? null : v))}
              onDrop={(e) => {
                if (!canDrag || !dragId.current) return;
                e.preventDefault();
                const rect = e.currentTarget.getBoundingClientRect();
                onDrop(dragId.current, iso, heureDepuisY(e.clientY - rect.top));
                dragId.current = null;
                setSurvol(null);
              }}
            >
              {/* Lignes horaires (une par heure) */}
              {heures.slice(0, -1).map((h, i) => (
                <button
                  key={h}
                  type="button"
                  aria-label={`Créer une séance à ${String(h).padStart(2, "0")}:00`}
                  className="absolute inset-x-0 cursor-pointer border-t border-brand/[0.06] hover:bg-primary/[0.03]"
                  style={{ top: i * HEURE_PX, height: HEURE_PX }}
                  onClick={() => onCreneauVide?.(iso, `${String(h).padStart(2, "0")}:00`)}
                />
              ))}

              {/* Trait « maintenant » */}
              {today && maintenantVisible ? (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                  style={{ top: topMaintenant }}
                >
                  <span className="h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-alert" />
                  <span className="h-px flex-1 bg-alert/70" />
                </div>
              ) : null}

              {/* Indicateur de dépôt */}
              {survol?.iso === iso && canDrag ? (
                <div
                  className="pointer-events-none absolute inset-x-1 z-10 rounded-[6px] border border-dashed border-primary/50 bg-primary/[0.08]"
                  style={{
                    top: Math.round(survol.y / MINUTE_PX / PAS_MINUTES) * PAS_MINUTES * MINUTE_PX,
                    height: 18,
                  }}
                />
              ) : null}

              {places.map(({ seance, colonne, colonnes }) => {
                const top =
                  (minutesDepuisMinuit(seance.debut) - PLANNING_HEURE_DEBUT * 60) * MINUTE_PX;
                const h =
                  (minutesDepuisMinuit(seance.fin) - minutesDepuisMinuit(seance.debut)) * MINUTE_PX;
                const largeur = 100 / colonnes;
                return (
                  <div
                    key={seance.id}
                    className="absolute p-[2px]"
                    style={{
                      top,
                      height: Math.max(h, 24),
                      insetInlineStart: `${colonne * largeur}%`,
                      width: `${largeur}%`,
                    }}
                  >
                    <SeanceBloc
                      seance={seance}
                      nomProf={nomProf(seance.professeurId)}
                      canDrag={canDrag}
                      dense={colonnes > 1}
                      enConflit={conflictIds?.has(seance.id)}
                      onOpen={onOpen}
                      onDragStart={(s, e) => {
                        dragId.current = s.id;
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData("text/plain", s.id);
                      }}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vues exportées                                                     */
/* ------------------------------------------------------------------ */

type GrilleProps = {
  seances: Seance[];
  nomProf: (id: string) => string;
  canDrag: boolean;
  conflictIds?: Set<string>;
  onOpen: (s: Seance) => void;
  onDrop: (id: string, date: string, debut: string) => void;
  onCreneauVide?: (date: string, debut: string) => void;
};

/* ------------------------------------------------------------------ */
/*  Vue Jour | agenda vertical (une ligne par créneau)                 */
/* ------------------------------------------------------------------ */

export function VueJour({
  date,
  seances,
  nomProf,
  canDrag,
  conflictIds,
  onOpen,
  onDrop,
  onCreneauVide,
}: GrilleProps & { date: Date }) {
  const iso = isoDate(date);
  const today = estAujourdhui(date);
  const minuteMaintenant = useMinuteCourante();
  const dragId = useRef<string | null>(null);
  const [survol, setSurvol] = useState<number | null>(null);

  const duJour = seances
    .filter((s) => s.date === iso)
    .sort((a, b) => minutesDepuisMinuit(a.debut) - minutesDepuisMinuit(b.debut));
  const horsCreneau = duJour.filter((s) => creneauDe(s) === -1);

  const handleDragStart = (s: Seance, e: DragEvent) => {
    dragId.current = s.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", s.id);
  };

  const jourLabel = JOURS_LONGS[(date.getDay() + 6) % 7];

  return (
    <div className="overflow-hidden rounded-xl border border-brand/10 bg-card">
      <div className="flex items-baseline gap-2 border-b border-brand/10 px-5 py-3">
        <span className="text-[0.72rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {jourLabel}
        </span>
        <span
          className={cn(
            "grid size-6 place-items-center rounded-full text-[0.8rem] font-semibold tabular-nums",
            today ? "bg-primary text-primary-foreground" : "text-foreground",
          )}
        >
          {date.getDate()}
        </span>
        <span className="ms-auto text-[0.72rem] text-muted-foreground">
          {duJour.length} séance{duJour.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-brand/[0.06]">
        {CRENEAUX.map((creneau, i) => {
          const dansCreneau = duJour.filter((s) => creneauDe(s) === i);
          const debutMin = minutesDepuisMinuit(creneau.debut);
          const finMin = minutesDepuisMinuit(creneau.fin);
          const enCours = today && minuteMaintenant >= debutMin && minuteMaintenant < finMin;
          const cle = i;

          return (
            <div
              key={i}
              className={cn(
                "grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-4 py-2.5 transition-colors",
                enCours && "bg-primary/[0.03]",
                survol === cle && canDrag && "bg-primary/[0.06] ring-1 ring-inset ring-primary/40",
              )}
              onDragOver={(e) => {
                if (!canDrag) return;
                e.preventDefault();
                setSurvol(cle);
              }}
              onDragLeave={() => setSurvol((v) => (v === cle ? null : v))}
              onDrop={(e) => {
                if (!canDrag || !dragId.current) return;
                e.preventDefault();
                onDrop(dragId.current, iso, creneau.debut);
                dragId.current = null;
                setSurvol(null);
              }}
            >
              <div className="flex flex-col pt-1 text-end">
                <span className="text-[0.78rem] font-semibold tabular-nums text-foreground">
                  {creneau.debut}
                </span>
                <span className="text-[0.7rem] tabular-nums text-muted-foreground/70">
                  {creneau.fin}
                </span>
                {enCours ? (
                  <span className="mt-1 inline-flex items-center justify-end gap-1 text-[0.6rem] font-bold uppercase tracking-wide text-alert">
                    <span className="size-1.5 rounded-full bg-alert" /> maintenant
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 space-y-1.5 py-0.5">
                {dansCreneau.length ? (
                  dansCreneau.map((s) => (
                    <CarteSeance
                      key={s.id}
                      seance={s}
                      nomProf={nomProf(s.professeurId)}
                      canDrag={canDrag}
                      enConflit={conflictIds?.has(s.id)}
                      onOpen={onOpen}
                      onDragStart={handleDragStart}
                    />
                  ))
                ) : onCreneauVide ? (
                  <button
                    type="button"
                    onClick={() => onCreneauVide(iso, creneau.debut)}
                    className="flex w-full items-center gap-2 rounded-[7px] border border-dashed border-brand/15 px-3 py-2 text-[0.78rem] text-muted-foreground/60 transition-colors hover:border-primary/40 hover:bg-primary/[0.04] hover:text-primary"
                  >
                    <span className="text-base leading-none">+</span> Créneau libre
                  </button>
                ) : (
                  <p className="px-1 py-1.5 text-[0.78rem] text-muted-foreground/45">Libre</p>
                )}
              </div>
            </div>
          );
        })}

        {horsCreneau.length ? (
          <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3 px-4 py-2.5">
            <span className="pt-1 text-end text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground/70">
              Autres
            </span>
            <div className="min-w-0 space-y-1.5">
              {horsCreneau.map((s) => (
                <CarteSeance
                  key={s.id}
                  seance={s}
                  nomProf={nomProf(s.professeurId)}
                  canDrag={canDrag}
                  enConflit={conflictIds?.has(s.id)}
                  onOpen={onOpen}
                  onDragStart={handleDragStart}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vue Semaine | matrice par créneau (emploi du temps)               */
/* ------------------------------------------------------------------ */

/** Créneau auquel appartient une séance (celui qui contient son début). */
function creneauDe(s: Seance): number {
  const d = minutesDepuisMinuit(s.debut);
  const i = CRENEAUX.findIndex(
    (c) => d >= minutesDepuisMinuit(c.debut) && d < minutesDepuisMinuit(c.fin),
  );
  return i;
}

function CarteSeance({
  seance,
  nomProf,
  canDrag,
  enConflit,
  onOpen,
  onDragStart,
}: {
  seance: Seance;
  nomProf: string;
  canDrag: boolean;
  enConflit?: boolean;
  onOpen: (s: Seance) => void;
  onDragStart: (s: Seance, e: DragEvent) => void;
}) {
  const c = couleurSeance(seance.module);
  const horsCreneau = creneauDe(seance) === -1;
  return (
    <button
      type="button"
      draggable={canDrag}
      onDragStart={(e) => onDragStart(seance, e)}
      onClick={() => onOpen(seance)}
      title={`${seance.module} · ${nomProf} · ${seance.groupe} · ${seance.salle} · ${seance.debut}–${seance.fin}`}
      className={cn(
        "block w-full overflow-hidden rounded-[7px] px-2.5 py-1.5 text-start transition-[filter,box-shadow] duration-150",
        "hover:z-20 hover:shadow-[0_6px_16px_-8px_rgb(var(--istpm-ink-rgb)/0.25)] hover:brightness-[0.985]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        canDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
      )}
      style={{
        backgroundColor: c.soft,
        color: c.text,
        boxShadow: `inset 3px 0 0 ${enConflit ? "var(--alert)" : c.bg}`,
      }}
    >
      <span className="block truncate text-[11.5px] font-semibold leading-[1.25]">
        {seance.module}
      </span>
      <span className="mt-0.5 block truncate text-[10px] opacity-60">
        {seance.salle} · {seance.groupe}
      </span>
      <span className="block truncate text-[10px] opacity-45">
        {nomProf}
        {horsCreneau ? (
          <span className="ms-1 tabular-nums opacity-80">
            · {seance.debut}–{seance.fin}
          </span>
        ) : null}
      </span>
    </button>
  );
}

export function VueSemaine({
  jours,
  seances,
  nomProf,
  canDrag,
  conflictIds,
  onOpen,
  onDrop,
  onCreneauVide,
}: GrilleProps & { jours: Date[] }) {
  const dragId = useRef<string | null>(null);
  const [survol, setSurvol] = useState<string | null>(null);

  const parJour = useMemo(() => {
    const map = new Map<string, Seance[]>();
    for (const s of seances) {
      const arr = map.get(s.date) ?? [];
      arr.push(s);
      map.set(s.date, arr);
    }
    return map;
  }, [seances]);

  // Une ligne « hors créneau » n'apparaît que si au moins une séance ne tombe
  // dans aucun créneau standard.
  const aHorsCreneau = useMemo(() => seances.some((s) => creneauDe(s) === -1), [seances]);
  const lignes: (number | "autre")[] = aHorsCreneau
    ? [...CRENEAUX.map((_, i) => i), "autre"]
    : CRENEAUX.map((_, i) => i);

  const handleDragStart = (s: Seance, e: DragEvent) => {
    dragId.current = s.id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", s.id);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-brand/10 bg-card">
      <div
        className="grid min-w-[46rem]"
        style={{ gridTemplateColumns: `4.25rem repeat(${jours.length}, minmax(9rem, 1fr))` }}
      >
        {/* En-tête */}
        <div className="sticky top-0 z-20 border-b border-brand/10 bg-card" />
        {jours.map((j) => {
          const today = estAujourdhui(j);
          return (
            <div
              key={j.toISOString()}
              className={cn(
                "sticky top-0 z-20 flex items-center justify-center gap-2 border-b border-s border-brand/10 bg-card px-2 py-2.5",
                today && "bg-primary/[0.03]",
              )}
            >
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {JOURS_COURTS[(j.getDay() + 6) % 7]}
              </span>
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold tabular-nums",
                  today ? "bg-primary text-primary-foreground" : "text-foreground",
                )}
              >
                {j.getDate()}
              </span>
            </div>
          );
        })}

        {/* Lignes de créneaux */}
        {lignes.map((ligne) => {
          const creneau = ligne === "autre" ? null : CRENEAUX[ligne];
          return (
            <div key={String(ligne)} className="contents">
              {/* Étiquette du créneau */}
              <div className="flex flex-col justify-center border-b border-brand/[0.07] px-2 py-3 text-end">
                {creneau ? (
                  <>
                    <span className="text-[11px] font-semibold tabular-nums text-foreground">
                      {creneau.debut}
                    </span>
                    <span className="text-[10px] tabular-nums text-muted-foreground/70">
                      {creneau.fin}
                    </span>
                  </>
                ) : (
                  <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    Autres
                  </span>
                )}
              </div>

              {/* Cellules jour × créneau */}
              {jours.map((j) => {
                const iso = isoDate(j);
                const cle = `${iso}#${String(ligne)}`;
                const cell = (parJour.get(iso) ?? [])
                  .filter((s) => (ligne === "autre" ? creneauDe(s) === -1 : creneauDe(s) === ligne))
                  .sort((a, b) => minutesDepuisMinuit(a.debut) - minutesDepuisMinuit(b.debut));
                const today = estAujourdhui(j);
                const vide = cell.length === 0;

                return (
                  <div
                    key={cle}
                    className={cn(
                      "relative min-h-[5.25rem] space-y-1 border-b border-s border-brand/[0.07] p-1.5",
                      today && "bg-primary/[0.02]",
                      survol === cle &&
                        canDrag &&
                        "bg-primary/[0.06] ring-1 ring-inset ring-primary/40",
                      vide && "group/cell",
                    )}
                    onDragOver={(e) => {
                      if (!canDrag) return;
                      e.preventDefault();
                      setSurvol(cle);
                    }}
                    onDragLeave={() => setSurvol((v) => (v === cle ? null : v))}
                    onDrop={(e) => {
                      if (!canDrag || !dragId.current) return;
                      e.preventDefault();
                      onDrop(dragId.current, iso, creneau ? creneau.debut : "08:30");
                      dragId.current = null;
                      setSurvol(null);
                    }}
                  >
                    {cell.map((s) => (
                      <CarteSeance
                        key={s.id}
                        seance={s}
                        nomProf={nomProf(s.professeurId)}
                        canDrag={canDrag}
                        enConflit={conflictIds?.has(s.id)}
                        onOpen={onOpen}
                        onDragStart={handleDragStart}
                      />
                    ))}

                    {vide && creneau && onCreneauVide ? (
                      <button
                        type="button"
                        aria-label={`Créer une séance ${creneau.debut}`}
                        onClick={() => onCreneauVide(iso, creneau.debut)}
                        className="absolute inset-1 grid place-items-center rounded-[7px] text-muted-foreground/0 transition-colors hover:bg-primary/[0.04] hover:text-muted-foreground/50 group-hover/cell:text-muted-foreground/30"
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VueMois({
  mois,
  seances,
  nomProf,
  conflictIds,
  onOpen,
  onJour,
}: {
  /** N'importe quelle date du mois affiché. */
  mois: Date;
  seances: Seance[];
  nomProf: (id: string) => string;
  conflictIds?: Set<string>;
  onOpen: (s: Seance) => void;
  onJour: (d: Date) => void;
}) {
  const cellules = useMemo(() => {
    const premier = new Date(mois.getFullYear(), mois.getMonth(), 1);
    const debut = new Date(premier);
    debut.setDate(premier.getDate() - ((premier.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(debut);
      d.setDate(debut.getDate() + i);
      return d;
    });
  }, [mois]);

  return (
    <div className="overflow-hidden rounded-xl border border-brand/10 bg-card">
      <div className="grid grid-cols-7 border-b border-brand/10">
        {JOURS_COURTS.map((j) => (
          <div
            key={j}
            className="px-2 py-2.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
          >
            {j}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cellules.map((d) => {
          const iso = isoDate(d);
          const duJour = seances
            .filter((s) => s.date === iso)
            .sort((a, b) => minutesDepuisMinuit(a.debut) - minutesDepuisMinuit(b.debut));
          const horsMois = d.getMonth() !== mois.getMonth();
          const today = estAujourdhui(d);

          return (
            <div
              key={iso}
              className={cn(
                "min-h-[7rem] border-b border-e border-brand/[0.06] p-1.5",
                horsMois && "bg-muted/30",
                today && "bg-primary/[0.035]",
              )}
            >
              <button
                type="button"
                onClick={() => onJour(d)}
                className={cn(
                  "mb-1 grid h-6 w-6 place-items-center rounded-full text-[11px] font-semibold tabular-nums transition-colors hover:bg-primary/15",
                  today
                    ? "bg-primary text-primary-foreground"
                    : horsMois
                      ? "text-muted-foreground/50"
                      : "text-foreground",
                )}
              >
                {d.getDate()}
              </button>

              <div className="space-y-1">
                {duJour.slice(0, 3).map((s) => {
                  const c = couleurSeance(s.module);
                  const enConflit = conflictIds?.has(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onOpen(s)}
                      title={`${s.module} · ${nomProf(s.professeurId)} · ${s.salle}`}
                      className="block w-full truncate rounded-[5px] px-1.5 py-0.5 text-start text-[10px] font-medium transition-opacity hover:opacity-80"
                      style={{
                        backgroundColor: c.soft,
                        boxShadow: `inset 2px 0 0 ${enConflit ? "var(--alert)" : c.bg}`,
                        color: c.text,
                      }}
                    >
                      <span className="tabular-nums opacity-60">{s.debut}</span> {s.module}
                    </button>
                  );
                })}
                {duJour.length > 3 ? (
                  <button
                    type="button"
                    onClick={() => onJour(d)}
                    className="px-1 text-[10px] font-semibold text-primary hover:underline"
                  >
                    +{duJour.length - 3} autres
                  </button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { JOURS_LONGS, TYPE_SEANCE_LABEL };
