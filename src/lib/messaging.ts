import nodemailer from "nodemailer";
import { sendSMS as atSendSMS } from "./africastalking";

// ── SMS via Africa's Talking ───────────────────────────────────────────────────
export async function sendSMS({
  to,
  body,
  apiKey,
  username,
  from,
}: {
  to: string;
  body: string;
  apiKey?: string;
  username?: string;
  from?: string;
}): Promise<{ messageId: string; status: string }> {
  const result = await atSendSMS({ to, message: body, apiKey, username, from });
  return { messageId: result.messageId, status: result.status };
}

// ── Email via Nodemailer (SMTP) ────────────────────────────────────────────────
export async function sendEmail({
  to,
  toName,
  subject,
  htmlBody,
  textBody,
  smtpHost,
  smtpPort,
  smtpUser,
  smtpPass,
  smtpFrom,
}: {
  to: string;
  toName?: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
}): Promise<{ messageId: string }> {
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const info = await transporter.sendMail({
    from: smtpFrom,
    to: toName ? `${toName} <${to}>` : to,
    subject,
    html: htmlBody,
    text: textBody || htmlBody.replace(/<[^>]*>/g, ""),
  });

  return { messageId: info.messageId };
}

// ── Template variable replacement ─────────────────────────────────────────────
export function applyTemplate(
  template: string,
  contact: { name: string; email?: string | null; phone?: string; company?: string | null }
): string {
  return template
    .replace(/\{\{name\}\}/gi, contact.name || "")
    .replace(/\{\{email\}\}/gi, contact.email || "")
    .replace(/\{\{phone\}\}/gi, contact.phone || "")
    .replace(/\{\{company\}\}/gi, contact.company || "");
}
