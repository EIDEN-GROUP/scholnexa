import { Check } from "lucide-react";
import { Overline } from "./brand";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Mini-UI : liste étudiants (reprend les colonnes du vrai tableau)   */
/* ------------------------------------------------------------------ */

const ETUDIANTS = [
  ["C139887", "Bilal Ramdani", "Prothèse · S4", "Inscrit", "blue"],
  ["C140921", "Salma El Idrissi", "Infirmier · S5-B", "Inscrit", "blue"],
  ["C138334", "Youssef Tahiri", "Kiné · S1", "En attente", "coral"],
  ["C141002", "Amina Rochdi", "Infirmier · S2", "Inscrit", "blue"],
] as const;

function MiniEtudiants() {
  return (
    <div className="overflow-hidden rounded-xl bg-card/95 text-[0.72rem] shadow-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-2 border-b border-border bg-mist/60 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
        <span>CNE</span>
        <span>Nom · filière</span>
        <span>Statut</span>
      </div>
      {ETUDIANTS.map(([cne, nom, fil, statut, tone], i) => (
        <div
          key={cne}
          className={cn(
            "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 px-3 py-1.5",
            i > 0 && "border-t border-border",
          )}
        >
          <span className="font-mono text-[0.65rem] text-muted-foreground">{cne}</span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{nom}</span>
            <span className="block truncate text-[0.62rem] text-muted-foreground">{fil}</span>
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-1.5 py-0.5 text-[0.58rem] font-semibold",
              tone === "blue" ? "bg-panel-blue text-blue" : "bg-panel-coral text-coral",
            )}
          >
            {statut}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini-UI : grille de paiements mensuels                             */
/* ------------------------------------------------------------------ */

const MOIS = ["S", "O", "N", "D", "J", "F"] as const;
// p = payé, w = en attente, r = retard
const LIGNES = [
  ["Bennani", "p p p p w .", "1 200"],
  ["El Amrani", "p p w r . .", "1 000"],
  ["Ziani", "p p p p p w", "1 450"],
  ["Sekkat", "p p p p p p", "1 200"],
  ["Bouzid", "p p p w . .", "1 350"],
] as const;

function MiniPaiements() {
  return (
    <div className="rounded-xl bg-card/95 p-3 text-[0.72rem] shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
          Mensualités · année en cours
        </span>
        <span className="rounded-full bg-panel-coral px-1.5 py-0.5 text-[0.58rem] font-bold text-coral">
          3 à relancer
        </span>
      </div>
      <div className="space-y-1.5">
        {LIGNES.map(([nom, cells, montant]) => (
          <div key={nom} className="flex items-center gap-2">
            <span className="w-14 shrink-0 truncate font-semibold text-ink">{nom}</span>
            <span className="flex flex-1 gap-1">
              {cells.split(" ").map((c, i) => (
                <span
                  key={i}
                  className={cn(
                    "grid size-4 place-items-center rounded-[4px] text-[0.55rem] font-bold",
                    c === "p" && "bg-panel-blue text-blue",
                    c === "w" && "bg-panel-coral text-coral",
                    c === "r" && "bg-coral text-white",
                    c === "." && "bg-mist text-muted-foreground/40",
                  )}
                >
                  {c === "p" ? "✓" : c === "." ? MOIS[i] : "!"}
                </span>
              ))}
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">{montant}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[0.68rem]">
        <span className="text-muted-foreground">Encaissé ce mois</span>
        <span className="font-bold text-ink">42 800 DH</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini-UI : bulletin + stage                                        */
/* ------------------------------------------------------------------ */

function MiniBulletin() {
  return (
    <div className="space-y-2">
      <div className="rounded-xl bg-card/95 p-3 shadow-card">
        <p className="text-[0.6rem] font-bold uppercase tracking-wider text-muted-foreground">
          Relevé de notes · Salma El Idrissi
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[
            ["Moyenne", "14,2 / 20"],
            ["Mention", "Bien"],
            ["Décision", "Admis"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-mist/60 px-1.5 py-1.5">
              <p className="text-[0.55rem] uppercase tracking-wide text-muted-foreground">{k}</p>
              <p className="mt-0.5 text-[0.7rem] font-bold text-ink">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-2.5 space-y-1 border-t border-border pt-2 text-[0.68rem]">
          {[
            ["Anatomie & physiologie", "15,5"],
            ["Soins infirmiers", "13,0"],
            ["Pharmacologie", "14,8"],
          ].map(([m, n]) => (
            <div key={m} className="flex items-center justify-between">
              <span className="truncate text-ink-soft">{m}</span>
              <span className="shrink-0 font-semibold tabular-nums text-ink">{n}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-card/95 px-3 py-2 text-[0.72rem] shadow-card">
        <Check className="size-3.5 shrink-0 text-sky" strokeWidth={3} />
        <span className="min-w-0 truncate text-ink">
          Convention <span className="font-semibold">CHR Hassan II · Agadir</span>
        </span>
        <span className="ms-auto shrink-0 rounded-full bg-panel-sky px-1.5 py-0.5 text-[0.58rem] font-bold text-sky">
          Signée
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function Structure() {
  return (
    <section id="modules" className="relative overflow-hidden bg-background py-14 sm:py-20">
      <img
        src="/brand/decor/halftone-cloud.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-6 top-6 w-56 opacity-60 sm:w-72"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Overline>Ce que vous pilotez</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)]">
            Toute la scolarité, dans un seul espace
          </h2>
          <p className="mt-5 text-[1rem] leading-relaxed text-ink-soft">
            Inscriptions, argent, notes, stages : chaque brique alimente les autres. Vous saisissez
            une fois, ça se répercute partout.
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-5 sm:grid-cols-3">
          <Card
            tone="bg-panel-lavender"
            title="Étudiants & inscriptions"
            sub="Le dossier complet, de l'inscription au diplôme"
          >
            <MiniEtudiants />
          </Card>

          <Card
            tone="bg-panel-coral"
            title="Paiements & relances"
            sub="Chaque mensualité suivie, chaque retard rappelé"
          >
            <img
              src="/brand/decor/payment-stamp.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -right-3 -top-3 w-16 -rotate-12 opacity-90"
            />
            <MiniPaiements />
          </Card>

          <Card
            tone="bg-panel-sky"
            title="Bulletins & stages"
            sub="Notes, mentions, conventions, générées et non tapées"
          >
            <img
              src="/brand/decor/paperclip.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-4 top-4 w-7 opacity-40"
            />
            <MiniBulletin />
          </Card>
        </div>
      </div>
    </section>
  );
}

function Card({
  tone,
  title,
  sub,
  children,
}: {
  tone: string;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <article
      className={cn(
        "grain relative flex flex-col overflow-hidden rounded-[1.75rem] p-6 text-center",
        tone,
      )}
    >
      <header className="min-h-[6rem]">
        <h3 className="text-[1.35rem] font-extrabold">{title}</h3>
        <p className="mx-auto mt-2 max-w-[16rem] text-[0.85rem] leading-snug text-ink-soft">
          {sub}
        </p>
      </header>
      <div className="mt-5 flex flex-1 flex-col justify-end text-left">{children}</div>
    </article>
  );
}
