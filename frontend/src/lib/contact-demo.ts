/**
 * Demande de démo | formulaire public de la landing Essor.
 *
 * Construit les deux e-mails (confirmation visiteur + notification équipe) côté
 * client puis les envoie via `POST {VITE_API_URL}/email/send-demo` (endpoint
 * public du backend Fastify, voir backend/src/routes/email.ts). Sans SMTP
 * configuré le backend renvoie `{ ok: false, error }` et le formulaire l'affiche.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const CONTACT_EMAIL = "contact@eiden-group.com";

export type DemoRequest = {
  center: string;
  email: string;
  phone: string;
  preferredDate: string;
  message?: string;
  plan?: string;
};

export type DemoRequestResult = { ok: true } | { ok: false; error: string };

type Rendered = { subject: string; html: string; text: string };

/* Tokens de marque Essor (alignés sur styles.css) */
const C = {
  ink: "#05142A",
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
  fontStack:
    "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  displayStack:
    "Poppins, Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
} as const;

function esc(v: string): string {
  return v
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell(preheader: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>Essor</title>
</head>
<body style="margin:0;padding:0;background:${C.blueWash};font-family:${C.fontStack};color:${C.ink};-webkit-font-smoothing:antialiased;">
<span style="display:none;visibility:hidden;font-size:1px;color:${C.blueWash};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,${C.blueWash} 0%,${C.mist} 100%);">
  <tr>
    <td align="center" style="padding:48px 16px;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:${C.white};border-radius:24px;overflow:hidden;box-shadow:0 20px 60px -16px rgba(37,99,235,0.15),0 8px 24px -8px rgba(5,20,42,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${C.ink} 0%,${C.blueDk} 100%);padding:32px 40px;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="left">
                  <div style="display:inline-block;background:rgba(255,255,255,0.14);padding:10px 18px;border-radius:12px;border:1px solid rgba(255,255,255,0.2);">
                    <span style="display:inline-block;vertical-align:middle;width:8px;height:8px;border-radius:50%;background:${C.coral};margin-right:10px;"></span>
                    <span style="font-family:${C.displayStack};font-weight:800;font-size:20px;letter-spacing:-0.5px;color:${C.white};vertical-align:middle;">essor</span>
                  </div>
                </td>
                <td align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.8);font-weight:600;">Plateforme scolaire</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,${C.coral} 0%,${C.blue} 50%,${C.blueLt} 100%);font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr>
          <td style="padding:48px 40px 32px 40px;font-family:${C.fontStack};color:${C.ink};">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;background:linear-gradient(to bottom,${C.white} 0%,${C.mist} 100%);border-top:1px solid ${C.border};font-family:${C.fontStack};font-size:13px;color:${C.ink3};">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="padding-bottom:16px;">
                  <span style="display:inline-block;vertical-align:middle;width:6px;height:6px;border-radius:50%;background:${C.coral};margin-right:8px;"></span>
                  <span style="font-family:${C.displayStack};font-weight:800;font-size:16px;color:${C.ink};vertical-align:middle;">essor</span>
                </td>
              </tr>
              <tr>
                <td style="line-height:1.8;padding-bottom:16px;">
                  <a href="mailto:${CONTACT_EMAIL}" style="color:${C.blue};text-decoration:none;font-weight:500;">${CONTACT_EMAIL}</a>
                  <span style="color:${C.border};margin:0 8px;">|</span>
                  <a href="https://essor.eiden-group.com" style="color:${C.blue};text-decoration:none;font-weight:500;">essor.eiden-group.com</a>
                </td>
              </tr>
              <tr>
                <td style="font-size:12px;color:${C.ink3};line-height:1.6;">
                  E-mail automatique. Merci de ne pas y répondre directement.<br/>
                  <span style="color:${C.ink2};">© 2026 Essor · Tous droits réservés.</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function detailRow(label: string, value: string) {
  return `<tr>
    <td style="padding:14px 18px;border-bottom:1px solid ${C.border};font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:${C.ink3};font-weight:600;width:40%;background:${C.mist};">${esc(label)}</td>
    <td style="padding:14px 18px;border-bottom:1px solid ${C.border};font-size:15px;color:${C.ink};font-weight:600;text-align:right;background:${C.white};">${esc(value)}</td>
  </tr>`;
}

function creneauBlock(date: string) {
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,${C.blueWash} 0%,${C.bluePale} 100%);border:2px solid ${C.blue};border-radius:16px;margin:0 0 32px 0;">
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${C.blueDk};font-weight:700;">Créneau souhaité</p>
        <p style="margin:0;font-family:${C.displayStack};font-weight:800;font-size:26px;letter-spacing:-0.5px;color:${C.blue};line-height:1.1;">${esc(date)}</p>
      </td></tr>
    </table>`;
}

function renderVisitorEmail(d: DemoRequest): Rendered {
  const body = `
    <p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;font-weight:600;">
      Bonjour <strong style="color:${C.blue};">${esc(d.center)}</strong>,
    </p>
    <p style="margin:0 0 32px 0;font-size:15px;line-height:1.7;color:${C.ink2};">
      Merci pour votre intérêt pour <strong style="color:${C.ink};">Essor</strong>. Nous avons bien
      reçu votre demande de démonstration. Voici le récapitulatif de vos informations.
    </p>
    ${creneauBlock(d.preferredDate)}
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;margin:0 0 32px 0;border:1px solid ${C.border};border-radius:12px;overflow:hidden;">
      ${detailRow("École", d.center)}
      ${detailRow("Email", d.email)}
      ${detailRow("Téléphone", d.phone)}
      ${d.plan ? detailRow("Formule visée", d.plan) : ""}
      ${d.message ? detailRow("Message", d.message) : ""}
    </table>
    <div style="background:linear-gradient(to right,${C.mist} 0%,${C.white} 100%);border-left:4px solid ${C.blue};border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 10px 0;font-size:15px;line-height:1.7;font-weight:600;">Prochaine étape</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:${C.ink2};">
        Notre équipe vous recontacte sous <strong style="color:${C.blue};">2&nbsp;h ouvrées</strong>
        pour confirmer le créneau et préparer la démo avec vos cas concrets.
      </p>
    </div>`;
  return {
    subject: `Votre demande de démo Essor | ${d.center}`,
    html: emailShell(`Demande de démo Essor reçue pour ${d.center}`, body),
    text: `Bonjour ${d.center}, votre demande de démo Essor pour le ${d.preferredDate} a bien été reçue. Notre équipe vous recontacte sous 2h ouvrées.`,
  };
}

function renderAdminEmail(d: DemoRequest): Rendered {
  const body = `
    <p style="margin:0 0 12px 0;font-size:16px;line-height:1.7;font-weight:600;">
      <strong style="color:${C.blue};">${esc(d.center)}</strong> a demandé une démonstration d'Essor.
    </p>
    <p style="margin:0 0 32px 0;font-size:14px;line-height:1.7;color:${C.ink2};">
      Nouveau prospect qualifié pour une démo personnalisée.
    </p>
    ${creneauBlock(d.preferredDate)}
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;margin:0 0 32px 0;border:1px solid ${C.border};border-radius:12px;overflow:hidden;">
      ${detailRow("École", d.center)}
      ${detailRow("Email", d.email)}
      ${detailRow("Téléphone", d.phone)}
      ${d.plan ? detailRow("Formule visée", d.plan) : ""}
      ${d.message ? detailRow("Message", d.message) : ""}
    </table>
    <div style="background:linear-gradient(to right,${C.mist} 0%,${C.white} 100%);border-left:4px solid ${C.coral};border-radius:12px;padding:20px 24px;">
      <p style="margin:0 0 10px 0;font-size:15px;line-height:1.7;font-weight:600;">Action requise</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:${C.ink2};">
        Répondre à <a href="mailto:${esc(d.email)}" style="color:${C.blue};text-decoration:none;font-weight:600;">${esc(d.email)}</a>
        ou appeler le <strong style="color:${C.blue};">${esc(d.phone)}</strong> sous 2&nbsp;h ouvrées.
      </p>
    </div>`;
  return {
    subject: `Nouvelle demande de démo | ${d.center}`,
    html: emailShell(`Nouvelle demande de démo | ${d.center}`, body),
    text: `Nouvelle demande de démo Essor | ${d.center} (${d.email}, ${d.phone}) pour le ${d.preferredDate}.${d.plan ? ` Formule : ${d.plan}.` : ""}${d.message ? ` Message : ${d.message}` : ""}`,
  };
}

/** Envoie la demande : le visiteur reçoit une confirmation, l'équipe la notification. */
export async function submitDemoRequest(data: DemoRequest): Promise<DemoRequestResult> {
  const visitor = renderVisitorEmail(data);
  const admin = renderAdminEmail(data);

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
          to: CONTACT_EMAIL,
          subject: admin.subject,
          html: admin.html,
          text: admin.text,
        },
      }),
    });
    if (!res.ok) return { ok: false, error: `Erreur ${res.status}` };
    const body = (await res.json()) as { ok?: boolean; error?: string };
    return body.ok ? { ok: true } : { ok: false, error: body.error ?? "Erreur inconnue" };
  } catch {
    return { ok: false, error: "Serveur injoignable" };
  }
}
