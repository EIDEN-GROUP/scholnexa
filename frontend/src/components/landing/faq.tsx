import { useState } from "react";
import { Plus } from "lucide-react";
import { Overline } from "./brand";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * FAQ landing section. The same Q&A list feeds a FAQPage JSON-LD block so
 * search engines and AI assistants (Google AI Overviews, ChatGPT, Perplexity,
 * Claude) can quote Essor's answers directly.
 */
export const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Qu'est-ce qu'Essor ?",
    a: "Essor est un logiciel de gestion pour les écoles et centres de formation, en particulier les établissements paramédicaux au Maroc. Il réunit les inscriptions et dossiers étudiants, l'emploi du temps, les paiements et relances, les examens, les bulletins et le suivi des stages cliniques dans un seul espace en ligne.",
  },
  {
    q: "À qui s'adresse Essor ?",
    a: "Aux directions d'écoles privées de santé (instituts d'infirmiers, de prothèse dentaire, de kinésithérapie, de sage-femme), aux responsables des affaires estudiantines et aux formateurs. Essor gère aussi bien un centre unique qu'un réseau multi-campus.",
  },
  {
    q: "Combien coûte Essor ?",
    a: "Trois formules : Essentiel à partir de 1 000 MAD HT par mois (un administrateur), Pro à partir de 2 000 MAD HT par mois (équipe multi-rôles, paiements, bulletins, stages) et Réseau sur devis pour le multi-campus. Le prix s'ajuste par tranche de 100 étudiants. L'engagement annuel offre deux mois gratuits.",
  },
  {
    q: "Y a-t-il des frais cachés ?",
    a: "Non. Le tarif affiché comprend la reprise de vos données, la formation des équipes, les mises à jour et le support. Aucun frais d'installation ni de licence supplémentaire.",
  },
  {
    q: "Combien de temps prend la mise en route ?",
    a: "La démo guidée dure 20 minutes. Une fois la décision prise, la reprise d'un fichier de plusieurs centaines de dossiers étudiants se fait en une matinée à partir d'un export Excel. Il n'y a rien à installer : Essor fonctionne dans le navigateur.",
  },
  {
    q: "Où sont hébergées les données ?",
    a: "Les données sont hébergées sur une infrastructure européenne, chiffrées en transit et au repos. Chaque école ne voit que ses propres données ; l'accès est réservé aux comptes de son équipe, avec des rôles distincts pour la direction, la scolarité et les formateurs.",
  },
  {
    q: "Peut-on récupérer ses données à tout moment ?",
    a: "Oui. Vous exportez à tout moment vos étudiants, paiements, notes et bulletins au format Excel ou PDF. Vos données vous appartiennent.",
  },
  {
    q: "Essor gère-t-il les paiements mensuels et les relances ?",
    a: "Oui. Essor suit les mensualités par étudiant, marque automatiquement les retards et impayés, édite les reçus et permet d'envoyer les relances par e-mail. La direction voit le montant restant à recouvrer en temps réel.",
  },
  {
    q: "Essor fonctionne-t-il pour les stages cliniques et les conventions ?",
    a: "Oui. Essor affecte les étudiants aux structures d'accueil (hôpitaux, cliniques), suit les places disponibles par service, génère les conventions de stage et enregistre leur signature.",
  },
  {
    q: "L'application est-elle en français ?",
    a: "Oui, l'interface est entièrement en français et adaptée au contexte des établissements marocains (filières, semestres, format des reçus et des relevés).",
  },
  {
    q: "Faut-il s'engager sur la durée ?",
    a: "Non. Les formules sont sans engagement en mensuel. L'option annuelle est un choix, pas une obligation, et vous fait économiser deux mois.",
  },
];

function faqJsonLd() {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  });
}

function Row({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/70">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v);
          if (!open) track("FAQ Opened", { question: q });
        }}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-[1.02rem] font-semibold text-ink">{q}</span>
        <Plus
          className={cn(
            "size-4 shrink-0 text-blue transition-transform duration-300",
            open && "rotate-45",
          )}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300",
          open ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <p className="min-h-0 max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft">{a}</p>
      </div>
    </div>
  );
}

export function FAQ() {
  return (
    <section id="faq" className="relative overflow-hidden bg-background py-14 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd() }} />
      <img
        src="/brand/decor/cloud-soft-sky.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-10 top-10 w-56 opacity-50 sm:w-72"
      />

      <div className="relative mx-auto max-w-3xl px-5">
        <div className="text-center">
          <Overline tone="coral">Questions fréquentes</Overline>
          <h2 className="mt-5 text-[clamp(1.9rem,4.4vw,3rem)]">Tout ce qu'on nous demande avant de commencer</h2>
        </div>

        <div className="mt-10">
          {FAQ_ITEMS.map((item) => (
            <Row key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <p className="mt-10 text-center text-[0.95rem] text-ink-soft">
          Une autre question ?{" "}
          <a href="#contact" className="font-semibold text-blue hover:underline">
            Écrivez-nous
          </a>{" "}
          ou appelez le{" "}
          <a href="tel:+212777777428" className="font-semibold text-blue hover:underline">
            07 77 77 74 28
          </a>
          .
        </p>
      </div>
    </section>
  );
}
