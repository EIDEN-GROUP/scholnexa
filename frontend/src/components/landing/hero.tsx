import { AppWindow } from "./app-window";
import { Overline } from "./brand";
import { track } from "@/lib/analytics";

export function Hero() {
  return (
    <section id="top" className="grain relative overflow-hidden pt-28 sm:pt-32">
      <img
        src="/brand/decor/hero-blob-primary.png"
        alt=""
        aria-hidden
        className="drift pointer-events-none absolute -left-24 -top-16 w-[26rem] opacity-45 sm:w-[34rem]"
      />
      <img
        src="/brand/decor/hero-blob-secondary.png"
        alt=""
        aria-hidden
        style={{ animationDelay: "2.4s" }}
        className="drift pointer-events-none absolute -right-16 top-10 w-72 opacity-40 sm:w-96"
      />
      <img
        src="/brand/decor/spark-scatter.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-20 h-40 w-[34rem] -translate-x-1/2 object-cover object-top opacity-25"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-3xl text-center">
          <Overline className="rise">Gestion d'école · Formations paramédicales · Maroc</Overline>
          <h1 className="rise mt-5 text-[clamp(2.6rem,7.6vw,5.2rem)]">
            Tout avance,
            <br />
            <span className="text-blue">simplement.</span>
          </h1>
          <p className="rise mx-auto mt-7 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft">
            Essor réunit vos étudiants, votre planning, vos paiements, vos bulletins et vos stages
            cliniques dans un seul espace. Zéro Excel, zéro chaos.
          </p>

          <div className="rise mt-9 flex flex-col items-center gap-3">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="#tarifs"
                onClick={() => track("CTA Clicked", { location: "hero", label: "Demander une démo" })}
                className="rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-semibold text-primary-foreground shadow-pill transition-transform duration-200 hover:-translate-y-0.5"
              >
                Demander une démo
              </a>
              <a
                href="#etapes"
                onClick={() => track("CTA Clicked", { location: "hero", label: "Comment ça marche" })}
                className="rounded-full border border-border bg-card px-6 py-3.5 text-[0.95rem] font-semibold text-ink transition-colors hover:bg-mist/60"
              >
                Comment ça marche
              </a>
            </div>
            <p className="text-[0.8rem] text-muted-foreground">
              Démo guidée sur vos données · réponse sous 24 h
            </p>
          </div>
        </div>

        <div className="rise relative mt-10 sm:mt-14">
          <AppWindow className="relative z-10" />

          <div className="drift absolute -left-3 top-24 hidden w-52 rounded-2xl border border-border/70 bg-card p-3.5 shadow-card lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-lavender">
              Relance envoyée
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
              Mensualité famille Bennani · <span className="font-semibold text-ink">1 200 DH</span>
              <br />
              Rappel envoyé par WhatsApp.
            </p>
          </div>
          <div
            className="drift absolute -right-4 bottom-16 hidden w-48 rounded-2xl border border-border/70 bg-card p-3.5 shadow-card lg:block"
            style={{ animationDelay: "1.6s" }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue">
              Bulletin publié
            </p>
            <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">
              S5-G1 · 24 relevés générés et envoyés aux étudiants.
            </p>
          </div>
        </div>
      </div>

      <div className="h-12 bg-gradient-to-b from-transparent to-background sm:h-16" />
    </section>
  );
}
