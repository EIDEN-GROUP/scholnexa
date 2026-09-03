import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Fingerprint, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Écran de connexion - carte blanche centrée, décor Essor (blobs, nuage,
 * trombone), formulaire épuré. L'authentification passe par le backend
 * (`POST /auth/login`) ; l'« accès unique du centre » ouvre directement
 * l'espace (la connexion réelle sera branchée plus tard).
 */
function LoginPage() {
  const { login, setRole, role, loading } = useAuth();
  const navigate = useNavigate();

  // Already signed in? Skip straight to the dashboard.
  useEffect(() => {
    if (!loading && role) navigate({ to: "/dashboard", replace: true });
  }, [loading, role, navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  const accesUnique = () => {
    setRole("directeur");
    navigate({ to: "/dashboard" });
  };

  const fieldClass =
    "w-full rounded-xl border border-border bg-mist/60 px-4 py-3.5 text-[0.95rem] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/60 focus:border-blue focus:bg-card focus:ring-4 focus:ring-blue/10";

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-mist px-5 py-12">
      {/* Décor */}
      <img
        src="/brand/decor/grid-fade-panel.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 w-[52rem] max-w-[92vw] -translate-x-1/2 opacity-70"
      />
      <img
        src="/brand/decor/blob-lavender-corner.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-10 w-64 opacity-70 sm:w-80"
      />
      <img
        src="/brand/decor/blob-coral-accent.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -left-16 w-56 opacity-45 sm:w-72"
      />
      <img
        src="/brand/decor/cloud-soft-sky.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -bottom-6 right-4 w-48 opacity-70 sm:w-64"
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[26rem]"
      >
        <div className="relative rounded-[1.6rem] bg-card p-8 shadow-[0_40px_90px_-40px_rgba(11,18,32,0.35)] sm:p-10">
          <img
            src="/brand/decor/paperclip.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-2 -top-5 w-10 rotate-12 opacity-80"
          />

          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">
            Bon retour
          </p>
          <h1 className="mt-3 font-display text-[2.1rem] font-extrabold leading-[1.05] tracking-tight text-ink">
            Connexion à votre espace
          </h1>
          <p className="mt-3 text-[0.9rem] text-ink-soft">
            Pas encore de compte ?{" "}
            <a
              href="#"
              className="font-semibold text-blue underline decoration-blue/40 underline-offset-2 hover:decoration-blue"
            >
              Demander un accès
            </a>
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            {error ? (
              <div
                role="alert"
                className="anim-shake rounded-xl bg-alert/10 px-4 py-3 text-[0.85rem] font-medium text-alert"
              >
                {error}
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Adresse e-mail
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="direction@centre.ma"
                autoComplete="email"
                autoFocus
                className={fieldClass}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-[0.68rem] font-bold uppercase tracking-[0.14em] text-muted-foreground"
                >
                  Mot de passe
                </label>
                <a href="#" className="text-[0.78rem] text-ink-soft hover:text-ink">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className={cn(fieldClass, "pe-11")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  tabIndex={-1}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-ink"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-[0.85rem] text-ink-soft">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 rounded-[5px] border-border accent-ink"
              />
              Garder ma session ouverte sur cet ordinateur
            </label>

            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "group flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-6 py-3.5 text-[0.95rem] font-semibold text-primary-foreground",
                "shadow-pill transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                <>
                  Ouvrir mon espace
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            ou
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={accesUnique}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-card px-6 py-3.5 text-[0.9rem] font-semibold text-ink transition-colors hover:bg-mist/60"
          >
            <Fingerprint className="h-4 w-4 text-lavender" />
            Continuer avec l'accès unique du centre
          </button>
        </div>

        <div className="mt-7 flex items-start gap-3 px-2">
          <img
            src="/brand/decor/payment-stamp.png"
            alt=""
            aria-hidden
            className="mt-0.5 h-8 w-8 shrink-0 -rotate-6"
          />
          <p className="text-[0.8rem] leading-relaxed text-muted-foreground">
            Données hébergées et chiffrées. Vos familles, vos paiements, vos rapports, visibles
            seulement par votre équipe.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// `/login` est une route de premier niveau : elle a besoin de son propre
// AuthProvider (celui de `dashboard.tsx` ne l'atteint pas).
function LoginRoute() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

export const Route = createFileRoute("/login")({ ssr: false, component: LoginRoute });
