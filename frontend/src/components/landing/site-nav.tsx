import { useEffect, useState } from "react";
import { EssorLockup } from "./brand";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const links = [
  { label: "Le problème", href: "#produit" },
  { label: "La démo", href: "#etapes" },
  { label: "Modules", href: "#modules" },
  { label: "Tarifs", href: "#tarifs" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
];

export function SiteNav() {
  const [lifted, setLifted] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={cn(
          "pointer-events-auto grid w-full max-w-4xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-full border border-border/70 bg-card/80 px-4 py-2.5 backdrop-blur-xl transition-shadow duration-500 sm:px-5",
          lifted ? "shadow-pill" : "shadow-none",
        )}
      >
        <div className="flex min-w-0 items-center gap-6">
          <a href="#top" className="shrink-0">
            <EssorLockup className="h-6" />
          </a>
          <ul className="hidden min-w-0 items-center gap-5 text-sm text-ink-soft lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition-colors duration-200 hover:text-ink">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-3">
          <a
            href="#tarifs"
            onClick={() => track("CTA Clicked", { location: "nav", label: "Demander une démo" })}
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform duration-200 hover:-translate-y-px active:translate-y-0"
          >
            Demander une démo
          </a>
        </div>
      </nav>
    </header>
  );
}
