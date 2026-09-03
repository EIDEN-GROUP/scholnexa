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
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  OG_IMAGE,
  SITE_ORIGIN,
  SITE_GRAPH,
  canonicalUrl,
  resolvePageSeo,
  robotsFor,
} from "../lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
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
          Cette page n'a pas pu charger
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Une erreur est survenue. Réessayez ou revenez à l'accueil.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_GRAPH_JSON = JSON.stringify(SITE_GRAPH);

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ match }) => {
    const seo = resolvePageSeo(match.pathname);
    const canonical = canonicalUrl(seo.path);
    const robots = robotsFor(match.pathname);
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: seo.title || DEFAULT_TITLE },
        { name: "description", content: seo.description || DEFAULT_DESCRIPTION },
        { name: "author", content: "Eiden Group" },
        { name: "robots", content: robots },
        { name: "theme-color", content: "#2563EB" },
        { property: "og:site_name", content: "Essor" },
        { property: "og:locale", content: "fr_MA" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: seo.title || DEFAULT_TITLE },
        { property: "og:description", content: seo.description || DEFAULT_DESCRIPTION },
        { property: "og:url", content: canonical },
        { property: "og:image", content: OG_IMAGE.url },
        { property: "og:image:width", content: String(OG_IMAGE.width) },
        { property: "og:image:height", content: String(OG_IMAGE.height) },
        { property: "og:image:alt", content: OG_IMAGE.alt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seo.title || DEFAULT_TITLE },
        { name: "twitter:description", content: seo.description || DEFAULT_DESCRIPTION },
        { name: "twitter:image", content: OG_IMAGE.url },
        { name: "twitter:image:alt", content: OG_IMAGE.alt },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        // Canonical matches the current page URL, not always the site root.
        { rel: "canonical", href: canonical },
        { rel: "alternate", hreflang: "fr-MA", href: canonical },
        { rel: "alternate", hreflang: "x-default", href: canonical },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800;900&family=Inter:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap",
        },
        { rel: "icon", type: "image/png", href: "/favicon.png" },
        { rel: "apple-touch-icon", href: "/favicon.png" },
      ],
    };
  },

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr-MA">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {/* Site-wide Organization + WebSite + SoftwareApplication graph.
            Per-page WebPage schema is emitted inside individual routes. */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: SITE_GRAPH_JSON }}
        />
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
      <Analytics />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
