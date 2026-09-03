import { ArrowRight } from "lucide-react";
import { Overline } from "./brand";

const AVANT = [
  "6 fichiers Excel qui ne se parlent pas",
  "Les relances de paiement qu'on oublie",
  "Un emploi du temps recopié à la main chaque semaine",
  "Les bulletins tapés un par un en fin de semestre",
];

const AVEC = [
  "Un seul espace : étudiants, planning, paiements, notes, stages",
  "Les relances partent seules par SMS et WhatsApp",
  "Le planning se construit une fois, sans double réservation",
  "Bulletins et relevés générés en un clic pour toute une classe",
];

export function Problem() {
  return (
    <section
      id="produit"
      className="relative overflow-hidden border-y border-border/70 bg-background py-14 sm:py-20"
    >
      <img
        src="/brand/decor/ring-outline-blue.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 w-64 -translate-y-1/2 opacity-30 sm:w-72"
      />

      <div className="relative mx-auto max-w-5xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Overline>Le problème</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3rem)]">
            Votre école tourne, mais elle{" "}
            <span className="relative inline-block">
              s'éparpille
              <img
                src="/brand/decor/arc-underline.png"
                alt=""
                aria-hidden
                className="pointer-events-none absolute -bottom-3 left-0 w-full"
              />
            </span>
          </h2>
        </div>

        <div className="mt-14 grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-[1.5rem] border border-border/70 bg-card p-6 shadow-card">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">
              Aujourd'hui
            </p>
            <ul className="mt-4 space-y-3 text-[0.92rem] text-ink-soft">
              {AVANT.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-coral" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden place-items-center md:grid">
            <span className="grid size-11 place-items-center rounded-full bg-ink text-primary-foreground">
              <ArrowRight className="size-5" />
            </span>
          </div>

          <div className="grain rounded-[1.5rem] bg-panel-blue p-6 shadow-card">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-blue">
              Avec Essor
            </p>
            <ul className="mt-4 space-y-3 text-[0.92rem] text-ink">
              {AVEC.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
