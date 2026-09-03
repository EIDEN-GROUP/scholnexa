import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initAnalytics, trackPage } from "../lib/analytics";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://essor.eiden-group.com";
const SITE_TITLE = "Essor · Logiciel de gestion pour écoles et centres de formation";
const SITE_DESCRIPTION =
  "Essor réunit inscriptions, emploi du temps, paiements et relances, examens, bulletins et stages cliniques dans un seul espace en ligne. Conçu pour les écoles paramédicales au Maroc. Zéro Excel, zéro chaos.";

/**
 * Site-wide structured data for search engines and AI assistants
 * (Google AI Overviews, ChatGPT, Perplexity, Claude). The FAQ schema lives in
 * the FAQ section component; per-page titles/descriptions are set per route.
 */
const ORG_JSONLD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Eiden Group",
      url: SITE_URL,
      logo: `${SITE_URL}/brand/essor-logo.png`,
      email: "contact@eiden-group.com",
      telephone: "+212777777428",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Agadir Bay, Technopole 1 Bloc B",
        addressLocality: "Agadir",
        postalCode: "80000",
        addressCountry: "MA",
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Essor",
      inLanguage: "fr",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#software`,
      name: "Essor",
      applicationCategory: "BusinessApplication",
      applicationSubCategory: "School management software",
      operatingSystem: "Web",
      url: SITE_URL,
      inLanguage: "fr",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
      audience: {
        "@type": "Audience",
        audienceType: "Écoles et centres de formation privés, établissements paramédicaux",
      },
      featureList: [
        "Dossiers étudiants et inscriptions",
        "Emploi du temps et planning des séances",
        "Paiements mensuels, reçus et relances automatiques",
        "Examens, bulletins et relevés de notes",
        "Suivi des stages cliniques et conventions",
      ],
      offers: [
        {
          "@type": "Offer",
          name: "Essentiel",
          price: "1000",
          priceCurrency: "MAD",
          description: "À partir de 1 000 MAD HT / mois, un administrateur.",
        },
        {
          "@type": "Offer",
          name: "Pro",
          price: "2000",
          priceCurrency: "MAD",
          description: "À partir de 2 000 MAD HT / mois, équipe multi-rôles.",
        },
        {
          "@type": "Offer",
          name: "Réseau",
          description: "Sur devis, multi-campus.",
        },
      ],
    },
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SITE_TITLE },
      { name: "description", content: SITE_DESCRIPTION },
      { name: "author", content: "Eiden Group" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "language", content: "fr" },
      { property: "og:site_name", content: "Essor" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/brand/essor-logo.png` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SITE_TITLE },
      { name: "twitter:description", content: SITE_DESCRIPTION },
      { name: "twitter:image", content: `${SITE_URL}/brand/essor-logo.png` },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: SITE_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Inter:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/** Boots Amplitude once and emits a page view on every navigation. */
function Analytics() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    trackPage(pathname);
  }, [pathname]);

  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ORG_JSONLD }} />
      <Analytics />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
