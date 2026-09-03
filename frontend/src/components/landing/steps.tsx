import { ArrowRight } from "lucide-react";
import { Overline } from "./brand";
import { track } from "@/lib/analytics";

const STEPS = [
  {
    n: "1",
    img: "/brand/decor/hand/icon-etudiants.png",
    title: "Dites-nous où vous en êtes",
    body: "Vous choisissez une formule et remplissez le formulaire : vos filières, votre effectif, ce qui vous bloque aujourd'hui. Deux minutes.",
  },
  {
    n: "2",
    img: "/brand/decor/hand/icon-calendar.png",
    title: "On prépare votre espace",
    body: "On monte un environnement Essor avec vos filières et un échantillon de vos données. Rien à installer, rien à configurer de votre côté.",
  },
  {
    n: "3",
    img: "/brand/decor/hand/icon-card.png",
    title: "20 minutes en visio",
    body: "On parcourt ensemble le planning, les paiements, les bulletins et les stages. Vous testez les gestes que votre équipe fera tous les jours.",
  },
];

export function Steps() {
  return (
    <section id="etapes" className="relative overflow-hidden bg-background py-14 sm:py-20">
      <img
        src="/brand/decor/grid-fade-panel.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-[80rem] -translate-y-1/2 opacity-60"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Overline tone="sky">La démo en 3 étapes</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)]">
            Une démo guidée, sur vos données.
          </h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((s) => (
            <article key={s.n} className="flex flex-col items-center text-center">
              <div className="relative grid h-36 w-full place-items-center rounded-[1.75rem] bg-panel-sky/40">
                <img src={s.img} alt="" aria-hidden className="h-20 w-auto opacity-90" />
                <span className="absolute -left-2 -top-2 grid size-8 place-items-center rounded-full bg-ink text-[0.85rem] font-extrabold text-primary-foreground">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-6 text-[1.15rem] font-extrabold">{s.title}</h3>
              <p className="mt-2 max-w-[22rem] text-[0.9rem] leading-relaxed text-ink-soft">
                {s.body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <a
            href="#tarifs"
            onClick={() => track("CTA Clicked", { location: "steps", label: "Demander une démo" })}
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-[0.95rem] font-semibold text-primary-foreground shadow-pill transition-transform duration-200 hover:-translate-y-0.5"
          >
            Demander une démo
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
