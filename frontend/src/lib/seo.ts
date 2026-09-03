/**
 * Single source of truth for all SEO / GEO / AEO metadata.
 *
 * Canonical domain, brand entity relationships, default title/description,
 * locale, social contact, product offers, and per-page metadata live here.
 * Route files and `__root.tsx` import from this module — they do not
 * hardcode SEO tokens independently. This guarantees one coherent signal
 * across the whole site (and prevents the previously-duplicated index.html
 * vs __root.tsx metadata divergence).
 *
 * DO NOT invent data here — anything that appears in JSON-LD must be
 * verifiable from the visible site copy (per the audit brief).
 */

/** Absolute canonical origin of the production marketing site. No trailing slash. */
export const SITE_ORIGIN = "https://essor.eiden-group.com";

/** Canonical absolute URL helper. `canonicalUrl("/x") => SITE_ORIGIN + "/x"` */
export function canonicalUrl(path = "/"): string {
  const normalized = path === "/" ? "/" : path.replace(/\/+$/, "");
  return `${SITE_ORIGIN}${normalized === "/" ? "/" : normalized}`;
}

/* ------------------------------------------------------------------ */
/* Entity relationships (Essor = product, Eiden Group = company).       */
/* ------------------------------------------------------------------ */

export const ORG = {
  /** Organization (@id reference used by publisher/@id). */
  id: `${SITE_ORIGIN}/#organization`,
  name: "Eiden Group",
  legalName: "Eiden Group",
  email: "contact@eiden-group.com",
  telephone: "+212777777428",
  logo: `${SITE_ORIGIN}/brand/essor-logo.png`,
  url: SITE_ORIGIN,
  address: {
    "@type": "PostalAddress" as const,
    streetAddress: "Agadir Bay, Technopole 1 Bloc B",
    addressLocality: "Agadir",
    postalCode: "80000",
    addressCountry: "MA",
  },
  // `sameAs` intentionally omitted: no verified Eiden-Group / Essor
  // official social or business profiles are known. Never fabricate these.
} as const;

export const WEBSITE = {
  id: `${SITE_ORIGIN}/#website`,
  name: "Essor",
  url: SITE_ORIGIN,
  inLanguage: "fr_MA",
  publisher: { "@id": ORG.id },
} as const;

export const PRODUCT = {
  id: `${SITE_ORIGIN}/#software`,
  name: "Essor",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "School management software",
  operatingSystem: "Web",
  url: SITE_ORIGIN,
  inLanguage: "fr_MA",
  publisher: { "@id": ORG.id },
} as const;

/* ------------------------------------------------------------------ */
/* Default page metadata                                               */
/* ------------------------------------------------------------------ */

/** Shared title suffix pattern: `"Page · Essor"`. */
export const BRAND_SUFFIX = "Essor";

/** Homepage-specific canonical title. */
export const HOME_TITLE =
  "Essor · Logiciel de gestion pour écoles et centres de formation au Maroc";

/** Homepage-specific canonical description. */
export const HOME_DESCRIPTION =
  "Essor, par Eiden Group (Agadir, Maroc), réunit inscriptions, emploi du temps, paiements et relances, " +
  "examens, bulletins et stages cliniques des écoles paramédicales — dans un seul espace en ligne. " +
  "Zéro Excel, zéro chaos.";

/** Fallback description used for pages that don't set their own. */
export const DEFAULT_DESCRIPTION = HOME_DESCRIPTION;

/** Fallback title used for pages that don't set their own. */
export const DEFAULT_TITLE = HOME_TITLE;

/** OG image used site-wide. Aspect ratio must be 1200×630 for best social rendering */
export const OG_IMAGE = {
  url: `${SITE_ORIGIN}/brand/essor-logo.png`,
  width: 1200,
  height: 630,
  alt: "Essor — plateforme de gestion pour écoles paramédicales au Maroc",
} as const;

/* ------------------------------------------------------------------ */
/* Pricing plans (must match visible marketing copy)                    */
/* ------------------------------------------------------------------ */

export const OFFERS = [
  {
    "@type": "Offer" as const,
    name: "Essentiel",
    price: "1000",
    priceCurrency: "MAD",
    description: "À partir de 1 000 MAD HT / mois, un administrateur.",
    url: `${SITE_ORIGIN}/#tarifs`,
  },
  {
    "@type": "Offer" as const,
    name: "Pro",
    price: "2000",
    priceCurrency: "MAD",
    description: "À partir de 2 000 MAD HT / mois, équipe multi-rôles.",
    url: `${SITE_ORIGIN}/#tarifs`,
  },
  {
    "@type": "Offer" as const,
    name: "Réseau",
    priceSpecification: {
      "@type": "PriceSpecification" as const,
      priceCurrency: "MAD",
    },
    description: "Sur devis, multi-campus.",
    url: `${SITE_ORIGIN}/#tarifs`,
  },
] as const;

/* ------------------------------------------------------------------ */
/* Feature list (must reflect visible marketing sections)              */
/* ------------------------------------------------------------------ */

export const FEATURE_LIST = [
  "Dossiers étudiants et inscriptions",
  "Emploi du temps et planning des séances",
  "Paiements mensuels, reçus et relances automatiques",
  "Examens, bulletins et relevés de notes",
  "Suivi des stages cliniques et conventions",
] as const;

/* ------------------------------------------------------------------ */
/* Type-safe per-page metadata                                         */
/* ------------------------------------------------------------------ */

export type PageSeo = {
  title: string;
  description: string;
  /** Relative pathname, e.g. "/" or "/confidentialite". Used to derive canonical. */
  path: string;
  /** Optional robots directive; default: index follow with big image preview. */
  robots?: string;
};

export const PAGES: Record<string, PageSeo> = {
  home: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    path: "/",
  },
  privacy: {
    title: "Politique de confidentialité · Essor (Eiden Group)",
    description:
      "Comment Essor (édité par Eiden Group, Agadir, Maroc) collecte, utilise et protège " +
      "les données de votre école, vos étudiants et vos visiteurs.",
    path: "/confidentialite",
  },
};

/* ------------------------------------------------------------------ */
/* JSON-LD builders                                                    */
/* ------------------------------------------------------------------ */

/** Graph embedded once inside <html> (organization/website/product). */
export const SITE_GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORG.id,
      name: ORG.name,
      legalName: ORG.legalName,
      url: ORG.url,
      logo: { "@type": "ImageObject", url: ORG.logo },
      email: ORG.email,
      telephone: ORG.telephone,
      address: ORG.address,
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE.id,
      url: WEBSITE.url,
      name: WEBSITE.name,
      inLanguage: WEBSITE.inLanguage,
      publisher: { "@id": ORG.id },
    },
    {
      "@type": "WebPage",
      "@id": canonicalUrl("/"),
      url: canonicalUrl("/"),
      name: HOME_TITLE,
      description: HOME_DESCRIPTION,
      inLanguage: "fr_MA",
      isPartOf: { "@id": WEBSITE.id },
      about: { "@id": `${SITE_ORIGIN}/#software` },
      publisher: { "@id": ORG.id },
    },
    {
      "@type": "SoftwareApplication",
      "@id": PRODUCT.id,
      name: PRODUCT.name,
      applicationCategory: PRODUCT.applicationCategory,
      applicationSubCategory: PRODUCT.applicationSubCategory,
      operatingSystem: PRODUCT.operatingSystem,
      url: PRODUCT.url,
      inLanguage: PRODUCT.inLanguage,
      description: HOME_DESCRIPTION,
      publisher: { "@id": ORG.id },
      offers: OFFERS,
      featureList: FEATURE_LIST,
    },
  ],
} as const;

/** Per-page WebPage schema (referenced by the visible H1 of that page). */
export function buildWebPage({ title, description, path }: PageSeo) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalUrl(path),
    url: canonicalUrl(path),
    name: title,
    description,
    inLanguage: "fr_MA",
    isPartOf: { "@id": WEBSITE.id },
    about: { "@id": PRODUCT.id },
    publisher: { "@id": ORG.id },
  } as const;
}

/* ------------------------------------------------------------------ */
/* Robots directive helpers                                             */
/* ------------------------------------------------------------------ */

/** Public, indexable. */
export const ROBOTS_INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

/** App / authenticated / non-marketing pages. No crawl, no link-follow. */
export const ROBOTS_NOINDEX = "noindex, nofollow, noimageindex";

/**
 * Resolve the robots directive for a given pathname.
 * Only the marketing surface (home, privacy, and any future public page)
 * is indexable. Everything under `/dashboard` and the auth surface is not.
 */
export function robotsFor(pathname: string): string {
  if (pathname.startsWith("/dashboard")) return ROBOTS_NOINDEX;
  if (pathname === "/login" || pathname.endsWith("/login")) return ROBOTS_NOINDEX;
  return ROBOTS_INDEX;
}

/**
 * Resolve the page SEO for the current pathname. Defaults to home values.
 * Extend `PAGES` when a new marketing page ships.
 */
export function resolvePageSeo(pathname: string): PageSeo {
  if (!pathname || pathname === "/") return PAGES.home;
  return PAGES[pathname.replace(/^\//, "").replace(/\//g, "")] ?? PAGES[pathname] ?? PAGES.home;
}
