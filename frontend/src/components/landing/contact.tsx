import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Overline } from "./brand";
import type { PricingChoice } from "./pricing";
import { submitDemoRequest } from "@/lib/contact-demo";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const BULLETS = [
  "Présentation adaptée à votre type d'école",
  "Réponse garantie sous 2 h ouvrées",
  "Aucun engagement requis",
  "Les créneaux partent vite : réservez le vôtre",
];

const PLAN_LABEL: Record<string, string> = {
  essentiel: "Essentiel",
  pro: "Pro",
  reseau: "Réseau",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

function planMonthly(plan: string, students: number): number | null {
  const m: Record<string, { base: number; step: number } | null> = {
    essentiel: { base: 1000, step: 400 },
    pro: { base: 2000, step: 800 },
    reseau: null,
  };
  const model = m[plan];
  if (!model) return null;
  return model.base + Math.max(0, Math.ceil((students - 100) / 100)) * model.step;
}

export function Contact({ selection }: { selection: PricingChoice | null }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ecoleRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const telRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLTextAreaElement>(null);

  const monthly = selection ? planMonthly(selection.plan, selection.students) : null;
  const price =
    selection && monthly != null
      ? `${fmt(selection.yearly ? monthly * 10 : monthly)} MAD / ${selection.yearly ? "an" : "mois"} HT`
      : selection
        ? "Sur mesure"
        : null;

  const planLabel = selection
    ? `${PLAN_LABEL[selection.plan] ?? selection.plan}${
        selection.plan !== "reseau"
          ? ` · ${selection.yearly ? "annuel" : "mensuel"} · ${fmt(selection.students)} étudiants${
              price ? ` · ${price}` : ""
            }`
          : ""
      }`
    : undefined;

  const fieldClass =
    "w-full rounded-xl border border-border bg-mist/50 px-4 py-3 text-[0.92rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-blue focus:bg-card focus:ring-4 focus:ring-blue/10";

  const goToPricing = () => {
    document.getElementById("tarifs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selection) {
      track("Demo Form Validation Failed", { reason: "no_plan_selected" });
      setError("Choisissez d'abord une formule dans la section Tarifs.");
      goToPricing();
      return;
    }
    const center = ecoleRef.current?.value.trim() ?? "";
    const email = emailRef.current?.value.trim() ?? "";
    const phone = telRef.current?.value.trim() ?? "";
    const preferredDate = dateRef.current?.value ?? "";
    if (!center || !email || !phone || !preferredDate) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    setError("");
    setBusy(true);
    const res = await submitDemoRequest({
      center,
      email,
      phone,
      preferredDate,
      message: msgRef.current?.value.trim() || undefined,
      plan: planLabel,
    });
    setBusy(false);
    if (res.ok) {
      track("Demo Requested", {
        plan: selection.plan,
        billing: selection.yearly ? "annual" : "monthly",
        students: selection.students,
        hasMessage: Boolean(msgRef.current?.value.trim()),
      });
      setSent(true);
    } else {
      track("Demo Request Failed", { error: res.error });
      setError(`Envoi impossible (${res.error}). Appelez-nous ou réessayez plus tard.`);
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden bg-background py-14 sm:py-20">
      <img
        src="/brand/decor/grid-fade-panel.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto w-[80rem] -translate-y-1/2 opacity-60"
      />
      <img
        src="/brand/decor/blob-lavender-corner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-8 w-72 opacity-40 sm:w-96"
      />
      <img
        src="/brand/decor/cloud-soft-sky.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-6 left-6 w-52 opacity-60 sm:w-72"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-2 lg:items-start lg:gap-14">
        {/* Colonne gauche */}
        <div>
          <Overline tone="sky">Démo gratuite</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3rem)]">
            20 minutes. Votre école dans Essor. En direct.
          </h2>
          <p className="mt-5 text-[1rem] leading-relaxed text-ink-soft">
            Choisissez une date et laissez-nous vos coordonnées : on vous montre Essor avec vos cas
            concrets, sans engagement.
          </p>

          <ul className="mt-8 space-y-3">
            {BULLETS.map((b) => (
              <li key={b} className="flex items-start gap-2.5 text-[0.92rem] text-ink-soft">
                <Check className="mt-0.5 size-4 shrink-0 text-blue" strokeWidth={2.6} />
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-8 space-y-3 text-[0.9rem]">
            {[
              {
                Icon: Mail,
                text: "contact@eiden-group.com",
                href: "mailto:contact@eiden-group.com",
              },
              { Icon: Phone, text: "07 77 77 74 28", href: "tel:+212777777428" },
              {
                Icon: MapPin,
                text: "Agadir Bay, Technopole 1 Bloc B, Agadir 80000",
                href: "https://maps.app.goo.gl/",
              },
            ].map(({ Icon, text, href }) => (
              <a
                key={text}
                href={href}
                className="flex items-center gap-3 text-ink transition-colors hover:text-blue"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-panel-blue text-blue">
                  <Icon className="size-4" />
                </span>
                {text}
              </a>
            ))}
          </div>
        </div>

        {/* Carte formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-[1.6rem] bg-card p-7 shadow-float sm:p-8"
        >
          <img
            src="/brand/decor/paperclip.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-5 w-10 rotate-12 opacity-80"
          />

          {sent ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-panel-blue text-blue">
                <Check className="size-6" strokeWidth={3} />
              </span>
              <h3 className="mt-5 text-[1.3rem] font-extrabold">Demande envoyée</h3>
              <p className="mt-2 max-w-xs text-[0.9rem] text-ink-soft">
                Merci ! Notre équipe vous recontacte sous 2 h ouvrées pour caler la démo.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="mt-5 text-[0.85rem] font-semibold text-blue hover:underline"
              >
                Nouvelle demande
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <p className="text-[1.05rem] font-extrabold text-ink">Réservez votre démo</p>

              {error ? (
                <div className="flex items-start gap-2 rounded-xl bg-alert/10 px-3.5 py-2.5 text-[0.82rem] font-medium text-alert">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </div>
              ) : null}

              {selection ? (
                <div className="flex items-center justify-between gap-2 rounded-xl bg-panel-blue px-3.5 py-2.5 text-[0.8rem]">
                  <span className="text-blue">
                    Formule choisie ·{" "}
                    <span className="font-bold">
                      {PLAN_LABEL[selection.plan] ?? selection.plan}
                    </span>
                    {selection.plan !== "reseau" ? (
                      <>
                        {" "}
                        · {selection.yearly ? "annuel" : "mensuel"} · {fmt(selection.students)}{" "}
                        étudiants
                      </>
                    ) : null}
                  </span>
                  {price ? <span className="shrink-0 font-bold text-ink">{price}</span> : null}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={goToPricing}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-blue/40 bg-panel-blue/50 px-3.5 py-2.5 text-left text-[0.8rem] text-blue transition-colors hover:bg-panel-blue"
                >
                  <span>
                    <span className="font-bold">Choisissez une formule</span> pour activer le
                    formulaire
                  </span>
                  <ArrowRight className="size-4 shrink-0 -rotate-90" />
                </button>
              )}

              <div className="space-y-1">
                <label htmlFor="c-ecole" className={labelClass}>
                  Nom de l'école *
                </label>
                <input
                  ref={ecoleRef}
                  id="c-ecole"
                  required
                  placeholder="Institut Atlas Santé"
                  autoComplete="organization"
                  className={fieldClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="c-email" className={labelClass}>
                    Email *
                  </label>
                  <input
                    ref={emailRef}
                    id="c-email"
                    type="email"
                    required
                    placeholder="vous@votre-ecole.ma"
                    autoComplete="email"
                    className={fieldClass}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="c-tel" className={labelClass}>
                    Téléphone *
                  </label>
                  <input
                    ref={telRef}
                    id="c-tel"
                    type="tel"
                    required
                    placeholder="06 12 34 56 78"
                    autoComplete="tel"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="c-date" className={labelClass}>
                  Date souhaitée *
                </label>
                <input
                  ref={dateRef}
                  id="c-date"
                  type="date"
                  required
                  className={cn(fieldClass, "text-ink-soft")}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="c-msg" className={labelClass}>
                  Message (optionnel)
                </label>
                <textarea
                  ref={msgRef}
                  id="c-msg"
                  rows={3}
                  placeholder="Parlez-nous de votre école, du nombre d'étudiants, de vos besoins…"
                  className={cn(fieldClass, "resize-none")}
                />
              </div>

              <button
                type="submit"
                disabled={busy || !selection}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[0.92rem] font-semibold text-primary-foreground shadow-pill transition-transform duration-200 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Envoi en cours…
                  </>
                ) : (
                  <>
                    Réserver ma démo
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>

              <p className="text-center text-[0.72rem] text-muted-foreground">
                {selection
                  ? "Données sécurisées · Réponse sous 2 h · Sans engagement"
                  : "Sélectionnez une formule ci-dessus pour envoyer votre demande"}
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}

const labelClass =
  "block text-[0.68rem] font-bold uppercase tracking-[0.12em] text-muted-foreground";
