import { Star } from "lucide-react";
import { EssorMark, Overline } from "./brand";

const TEMOIGNAGES = [
  {
    quote:
      "On a fermé trois classeurs Excel en une semaine. Le service scolarité ne court plus après les paiements, et les bulletins sortent en une soirée.",
    name: "M. Youssef Benali",
    role: "Directeur · École paramédicale, Agadir",
  },
  {
    quote:
      "Le planning se fait une fois. Plus de double réservation de salle, plus de messages de groupe le dimanche soir pour caler les séances.",
    name: "Nadia Amrani",
    role: "Responsable pédagogique · Casablanca",
  },
  {
    quote:
      "La reprise de nos 280 dossiers a pris une matinée. Depuis, chaque relance part toute seule et je vois le recouvrement en temps réel.",
    name: "Karim Sekkat",
    role: "Gestionnaire · Institut de kinésithérapie, Rabat",
  },
];

export function Proof() {
  return (
    <section className="grain relative overflow-hidden bg-ink py-16 text-primary-foreground sm:py-20">
      <div
        aria-hidden
        className="absolute -right-40 -top-40 size-[34rem] rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, oklch(0.5461 0.2152 262.88 / 0.45), transparent 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-48 -left-32 size-[28rem] rounded-full opacity-50"
        style={{
          background:
            "radial-gradient(circle at 55% 55%, oklch(0.7066 0.1875 34.08 / 0.35), transparent 65%)",
        }}
      />
      <img
        src="/brand/decor/spark-scatter.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-10 mx-auto w-[46rem] opacity-30 mix-blend-screen"
      />
      <img
        src="/brand/decor/footer-glow-blob.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-40 bottom-0 w-[34rem] opacity-70 mix-blend-screen"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Overline tone="sky">Ce qu'en disent les écoles</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)]">
            Elles ont arrêté de tout recopier
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TEMOIGNAGES.map((t) => (
            <figure
              key={t.name}
              className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6"
            >
              <div className="flex gap-0.5 text-sky">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-primary-foreground/85">
                « {t.quote} »
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <EssorMark className="h-6 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-[0.85rem] font-semibold">{t.name}</p>
                  <p className="truncate text-[0.75rem] text-primary-foreground/50">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
