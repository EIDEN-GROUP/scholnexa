import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { EssorLockup } from "./brand";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/#faq" },
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Demander une démo", href: "/#contact" },
];

function BackToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Revenir en haut"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-40 grid size-11 place-items-center rounded-full border border-border bg-card text-ink shadow-pill transition-all duration-300 hover:border-blue hover:text-blue",
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
      )}
    >
      <ArrowUp className="size-4" />
    </button>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-12 sm:flex-row sm:justify-between sm:gap-6">
        <a href="/" className="shrink-0">
          <EssorLockup className="h-9" />
        </a>

        <div className="flex flex-col items-center gap-3 sm:items-end">
          <p className="text-center text-[0.9rem] text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} Essor · Eiden Group · La solution tout-en-un pour votre
            établissement.
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.9rem] font-medium text-ink sm:justify-end">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="transition-colors duration-200 hover:text-blue"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <BackToTop />
    </footer>
  );
}
