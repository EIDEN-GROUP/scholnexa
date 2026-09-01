import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate, requireRole } from "@/middleware/auth";
import { getDb } from "@/db";
import { emailLogs } from "@/db/schema/email-logs";
import { settings } from "@/db/schema/settings";
import nodemailer from "nodemailer";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getEnv } from "@/config/env";

const sendSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().optional(),
  text: z.string().optional(),
  message: z.string().optional(),
  parentName: z.string().optional(),
  attachments: z
    .array(
      z.object({
        filename: z.string(),
        content: z.string(), // base64-encoded
        contentType: z.string().optional(),
      }),
    )
    .optional(),
});

const receiptSchema = z.object({
  to: z.string().email(),
  parentName: z.string(),
  receipt: z.string(),
  amount: z.number(),
  date: z.string(),
  mode: z.string(),
  period: z.string(),
  pdfUrl: z.string().optional(),
});

let _transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!_transporter) {
    const env = getEnv();
    if (env.SMTP_HOST) {
      _transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }
  return _transporter;
}

/* ------------------------------------------------------------------
 * Essor brand tokens — kept in sync with the frontend design system.
 * Used in the email templates below so receipts / notifications
 * share the same look as the in-app surfaces.
 * ------------------------------------------------------------------ */
const ESSOR = {
  ink: "#0B1220",
  ink2: "#1E293B",
  ink3: "#475569",
  blue: "#2563EB",
  blueDk: "#1E40AF",
  blueLt: "#60A5FA",
  bluePale: "#DBEAFE",
  blueWash: "#EFF6FF",
  coral: "#FF6B4A",
  mist: "#F3F5F9",
  white: "#FFFFFF",
  border: "#E2E8F0",
  borderStrong: "#CBD5E1",
  fontStack:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  displayStack:
    "Manrope, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  logoUrl: "https://essor.eiden-group.com/essor-wordmark.png",
  logoMarkUrl: "https://essor.eiden-group.com/essor-logo-mark.png",
};

/**
 * Shared, responsive email chrome — header with the Essor wordmark, a
 * single-content body, and a footer with contact details and an
 * unsubscribe / auto-mailer notice. Inline-styled for max compatibility
 * with Outlook, Gmail, Apple Mail.
 */
function essorEmailShell(args: {
  preheader: string;
  bodyHtml: string;
  accent?: string;
}) {
  const accent = args.accent ?? ESSOR.blue;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<meta name="supported-color-schemes" content="light only" />
<title>Essor</title>
</head>
<body style="margin:0;padding:0;background:${ESSOR.blueWash};font-family:${ESSOR.fontStack};color:${ESSOR.ink};-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;">
<span style="display:none;visibility:hidden;mso-hide:all;font-size:1px;color:${ESSOR.blueWash};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${args.preheader}</span>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,${ESSOR.blueWash} 0%,${ESSOR.mist} 100%);">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:${ESSOR.white};border-radius:24px;overflow:hidden;box-shadow:0 20px 60px -16px rgba(37,99,235,0.15),0 8px 24px -8px rgba(11,18,32,0.08);">
        <!-- Header with gradient -->
        <tr>
          <td style="background:linear-gradient(135deg,${ESSOR.blue} 0%,${ESSOR.blueDk} 100%);padding:32px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left">
                  <div style="display:inline-block;background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);padding:10px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">
                    <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:${ESSOR.coral};margin-right:10px;box-shadow:0 0 12px rgba(255,107,74,0.6);"></span>
                    <span style="font-family:${ESSOR.displayStack};font-weight:800;font-size:20px;letter-spacing:-0.5px;color:${ESSOR.white};vertical-align:middle;">essor</span>
                  </div>
                </td>
                <td align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-weight:600;">Plateforme scolaire</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Accent line -->
        <tr><td style="height:3px;background:linear-gradient(90deg,${ESSOR.coral} 0%,${ESSOR.blue} 50%,${ESSOR.blueLt} 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <!-- Body content -->
        <tr>
          <td style="padding:48px 40px 32px 40px;font-family:${ESSOR.fontStack};color:${ESSOR.ink};">
            ${args.bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(to bottom,${ESSOR.white} 0%,${ESSOR.mist} 100%);border-top:1px solid ${ESSOR.border};font-family:${ESSOR.fontStack};font-size:13px;color:${ESSOR.ink3};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom:16px;">
                  <span style="display:inline-block;vertical-align:middle;width:6px;height:6px;border-radius:50%;background:${ESSOR.coral};margin-right:8px;"></span>
                  <span style="font-family:${ESSOR.displayStack};font-weight:800;font-size:16px;color:${ESSOR.ink};vertical-align:middle;">essor</span>
                </td>
              </tr>
              <tr>
                <td style="line-height:1.8;padding-bottom:16px;">
                  <a href="mailto:contact@eiden-group.com" style="color:${accent};text-decoration:none;font-weight:500;">contact@eiden-group.com</a>
                  <span style="color:${ESSOR.border};margin:0 8px;">|</span>
                  <a href="https://essor.eiden-group.com" style="color:${accent};text-decoration:none;font-weight:500;">essor.eiden-group.com</a>
                </td>
              </tr>
              <tr>
                <td style="font-size:12px;color:${ESSOR.ink3};line-height:1.6;">
                  E-mail automatique — merci de ne pas y répondre directement.<br/>
                  <span style="color:${ESSOR.ink2};">© 2026 Essor · Tous droits réservés.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <!-- Email client note -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;margin-top:24px;">
        <tr>
          <td align="center" style="font-size:12px;color:${ESSOR.ink3};line-height:1.6;">
            Cet e-mail a été envoyé par Essor, la plateforme tout-en-un pour votre école.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

/** Small inline-SVG mark used inside emails — no external request. */
function essorMarkSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 64 64" aria-label="Essor" style="display:inline-block;vertical-align:middle;">
    <defs>
      <linearGradient id="eA" x1="32" y1="10" x2="32" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#3B82F6"/><stop offset="1" stop-color="#1D4ED8"/>
      </linearGradient>
      <linearGradient id="eB" x1="10" y1="32" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#1D4ED8"/><stop offset="1" stop-color="#0B1E60"/>
      </linearGradient>
      <linearGradient id="eC" x1="42" y1="16" x2="42" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2563EB"/><stop offset="1" stop-color="#0B1220"/>
      </linearGradient>
      <radialGradient id="eD" cx="0.5" cy="0.45" r="0.55">
        <stop offset="0" stop-color="#FFB199"/><stop offset="0.45" stop-color="#FF6B4A"/><stop offset="1" stop-color="#E25537"/>
      </radialGradient>
    </defs>
    <path d="M32 12 C 39 17, 41 26, 35 32 C 31 36, 26 35, 25 30 C 24 24, 27 16, 32 12 Z" fill="url(#eA)"/>
    <path d="M16 32 C 12 25, 14 16, 22 15 C 28 15, 32 19, 31 25 C 30 30, 24 33, 19 33 C 17 33, 16 33, 16 32 Z" fill="url(#eB)"/>
    <path d="M46 26 C 52 30, 53 38, 47 43 C 41 47, 34 45, 32 40 C 31 35, 36 29, 43 27 C 44 26, 45 26, 46 26 Z" fill="url(#eC)"/>
    <circle cx="35" cy="24" r="3.2" fill="url(#eD)"/>
  </svg>`;
}

export async function emailRoutes(app: FastifyInstance) {
  app.post("/send", { preHandler: [authenticate, requireRole("directeur", "responsable")] }, async (request) => {
    const input = sendSchema.parse(request.body);
    const env = getEnv();
    const transporter = getTransporter();

    if (!transporter) {
      return { ok: false, error: "SMTP non configuré" };
    }

    const html = input.html ?? input.message ?? input.text ?? "";
    const text = input.text ?? input.message ?? "";

    const mailOptions: nodemailer.SendMailOptions = {
      from: env.FROM_EMAIL,
      to: input.to,
      subject: input.subject,
      html,
      text,
    };

    if (input.attachments?.length) {
      mailOptions.attachments = input.attachments.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content, "base64"),
        contentType: a.contentType ?? "application/pdf",
      }));
    }

    try {
      await transporter.sendMail(mailOptions);

      await logEmail(input.to, input.subject, "custom", "sent");

      return { ok: true };
    } catch (err) {
      await logEmail(
        input.to,
        input.subject,
        "custom",
        "failed",
        err instanceof Error ? err.message : "Unknown",
      );
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      };
    }
  });

  app.post("/send-receipt", { preHandler: [authenticate, requireRole("directeur", "responsable")] }, async (request) => {
    const input = receiptSchema.parse(request.body);
    const env = getEnv();
    const transporter = getTransporter();

    if (!transporter) {
      return { ok: false, error: "SMTP non configuré" };
    }

    const db = getDb();
    const settingsRows = await db.select().from(settings);
    const settingsMap: Record<string, any> = {};
    for (const r of settingsRows) settingsMap[r.key] = r.value;
    const stampImage = settingsMap.stamp_image as string | null;

    /* ----------------------------------------------------------------
     * PDF — Essor-branded receipt
     * ---------------------------------------------------------------- */
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const page = pdfDoc.addPage([595, 842]);
    const { height, width } = page.getSize();

    // Brand band across the top
    page.drawRectangle({
      x: 0,
      y: height - 96,
      width,
      height: 96,
      color: rgb(0.043, 0.071, 0.125), // #0B1220
    });
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 4,
      color: rgb(0.145, 0.388, 0.922), // #2563EB
    });

    // Wordmark in white (text only — pure pdf-lib, no font work for the mark)
    page.drawText("essor", {
      x: 50,
      y: height - 60,
      size: 28,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
    page.drawText("·", {
      x: 50 + fontBold.widthOfTextAtSize("essor", 28) + 4,
      y: height - 60,
      size: 28,
      font: fontBold,
      color: rgb(1, 0.42, 0.29), // coral
    });
    page.drawText("Reçu de paiement", {
      x: 50 + fontBold.widthOfTextAtSize("essor ·", 28) + 12,
      y: height - 60,
      size: 18,
      font,
      color: rgb(0.85, 0.9, 1),
    });

    page.drawText("PLATEFORME DE GESTION", {
      x: width - 50 - font.widthOfTextAtSize("PLATEFORME DE GESTION", 9),
      y: height - 40,
      size: 9,
      font: fontBold,
      color: rgb(0.6, 0.7, 0.9),
    });
    page.drawText("Plateforme de gestion des écoles", {
      x: width - 50 - font.widthOfTextAtSize("Plateforme de gestion des écoles", 9),
      y: height - 55,
      size: 9,
      font,
      color: rgb(0.85, 0.9, 1),
    });

    // Body
    let y = height - 150;
    page.drawText("Bonjour " + input.parentName + ",", {
      x: 50, y, size: 12, font, color: rgb(0.043, 0.071, 0.125),
    });
    y -= 22;
    page.drawText("Nous vous remercions pour votre règlement. Voici le détail de votre paiement :", {
      x: 50, y, size: 10, font, color: rgb(0.27, 0.33, 0.41),
    });
    y -= 30;

    // Table heading
    page.drawRectangle({ x: 50, y: y - 6, width: width - 100, height: 26, color: rgb(0.94, 0.96, 1) });
    page.drawText("Détails du paiement", {
      x: 60, y: y + 2, size: 11, font: fontBold, color: rgb(0.043, 0.071, 0.125),
    });
    y -= 30;

    const lines: [string, string][] = [
      ["Reçu", input.receipt],
      ["Montant", `${input.amount.toLocaleString("fr-FR")} MAD`],
      ["Date", input.date],
      ["Mode", input.mode],
      ["Période", input.period],
    ];
    for (const [label, value] of lines) {
      page.drawText(label, { x: 50, y, size: 10, font, color: rgb(0.27, 0.33, 0.41) });
      page.drawText(value, { x: 200, y, size: 10, font: fontBold, color: rgb(0.043, 0.071, 0.125) });
      // Hairline divider
      page.drawLine({
        start: { x: 50, y: y - 6 },
        end: { x: width - 50, y: y - 6 },
        thickness: 0.5,
        color: rgb(0.88, 0.91, 0.94),
      });
      y -= 22;
    }

    if (stampImage) {
      const comma = stampImage.indexOf(",");
      if (comma !== -1) {
        const raw = stampImage.slice(comma + 1);
        try {
          const bytes = Buffer.from(raw, "base64");
          const stampImg = await pdfDoc.embedPng(bytes);
          const BOX = 110;
          const aspect = stampImg.width / stampImg.height;
          let dw = BOX, dh = BOX;
          if (aspect > 1) dh = BOX / aspect;
          else dw = BOX * aspect;
          page.drawImage(stampImg, { x: width - 50 - dw, y: 90, width: dw, height: dh });
          page.drawText("Cachet de l'établissement", {
            x: width - 50 - dw, y: 78, size: 8, font,
            color: rgb(0.5, 0.5, 0.5),
          });
        } catch { /* ignore */ }
      }
    }

    // Footer
    page.drawText("Conservez ce reçu comme justificatif.", {
      x: 50, y: 60, size: 9, font, color: rgb(0.4, 0.46, 0.55),
    });
    page.drawText("© 2026 Essor · essor.eiden-group.com", {
      x: 50, y: 45, size: 9, font: fontBold, color: rgb(0.04, 0.07, 0.12),
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

    /* ----------------------------------------------------------------
     * HTML — responsive Essor-branded email
     * ---------------------------------------------------------------- */
    const formattedAmount = `${input.amount.toLocaleString("fr-FR")} MAD`;
    const bodyHtml = `
      <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${ESSOR.ink};">
        Bonjour <strong>${escapeHtml(input.parentName)}</strong>,
      </p>
      <p style="margin:0 0 28px 0;font-size:15px;line-height:1.6;color:${ESSOR.ink3};">
        Nous vous remercions pour votre règlement. Vous trouverez ci-dessous le reçu
        officiel émis par <strong style="color:${ESSOR.ink};">Essor</strong>. Le PDF
        complet est attaché à cet e-mail.
      </p>

      <!-- Highlight card -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:${ESSOR.blueWash};border:1px solid ${ESSOR.bluePale};border-radius:14px;margin:0 0 24px 0;">
        <tr>
          <td style="padding:24px 28px;">
            <p style="margin:0 0 4px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${ESSOR.blueDk};font-weight:700;">Montant encaissé</p>
            <p style="margin:0;font-family:${ESSOR.displayStack};font-weight:800;font-size:34px;letter-spacing:-1px;color:${ESSOR.ink};line-height:1.1;">${formattedAmount}</p>
            <p style="margin:8px 0 0 0;font-size:13px;color:${ESSOR.ink3};">Reçu n°&nbsp;<strong style="color:${ESSOR.ink};">${escapeHtml(input.receipt)}</strong> &nbsp;·&nbsp; ${escapeHtml(input.date)}</p>
          </td>
        </tr>
      </table>

      <!-- Detail rows -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin:0 0 24px 0;">
        ${detailRow("Période", input.period)}
        ${detailRow("Mode de règlement", input.mode)}
        ${detailRow("Référence", input.receipt)}
      </table>

      <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:${ESSOR.ink3};">
        Conservez ce reçu comme justificatif. Pour toute question, notre équipe reste disponible.
      </p>
    `;

    const html = essorEmailShell({
      preheader: `Reçu Essor · ${input.receipt} · ${formattedAmount}`,
      bodyHtml,
    });

    try {
      await transporter.sendMail({
        from: env.FROM_EMAIL,
        to: input.to,
        subject: `Reçu de paiement ${input.receipt} — Essor`,
        html,
        attachments: [
          {
            filename: `recu-${input.receipt}.pdf`,
            content: pdfBase64,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      });

      await logEmail(input.to, `Reçu ${input.receipt}`, "receipt", "sent");
      return { ok: true };
    } catch (err) {
      await logEmail(
        input.to,
        `Reçu ${input.receipt}`,
        "receipt",
        "failed",
        err instanceof Error ? err.message : "Unknown",
      );
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      };
    }
  });

  app.post("/send-demo", async (request) => {
    // Public endpoint (no auth required) for the landing page
    const input = z
      .object({
        visitor: sendSchema,
        admin: sendSchema,
      })
      .parse(request.body);

    const env = getEnv();
    const transporter = getTransporter();

    if (!transporter) {
      return { ok: false, error: "SMTP non configuré" };
    }

    try {
      await Promise.all([
        transporter.sendMail({
          from: env.FROM_EMAIL,
          to: input.visitor.to,
          subject: input.visitor.subject,
          html: input.visitor.html,
          text: input.visitor.text,
        }),
        transporter.sendMail({
          from: env.FROM_EMAIL,
          to: input.admin.to,
          subject: input.admin.subject,
          html: input.admin.html,
          text: input.admin.text,
          replyTo: input.visitor.to,
        }),
      ]);

      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : "Erreur inconnue",
      };
    }
  });

  app.get("/logs", { preHandler: [authenticate] }, async () => {
    const db = getDb();
    return db.select().from(emailLogs).orderBy(emailLogs.createdAt).limit(100);
  });
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:12px 0;border-bottom:1px solid ${ESSOR.border};font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${ESSOR.ink3};font-weight:600;width:42%;">${escapeHtml(label)}</td>
    <td style="padding:12px 0;border-bottom:1px solid ${ESSOR.border};font-size:14px;color:${ESSOR.ink};font-weight:600;text-align:right;">${escapeHtml(value)}</td>
  </tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function logEmail(
  recipient: string,
  subject: string,
  type: string,
  status: "sent" | "failed",
  errorMsg?: string,
) {
  try {
    const db = getDb();
    await db
      .insert(emailLogs)
      .values({ recipient, subject, type, status, errorMsg: errorMsg ?? "" });
  } catch {
    // Don't throw if logging fails
  }
}
