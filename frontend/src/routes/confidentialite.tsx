import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/landing/site-nav";
import { Footer } from "@/components/landing/footer";
import { OG_IMAGE, PAGES, buildWebPage, canonicalUrl } from "@/lib/seo";

export const Route = createFileRoute("/confidentialite")({
  head: () => {
    const path = "/confidentialite";
    const canonical = canonicalUrl(path);
    return {
      meta: [
        { title: PAGES.privacy.title },
        { name: "description", content: PAGES.privacy.description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Essor" },
        { property: "og:locale", content: "fr_MA" },
        { property: "og:title", content: PAGES.privacy.title },
        { property: "og:description", content: PAGES.privacy.description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: OG_IMAGE.url },
        { property: "og:image:width", content: String(OG_IMAGE.width) },
        { property: "og:image:height", content: String(OG_IMAGE.height) },
        { property: "og:image:alt", content: OG_IMAGE.alt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: PAGES.privacy.title },
        { name: "twitter:description", content: PAGES.privacy.description },
        { name: "twitter:image", content: OG_IMAGE.url },
        { name: "twitter:image:alt", content: OG_IMAGE.alt },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: PrivacyPage,
});

const UPDATED = "1 septembre 2026";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mt-10 scroll-mt-28">
      <h2 className="font-display text-[1.4rem] font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[0.98rem] leading-relaxed text-ink-soft">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  const webPageSchema = buildWebPage({
    ...PAGES.privacy,
    path: "/confidentialite",
  });
  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <SiteNav />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-28 sm:pt-32">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          Confidentialité
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.8rem)] font-extrabold leading-[1.05] tracking-tight text-ink">
          Politique de confidentialité
        </h1>
        <p className="mt-4 text-[0.95rem] text-ink-soft">
          Dernière mise à jour : {UPDATED}. Cette politique explique quelles données Essor traite,
          pourquoi, et quels sont vos droits.
        </p>

        <Section id="responsable" title="1. Responsable du traitement">
          <p>
            Essor est un service édité par <strong>Eiden Group</strong>, Agadir Bay, Technopole 1
            Bloc B, Agadir 80000, Maroc. Pour toute question relative à vos données personnelles :{" "}
            <a
              href="mailto:contact@eiden-group.com"
              className="font-semibold text-blue hover:underline"
            >
              contact@eiden-group.com
            </a>
            .
          </p>
        </Section>

        <Section id="donnees" title="2. Données que nous traitons">
          <p>
            <strong>Visiteurs du site.</strong> Lorsque vous demandez une démo, nous collectons le
            nom de votre établissement, votre adresse e-mail, votre numéro de téléphone, la date
            souhaitée, la formule qui vous intéresse et le message éventuel que vous nous laissez.
          </p>
          <p>
            <strong>Données de mesure d'audience.</strong> Nous utilisons Amplitude pour comprendre
            comment le site et l'application sont utilisés (pages vues, clics, parcours, appareil,
            pays approximatif dérivé de l'adresse IP). Ces données servent à améliorer le produit et
            ne sont pas revendues.
          </p>
          <p>
            <strong>Comptes de l'application.</strong> Pour les écoles clientes : identité et rôle
            des membres de l'équipe (direction, scolarité, formateurs), adresse e-mail
            professionnelle et journaux de connexion.
          </p>
          <p>
            <strong>Données scolaires saisies par l'école.</strong> L'école cliente reste
            responsable des données qu'elle saisit dans Essor (dossiers étudiants, notes, bulletins,
            paiements, stages). Essor agit alors comme sous-traitant, sur instruction de l'école.
          </p>
        </Section>

        <Section id="finalites" title="3. Finalités et bases légales">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              Répondre à votre demande de démonstration et vous recontacter | exécution de mesures
              précontractuelles et intérêt légitime.
            </li>
            <li>
              Fournir, sécuriser et facturer le service aux écoles clientes | exécution du contrat.
            </li>
            <li>
              Mesurer l'audience et améliorer le produit | intérêt légitime (mesure proportionnée,
              sans profilage publicitaire).
            </li>
            <li>Respecter nos obligations légales et comptables | obligation légale.</li>
          </ul>
        </Section>

        <Section id="hebergement" title="4. Hébergement et sécurité">
          <p>
            Les données de l'application sont hébergées sur une infrastructure située dans l'Union
            européenne. Les échanges sont chiffrés en transit (TLS) et les données sensibles sont
            chiffrées au repos. L'accès est cloisonné par école et restreint aux comptes autorisés,
            avec des rôles distincts. Les accès administrateur d'Eiden Group sont limités,
            journalisés et utilisés uniquement pour la maintenance et le support.
          </p>
        </Section>

        <Section id="destinataires" title="5. Destinataires et sous-traitants">
          <p>
            Nous ne vendons ni ne louons vos données. Nous faisons appel à des prestataires
            techniques strictement nécessaires au fonctionnement du service :
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Hébergement infogéré (UE) pour la base de données et le stockage de fichiers.</li>
            <li>Amplitude, pour la mesure d'audience.</li>
            <li>Un prestataire d'envoi d'e-mails transactionnels (confirmations, relances).</li>
          </ul>
          <p>
            Chaque prestataire est encadré par un contrat prévoyant la confidentialité et la
            sécurité des données.
          </p>
        </Section>

        <Section id="conservation" title="6. Durée de conservation">
          <ul className="list-disc space-y-2 pl-5">
            <li>Demandes de démo non converties : 24 mois, puis suppression.</li>
            <li>
              Données des écoles clientes : pendant toute la durée du contrat, puis restituées ou
              supprimées dans un délai de 90 jours après résiliation.
            </li>
            <li>Données de mesure d'audience : 14 mois au maximum.</li>
            <li>Documents comptables : durée légale applicable.</li>
          </ul>
        </Section>

        <Section id="droits" title="7. Vos droits">
          <p>
            Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et de
            portabilité de vos données, ainsi que d'un droit d'opposition au traitement fondé sur
            l'intérêt légitime. Pour l'exercer, écrivez à{" "}
            <a
              href="mailto:contact@eiden-group.com"
              className="font-semibold text-blue hover:underline"
            >
              contact@eiden-group.com
            </a>
            . Si vous êtes étudiant ou membre du personnel d'une école cliente, adressez-vous
            d'abord à votre établissement, responsable de ces données.
          </p>
          <p>
            Au Maroc, vous pouvez également saisir la CNDP (Commission nationale de contrôle de la
            protection des données à caractère personnel).
          </p>
        </Section>

        <Section id="cookies" title="8. Cookies et traceurs">
          <p>
            Le site utilise un nombre limité de traceurs : ceux nécessaires à son fonctionnement et
            ceux d'Amplitude pour la mesure d'audience. Nous n'utilisons pas de cookies publicitaires
            ni de partage de données à des fins de ciblage. Vous pouvez bloquer les traceurs via les
            réglages de votre navigateur.
          </p>
        </Section>

        <Section id="modifications" title="9. Modifications">
          <p>
            Cette politique peut évoluer avec le service. Toute modification substantielle sera
            signalée sur cette page avec une nouvelle date de mise à jour.
          </p>
        </Section>

        <p className="mt-12 text-[0.9rem] text-ink-soft">
          <Link to="/" className="font-semibold text-blue hover:underline">
            ← Retour à l'accueil
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
