/**
 * Demande de démo — formulaire public de la landing page Scholnexa.
 *
 * Construit les deux e-mails (confirmation visiteur + notification admin) côté
 * client puis les délègue au endpoint public `POST /send-demo` du backend
 * Fastify (voir backend/src/routes/email.ts). Si le SMTP n'est pas configuré,
 * le backend renvoie `{ ok: false }` et le formulaire affiche l'erreur générique.
 */

import { BRAND } from "@/lib/brand";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export type DemoRequest = {
  center: string;
  email: string;
  phone: string;
  preferredDate: string;
  message?: string;
};

export type DemoRequestResult = { ok: true } | { ok: false; error: string };

type Rendered = { subject: string; html: string; text: string };

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderVisitorConfirmationEmail(data: DemoRequest): Rendered {
  const subject = `Votre demande de démo Scholnexa — ${data.center}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a3e39;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Merci ${esc(data.center)} !</h1>
      <p>Nous avons bien reçu votre demande de démonstration de <strong>Scholnexa</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Date souhaitée</td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${esc(data.preferredDate)}</strong></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Email</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${esc(data.email)}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Téléphone</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${esc(data.phone)}</td></tr>
        ${data.message ? `<tr><td style="padding: 8px;">Message</td><td style="padding: 8px;">${esc(data.message)}</td></tr>` : ""}
      </table>
      <p>Notre équipe vous recontacte sous 2h ouvrées pour confirmer le créneau.</p>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">${esc(BRAND.emailFooter)}</p>
    </div>`;
  const text = `Merci ${data.center} ! Demande de démo Scholnexa reçue pour le ${data.preferredDate}. Notre équipe vous recontacte sous 2h ouvrées.`;
  return { subject, html, text };
}

function renderAdminNotificationEmail(data: DemoRequest): Rendered {
  const subject = `Nouvelle demande de démo — ${data.center}`;
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; color: #1a3e39;">
      <h1 style="font-size: 20px; margin: 0 0 16px;">Nouvelle demande de démonstration</h1>
      <p><strong>${esc(data.center)}</strong> a demandé une démo de <strong>Scholnexa</strong>.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Établissement</td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${esc(data.center)}</strong></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Date souhaitée</td><td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${esc(data.preferredDate)}</strong></td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Email</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${esc(data.email)}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #ddd;">Téléphone</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${esc(data.phone)}</td></tr>
        ${data.message ? `<tr><td style="padding: 8px;">Message</td><td style="padding: 8px;">${esc(data.message)}</td></tr>` : ""}
      </table>
      <p style="margin-top: 24px; color: #666; font-size: 12px;">${esc(BRAND.emailFooter)}</p>
    </div>`;
  const text = `Nouvelle demande de démo Scholnexa — ${data.center} (${data.email}, ${data.phone}) pour le ${data.preferredDate}.${data.message ? ` Message : ${data.message}` : ""}`;
  return { subject, html, text };
}

/**
 * Envoie la demande de démo au backend : le visiteur reçoit une confirmation
 * et l'équipe commerciale reçoit la notification (replyTo = visiteur).
 */
export async function submitDemoRequest({
  data,
}: {
  data: DemoRequest;
}): Promise<DemoRequestResult> {
  const visitor = renderVisitorConfirmationEmail(data);
  const admin = renderAdminNotificationEmail(data);

  try {
    const res = await fetch(`${API_BASE}/email/send-demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitor: {
          to: data.email,
          subject: visitor.subject,
          html: visitor.html,
          text: visitor.text,
        },
        admin: {
          to: BRAND.contactEmail,
          subject: admin.subject,
          html: admin.html,
          text: admin.text,
        },
      }),
    });

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}` };
    }

    const body = (await res.json()) as { ok?: boolean; error?: string };
    if (body.ok) return { ok: true };
    return { ok: false, error: body.error ?? "Erreur inconnue" };
  } catch {
    return { ok: false, error: "Réseau indisponible" };
  }
}
