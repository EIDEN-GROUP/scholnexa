# White-Label / Rebranding Guide

Scholnexa is designed so that rebranding takes minutes, not days. The product
identity is centralized in three places:

| What | Where |
|---|---|
| Name, tagline, contact, PDF/email wording | `frontend/src/lib/brand.ts` |
| Logo & favicon | `frontend/public/scholnexa-logo.png`, `frontend/public/scholnexa-logo-mark.png`, `favicon.png` |
| Brand colours | `frontend/src/styles.css` | the `--scholnexa-*` variables |

## 1. Application name

Edit `frontend/src/lib/brand.ts`:

```ts
export const BRAND = {
  name: "Scholnexa",            // ← display name
  tagline: "Plateforme de gestion scolaire",
  academicLabel: "Établissement de formation",
  emailSender: "Scholnexa",
  supportEmail: "support@scholnexa.com",
  contactEmail: "contact@scholnexa.com",
  address: "Avenue Mohammed V, Agadir, Maroc",
  phone: "+212 5 00 00 00 00",
  matriculePrefix: "SCHX",      // ← student registration number prefix
  receiptPrefix: "SCHX",        // ← payment receipt number prefix
  documentFooter: "Document généré par la plateforme Scholnexa | usage interne.",
  emailFooter: "Scholnexa | e-mail automatique, merci de ne pas y répondre.",
};
```

These values flow into the login screen, loading screen, PDF letterheads,
email templates, document footers and generated registration numbers.

### Browser title & SEO

`frontend/index.html` holds the `<title>` and meta/OpenGraph description.
Change them to your school name.

### Sidebar / shell

The sidebar and shell import the logo from `BRAND.logoMarkPath` | nothing else
to change.

## 2. Logo & favicon

Client source files live in `assets/` at the repo root (`logo.*` = dark
mark, `logo-title.*` = white lockup). The optimized web assets in
`frontend/public/` are generated from them (resized PNGs | no image library
is needed at build time). Replace the sources, then regenerate the optimized
files with any image tool and keep the filenames below:

- `frontend/public/scholnexa-logo.png` | white-background lockup
  (mark + wordmark), used on the login page
- `frontend/public/scholnexa-logo-mark.png` | dark-background mark
  (sidebar, loading screen, PDFs, e-mails)
- `frontend/public/favicon.png` and `frontend/public/apple-touch-icon.png`
  | favicon variants

The mark is displayed at 40–96 px in the UI and ~48 pt in PDF letterheads.

## 3. Colours

`frontend/src/styles.css` defines the palette as CSS custom properties:

| Variable | Default (royal blue) |
|---|---|
| `--scholnexa-blue` | `#2563eb` (primary brand) |
| `--scholnexa-blue-dk` | `#1e40af` (hover/pressed) |
| `--scholnexa-blue-md` | `#1d4ed8` (gradients) |
| `--scholnexa-blue-lt` | `#60a5fa` |
| `--scholnexa-blue-pale` | `#dbeafe` (tints, borders) |
| `--scholnexa-blue-wash` | `#eff6ff` (surfaces) |
| `--scholnexa-ink` | `#14213d` (text) |
| `--scholnexa-red` | `#e51e26` (errors only) |

The `--chart-1..7` ramp and the `--legacy-*` aliases follow automatically.
Also update the `PALETTE` object in `frontend/src/lib/branded-doc.ts` (PDF and
email colours) to match.

## 4. Contact details

Update `BRAND` in `brand.ts`, the `institut` defaults in
`frontend/src/routes/dashboard.settings.tsx` (Settings → Institut), and the
`FROM_EMAIL` / `ADMIN_EMAIL` / `CORS_ORIGIN` variables in your environment.

## 5. Demo data

Demo users, students and partner structures live in:

- `frontend/src/lib/scholnexa-data.ts` (frontend mock dataset)
- `backend/scripts/seed-demo.ts` (backend seed)
- `backend/samples/etudiants-import-example.csv` (CSV import example)
- `frontend/src/components/import-etudiants-dialog.tsx` (example rows in the
  import dialog)

The demo uses clearly fictional records on the `@demo.scholnexa.ma` domain.
Replace names/emails with your own sample data if desired | the structure and
workflows stay the same.

## 6. Public branding checklist

After rebranding, run:

```bash
grep -rni 'scholnexa' frontend/src backend/src | grep -v node_modules
```

to find every remaining reference and decide whether it should point to your
new name. Remember to regenerate `npm run build` afterwards so the logo and
title changes are baked into the bundle.
