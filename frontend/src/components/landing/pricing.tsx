import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, Sparkles, Star } from "lucide-react";
import { Overline } from "./brand";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/* Tarif par tranche d'étudiants : base jusqu'à 100 étudiants, puis +step par
   tranche supplémentaire de 100 (comptée entamée). Annuel = mensuel × 10
   (2 mois offerts). Le Réseau reste sur mesure. */
const PRICING_MODEL: Record<string, { base: number; step: number; included: number } | null> = {
  essentiel: { base: 1000, step: 400, included: 100 },
  pro: { base: 2000, step: 800, included: 100 },
  reseau: null,
};

const STUDENT_OPTIONS = [100, 250, 500] as const;
const DEFAULT_STUDENTS = 250;

type Plan = {
  id: string;
  name: string;
  blurb: string;
  icon: typeof Sparkles;
  tone: string;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    blurb: "Un seul administrateur. Parfait pour démarrer.",
    icon: Sparkles,
    tone: "bg-panel-lavender",
    features: [
      "Dossiers étudiants & inscriptions",
      "Comptes formateurs dédiés",
      "Agenda & emploi du temps",
      "Rapports de base",
      "Support par email",
    ],
    cta: "Choisir Essentiel",
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Pour les écoles actives : équipe multi-rôles et pilotage renforcé.",
    icon: Star,
    tone: "bg-ink text-primary-foreground",
    features: [
      "Tout Essentiel",
      "Paiements & relances automatiques",
      "Examens, bulletins & relevés",
      "Suivi des stages cliniques",
      "Exports & tableaux avancés",
      "Support prioritaire",
    ],
    cta: "Choisir Pro",
    popular: true,
  },
  {
    id: "reseau",
    name: "Réseau",
    blurb: "Multi-campus, groupes et besoins sur mesure.",
    icon: Building2,
    tone: "bg-panel-sky",
    features: [
      "SLA dédié",
      "Intégrations & API",
      "Formation des équipes",
      "Accompagnement au déploiement",
    ],
    cta: "Parler à un expert",
  },
];

const MINI_FAQ = [
  {
    q: "Le prix évolue-t-il avec mon effectif ?",
    a: "Oui, choisissez votre nombre d'étudiants et le prix s'ajuste par tranche de 100. Vous changez de palier à tout moment, sans perdre vos données.",
  },
  {
    q: "Puis-je payer mensuellement ?",
    a: "Oui, les deux options sont disponibles. L'engagement annuel vous offre 2 mois offerts.",
  },
  {
    q: "Y a-t-il des frais cachés ?",
    a: "Non. Le prix affiché inclut l'onboarding, la formation et le support. Aucune surprise.",
  },
];

function planMonthly(planId: string, students: number): number | null {
  const model = PRICING_MODEL[planId];
  if (!model) return null;
  const extra = Math.max(0, Math.ceil((students - model.included) / 100));
  return model.base + extra * model.step;
}

const fmt = (n: number) => n.toLocaleString("fr-FR");

export type PricingChoice = { plan: string; yearly: boolean; students: number };

export function Pricing({ onChoose }: { onChoose?: (c: PricingChoice) => void }) {
  const [students, setStudents] = useState<number>(DEFAULT_STUDENTS);
  const [yearly, setYearly] = useState(true);

  const choose = (planId: string) => {
    track("Pricing Plan Selected", {
      plan: planId,
      billing: yearly ? "annual" : "monthly",
      students,
      monthlyPrice: planMonthly(planId, students),
    });
    onChoose?.({ plan: planId, yearly, students });
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="tarifs" className="relative overflow-hidden bg-background py-14 sm:py-20">
      <img
        src="/brand/decor/hero-blob-secondary.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 w-72 opacity-30 sm:w-96"
      />
      <img
        src="/brand/decor/blob-lavender-corner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-24 w-64 opacity-35 sm:w-80"
      />
      <img
        src="/brand/decor/spark-scatter.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-16 w-[36rem] -translate-x-1/2 opacity-50"
      />

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <Overline>Tarifs</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3.1rem)]">
            Des formules claires et <span className="text-blue">transparentes</span>
          </h2>
          <p className="mt-6 text-[1rem] leading-relaxed text-ink-soft">
            Des prix de départ transparents ; ajustement possible si votre école a des besoins
            spécifiques, après un appel de 20 min.
          </p>
        </div>

        {/* Contrôles */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="inline-flex rounded-full border border-border/70 bg-card p-1 shadow-card">
            {(
              [
                ["Mensuel", false],
                ["Annuel", true],
              ] as const
            ).map(([label, val]) => (
              <button
                key={label}
                type="button"
                onClick={() => setYearly(val)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-5 py-2 text-[0.85rem] font-semibold transition-colors",
                  yearly === val
                    ? "bg-ink text-primary-foreground"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {label}
                {val ? (
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[0.6rem] font-extrabold tracking-wide",
                      yearly ? "bg-sky/25 text-sky" : "bg-panel-blue text-blue",
                    )}
                  >
                    −2 MOIS
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Étudiants
            </span>
            <div className="inline-flex rounded-full border border-border/70 bg-card p-1">
              {STUDENT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setStudents(count)}
                  aria-pressed={students === count}
                  className={cn(
                    "min-w-[3.5rem] rounded-full px-3.5 py-1.5 text-[0.85rem] font-bold tabular-nums transition-colors",
                    students === count
                      ? "bg-ink text-primary-foreground"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  {fmt(count)}
                </button>
              ))}
            </div>
            <span className="text-[0.8rem] text-ink-soft">jusqu'à {fmt(students)} étudiants</span>
          </div>
        </div>

        {/* Trois grandes cartes, style « pace, your plan » */}
        <div className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-stretch">
          {PLANS.map((plan) => {
            const monthly = planMonthly(plan.id, students);
            const surMesure = monthly == null;
            const dark = plan.popular;

            return (
              <motion.article
                key={plan.id}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 240, damping: 22 }}
                className={cn(
                  "grain relative flex flex-col overflow-hidden rounded-[2rem] p-8 sm:p-9",
                  dark
                    ? "bg-ink text-primary-foreground shadow-float lg:-my-3"
                    : "bg-card text-ink shadow-card ring-1 ring-border",
                )}
              >
                <div className="flex items-center gap-2.5">
                  <h3 className="text-[1.7rem] font-extrabold tracking-tight">{plan.name}</h3>
                  {dark ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue px-2.5 py-1 text-[0.6rem] font-extrabold uppercase tracking-widest text-primary-foreground">
                      <Star className="h-3 w-3 fill-current" /> Populaire
                    </span>
                  ) : null}
                </div>
                <p
                  className={cn(
                    "mt-2.5 text-[0.9rem] leading-relaxed",
                    dark ? "text-primary-foreground/65" : "text-ink-soft",
                  )}
                >
                  {plan.blurb}
                </p>

                {/* Prix */}
                <div className="mt-8 min-h-[5.5rem]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${plan.id}-${yearly}-${students}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.24 }}
                    >
                      {surMesure ? (
                        <p className="font-display text-[2.4rem] font-extrabold leading-none tracking-tight">
                          Sur mesure
                        </p>
                      ) : (
                        <>
                          {yearly ? (
                            <p
                              className={cn(
                                "text-[0.85rem] font-semibold line-through",
                                dark ? "text-primary-foreground/40" : "text-muted-foreground/70",
                              )}
                            >
                              {fmt(monthly * 12)} MAD
                            </p>
                          ) : null}
                          <p className="flex items-end gap-2">
                            <span className="font-display text-[3rem] font-extrabold leading-[0.9] tracking-tight tabular-nums">
                              {fmt(yearly ? monthly * 10 : monthly)}
                            </span>
                            <span
                              className={cn(
                                "pb-1.5 text-[0.8rem]",
                                dark ? "text-primary-foreground/50" : "text-muted-foreground",
                              )}
                            >
                              MAD / {yearly ? "an" : "mois"}
                            </span>
                          </p>
                          <p
                            className={cn(
                              "mt-1 text-[0.74rem]",
                              dark ? "text-primary-foreground/50" : "text-ink-soft/75",
                            )}
                          >
                            jusqu'à {fmt(students)} étudiants · HT ·{" "}
                            {yearly ? "2 mois offerts" : "sans engagement"}
                          </p>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Inclus */}
                <ul className="mt-6 flex-1 space-y-2 text-[0.85rem]">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex items-start gap-2",
                        dark ? "text-primary-foreground/80" : "text-ink-soft",
                      )}
                    >
                      <Check
                        className={cn("mt-0.5 size-3.5 shrink-0", dark ? "text-sky" : "text-blue")}
                        strokeWidth={2.6}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => choose(plan.id)}
                  className={cn(
                    "mt-8 self-start rounded-full px-7 py-3.5 text-[0.9rem] font-semibold transition-transform duration-200 hover:-translate-y-0.5",
                    dark ? "bg-primary-foreground text-ink" : "bg-ink text-primary-foreground",
                  )}
                >
                  {plan.cta}
                </button>
              </motion.article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-[0.8rem] text-muted-foreground">
          Le prix s'ajuste par tranche de 100 étudiants · onboarding, formation et support inclus ·
          aucun frais caché.
        </p>
      </div>
    </section>
  );
}
