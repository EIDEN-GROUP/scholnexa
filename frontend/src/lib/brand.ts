/**
 * Essor — central white-label brand configuration.
 *
 * This is the single source of truth for the product identity. Change the
 * values below to rebrand the whole application (display name, tagline,
 * contact details, logo assets). Keep the palette variables in `styles.css`
 * (`--essor-*`) in sync with the brand colours referenced here.
 *
 * Brand identity derived from the Essor Brand Book v1.0 (May 2026):
 *   • Logotype — 3 connected blue petals + a coral point.
 *   • Palette  — Electric Blue #2563EB · Coral #FF6B4A · Lavender #7C5CFF ·
 *                Sky #22D3EE · Deep Ink #0B1220 · Mist #F3F5F9 · White #FFFFFF.
 *   • Type     — Manrope (display) · Inter (UI / web).
 *   • Voice    — Human, clear, optimistic.  "Tout avance, simplement."
 */
export const BRAND = {
  /** Product / establishment display name. */
  name: "Essor",

  /** Lowercase wordmark used in the logo (no capital E). */
  wordmark: "essor",

  /** Headline used in copy and on the loading screen. */
  tagline: "La solution tout-en-un pour votre école",
  taglineEn: "All-in-one platform for your school",

  /** Brand promise. */
  promise: "Tout avance, simplement.",

  /** Academic descriptor used on document letterheads. */
  academicLabel: "Établissement de formation",

  /** Email sender name and contact addresses. */
  emailSender: "Essor",
  supportEmail: "contact@eiden-group.com",
  contactEmail: "contact@eiden-group.com",

  /** Physical address shown on generated documents. */
  address: "Avenue Mohammed V, Agadir, Maroc",
  phone: "+212 5 00 00 00 00",

  /** Static assets — placed in /public.
   * `logoPath` is the light-background horizontal wordmark (header / login);
   * `logoMarkPath` is the icon-only mark (sidebar, splash, favicon, emails);
   * `logoDarkPath` is the same wordmark for dark surfaces (footer of emails
   * sent on white, etc.). */
  logoPath: "/essor-logo-full.png",
  logoMarkPath: "/essor-logo-mark.png",
  logoDarkPath: "/essor-logo-full.png",
  faviconPath: "/essor-logo-mark.png",

  /** Footer line used on generated PDFs. */
  documentFooter:
    "Document généré par la plateforme Essor — usage interne.",

  /** Email footer used on automated messages. */
  emailFooter:
    "Essor — e-mail automatique, merci de ne pas y répondre.",

  /** SEO defaults. */
  seo: {
    siteName: "Essor",
    siteUrl: "https://essor.eiden-group.com",
    locale: "fr_MA",
    defaultTitle: "Essor — Plateforme tout-en-un pour écoles paramédicales au Maroc",
    defaultDescription:
      "Essor centralise la gestion de votre école, votre équipe et vos étudiants : plannings, paiements, bulletins, stages cliniques et reporting. En ligne en 48h. Sans engagement.",
    twitterHandle: "@essor_app",
  },

  /** Prefix used for auto-generated student registration numbers. */
  matriculePrefix: "ESSR",

  /** Prefix used for payment receipt numbers. */
  receiptPrefix: "ESSR",
} as const;

export type Brand = typeof BRAND;
