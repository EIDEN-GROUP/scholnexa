import { useState, useId } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand";

/**
 * Écran de connexion Essor — minimal, brand-aligned, pro.
 *
 * Composition
 *  ─ Fond clair (Mist #F8FAFC) avec une seule aura Electric Blue discrète.
 *  ─ Carte centrée, blanche, ring 1px, ombre douce.
 *  ─ En haut : logomark + wordmark "essor" + baseline "Plateforme tout-en-un".
 *  ─ Titre "Content de vous revoir." + sous-titre italique.
 *  ─ Form : labels visibles au-dessus, inputs spacious, bouton primaire Deep Ink.
 *  ─ Pied : indicateur "chiffré · © 2026" et lien retour landing.
 *
 * Accessibilité
 *  ─ 4.5:1 minimum partout (texte sur fond clair / bouton foncé).
 *  ─ Touch targets 44×44 minimum (bouton CTA, eye-toggle).
 *  ─ aria-label sur tous les icon-only, aria-invalid + aria-describedby pour l'erreur.
 *  ─ prefers-reduced-motion respecté.
 */

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Base classes for both email and password inputs. Single source of truth so
 * a tweak (radius, padding, focus ring) is applied in one place.
 */
const inputBase =
  "block w-full rounded-xl border bg-white text-[15px] leading-6 text-[#0B1220] " +
  "outline-none transition-all duration-200 placeholder:text-[#94A3B8] " +
  "hover:border-[#CBD5E1] " +
  "focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/12 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-[invalid=true]:border-[#FB7185] aria-[invalid=true]:focus:ring-[#FB7185]/15";

const inputStateClass = (focused: boolean, hasError: boolean) =>
  cn(
    "px-4 py-3.5",
    hasError
      ? "border-[#FB7185] focus:border-[#FB7185] focus:ring-[#FB7185]/15"
      : focused
        ? "border-[#2563EB] ring-4 ring-[#2563EB]/12"
        : "border-[#E2E8F0]",
  );

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#F8FAFC]">
      {/* ----- Brand-aligned background: a single soft aura + hairline grid ----- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(11,18,32,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(11,18,32,0.035) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 75% 55% at 50% 35%, #000 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 55% at 50% 35%, #000 30%, transparent 100%)",
        }}
      />

      {/* ----- Top-left back to landing link ----- */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium text-[#475569] transition-colors duration-200 hover:bg-white hover:text-[#0B1220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40 sm:left-7 sm:top-7"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        <span className="hidden sm:inline">Retour au site</span>
      </Link>

      <main className="relative grid min-h-dvh w-full place-items-center px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full max-w-[440px]"
        >
          {/* ----- Card ----- */}
          <div className="rounded-3xl bg-white p-7 shadow-[0_30px_80px_-30px_rgba(11,18,32,0.18)] ring-1 ring-[#E2E8F0] sm:p-10">
            {/* Brand mark */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-3 flex items-center gap-2.5">
                <img
                  src={BRAND.logoMarkPath}
                  alt={BRAND.name}
                  className="h-9 w-9"
                />
                <span className="font-display text-2xl font-extrabold tracking-tight text-[#0B1220]">
                  {BRAND.wordmark}
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#475569]">
                Plateforme tout-en-un
              </span>
            </div>

            {/* Heading */}
            <div className="mb-8 text-center">
              <h1 className="font-display text-[1.65rem] font-bold leading-tight tracking-tight text-[#0B1220] sm:text-[1.85rem]">
                Content de vous revoir.
              </h1>
              <p className="mt-2 text-sm font-medium italic text-[#475569]">
                Une école, un compte. Vos équipes vous attendent à l'intérieur.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
              aria-describedby={error ? errorId : undefined}
            >
              {error ? (
                <div
                  id={errorId}
                  role="alert"
                  aria-live="assertive"
                  className="flex items-start gap-2.5 rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-3.5 py-3 text-sm font-medium text-[#BE123C]"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              ) : null}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]"
                >
                  Adresse e-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="direction@votre-ecole.ma"
                  autoComplete="email"
                  autoFocus
                  aria-invalid={!!error}
                  className={cn(inputBase, inputStateClass(emailFocus, !!error && !email))}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-[11px] font-semibold uppercase tracking-wider text-[#475569]"
                  >
                    Mot de passe
                  </label>
                  <a
                    href="mailto:contact@eiden-group.com?subject=Mot%20de%20passe%20oublié"
                    className="text-[11px] font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8] focus-visible:outline-none focus-visible:underline"
                  >
                    Oublié ?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPwFocus(true)}
                    onBlur={() => setPwFocus(false)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={!!error}
                    className={cn(
                      inputBase,
                      inputStateClass(pwFocus, !!error && !password),
                      "pe-12",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={
                      showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"
                    }
                    aria-pressed={showPw}
                    className="absolute end-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 cursor-pointer place-items-center rounded-lg text-[#94A3B8] transition-colors duration-200 hover:bg-[#F1F5F9] hover:text-[#0B1220] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
                  >
                    {showPw ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-sm font-semibold text-white",
                  "shadow-[0_10px_24px_-10px_rgba(37,99,235,0.55)] transition-all duration-200",
                  "hover:bg-[#1D4ED8] hover:shadow-[0_14px_30px_-10px_rgba(37,99,235,0.65)] active:scale-[0.99]",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                )}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
                    Connexion en cours…
                  </>
                ) : (
                  <>
                    Se connecter
                    <ArrowRight
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ----- Footer ----- */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] tracking-wide text-[#475569]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            <span>Données hébergées et chiffrées · {BRAND.name} © 2026</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export const Route = createFileRoute("/login")({ component: LoginPage });
