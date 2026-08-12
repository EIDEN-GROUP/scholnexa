/**
 * Scholnexa — central white-label brand configuration.
 *
 * This is the single source of truth for the product identity. Change the
 * values below to rebrand the whole application (display name, tagline,
 * contact details, logo assets). Keep the palette variables in `styles.css`
 * (`--scholnexa-*`) in sync with the brand colours referenced here.
 *
 * See WHITELABEL.md at the repository root for the full rebranding guide.
 */
export const BRAND = {
  /** Product / establishment display name. */
  name: "Scholnexa",

  /** Tagline shown under the wordmark on loading screens and login. */
  tagline: "Plateforme de gestion scolaire",
  taglineEn: "School Management System",

  /** Academic descriptor used on document letterheads. */
  academicLabel: "Établissement de formation",

  /** Email sender name and contact addresses. */
  emailSender: "Scholnexa",
  supportEmail: "support@scholnexa.com",
  contactEmail: "contact@scholnexa.com",

  /** Physical address shown on generated documents. */
  address: "Avenue Mohammed V, Agadir, Maroc",
  phone: "+212 5 00 00 00 00",

  /** Static assets — place the files in /public.
   * `logoPath` is the white-background lockup (login page); `logoMarkPath`
   * is the dark-background mark (sidebar, splash, favicon, PDFs, e-mails). */
  logoPath: "/scholnexa-logo.png",
  logoMarkPath: "/scholnexa-logo-mark.png",

  /** Footer line used on generated PDFs. */
  documentFooter:
    "Document généré par la plateforme Scholnexa — usage interne.",

  /** Email footer used on automated messages. */
  emailFooter: "Scholnexa — e-mail automatique, merci de ne pas y répondre.",

  /** Prefix used for auto-generated student registration numbers. */
  matriculePrefix: "SCHX",

  /** Prefix used for payment receipt numbers. */
  receiptPrefix: "SCHX",
} as const;

export type Brand = typeof BRAND;
