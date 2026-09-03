import { AlarmClock, CalendarDays, CheckCircle2, FileText } from "lucide-react";
import { Overline } from "./brand";
import { track } from "@/lib/analytics";

export function PlanPanel() {
  return (
    <section id="planning" className="bg-background px-4 py-10 sm:px-5 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <div className="grain relative overflow-hidden rounded-[2rem] bg-panel-blue p-6 sm:p-10 lg:p-14">
          <img
            src="/brand/decor/calendar-corner.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-6 -right-6 w-32 opacity-90 sm:w-44"
          />
          <img
            src="/brand/decor/cloud-soft-sky.png"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-8 w-48 opacity-70 sm:w-60"
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
            <div className="lg:pt-4">
              <Overline tone="muted">Planning</Overline>
              <h2 className="mt-5 text-[clamp(1.9rem,4vw,3rem)]">
                Un planning qui ne se discute plus le matin.
              </h2>
              <p className="mt-6 max-w-sm text-[1rem] leading-relaxed text-ink-soft">
                Les séances, les salles et les formateurs tiennent dans une seule vue. Quand quelque
                chose bouge, tout le monde le voit, sans un seul message de groupe.
              </p>
              <a
                href="#tarifs"
                onClick={() =>
                  track("CTA Clicked", { location: "plan-panel", label: "Voir le planning en démo" })
                }
                className="mt-8 inline-block rounded-full bg-card px-6 py-3 text-[0.9rem] font-semibold shadow-card transition-transform duration-200 hover:-translate-y-0.5"
              >
                Voir le planning en démo
              </a>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PanelCard icon={CalendarDays} title="Agenda">
                <div className="rounded-xl bg-panel-blue/70 p-4">
                  <p className="text-[0.95rem] font-semibold">1 sept.</p>
                  <p className="font-display text-xl font-extrabold text-blue">Aujourd'hui</p>
                  <p className="text-[0.85rem] text-muted-foreground">Mardi · 18 séances</p>
                </div>
              </PanelCard>

              <PanelCard icon={CheckCircle2} title="Séances">
                <ul className="space-y-2 text-[0.82rem]">
                  <li className="flex items-center gap-2 text-muted-foreground line-through">
                    <span className="grid size-4 shrink-0 place-items-center rounded-[4px] bg-blue text-[9px] text-card">
                      ✓
                    </span>
                    Bilan Adam B.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-4 shrink-0 rounded-[4px] border border-border" />
                    <span className="truncate">Motricité · salle 2</span>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      14:00
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-4 shrink-0 rounded-[4px] border border-border" />
                    <span className="truncate">Suivi Youssef T.</span>
                  </li>
                </ul>
              </PanelCard>

              <PanelCard icon={FileText} title="Dossier">
                <div className="rounded-xl border border-border/70 p-3">
                  <p className="text-[0.85rem] font-semibold">Lina K.</p>
                  <p className="mt-1.5 text-[0.78rem] leading-snug text-muted-foreground">
                    Objectif du trimestre noté par le formateur, visible par toute l'équipe.
                  </p>
                </div>
              </PanelCard>

              <PanelCard icon={AlarmClock} title="Rappels">
                <ul className="space-y-2 text-[0.82rem]">
                  <li className="flex gap-2">
                    <span className="shrink-0 font-mono text-coral">08:30</span>
                    <span>SMS aux étudiants du jour</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="shrink-0 font-mono text-coral">17:10</span>
                    <span>3 mensualités à relancer</span>
                  </li>
                </ul>
              </PanelCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-card">
      <header className="flex min-w-0 items-center gap-2.5">
        <Icon strokeWidth={1.5} className="size-[18px] shrink-0" />
        <h3 className="truncate text-[0.95rem] font-bold">{title}</h3>
      </header>
      <div className="mt-auto">{children}</div>
    </article>
  );
}
