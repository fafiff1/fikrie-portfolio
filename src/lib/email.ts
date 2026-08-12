import nodemailer from "nodemailer";
import { getEffectiveContactEmail } from "@/lib/site-config";

export type ContactEmailPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  to: string;
  from: string;
};

export type EmailDelivery =
  | { mode: "server" }
  | { mode: "client"; receiverEmail: string };

function getSmtpConfig(receiverEmail?: string | null): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = receiverEmail || process.env.CONTACT_RECEIVER_EMAIL;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !to || !from) {
    return null;
  }

  return { host, port, user, pass, to, from };
}

function getEnvReceiverEmail(): string | null {
  const email = process.env.CONTACT_RECEIVER_EMAIL?.trim();
  return email || null;
}

export async function getEmailDelivery(): Promise<EmailDelivery | null> {
  const receiverEmail = await getEffectiveContactEmail();

  if (getSmtpConfig(receiverEmail) || process.env.WEB3FORMS_ACCESS_KEY?.trim()) {
    return { mode: "server" };
  }

  if (receiverEmail) {
    return { mode: "client", receiverEmail };
  }

  return null;
}

export async function isEmailConfigured(): Promise<boolean> {
  return (await getEmailDelivery()) !== null;
}

export async function sendContactEmail(payload: ContactEmailPayload): Promise<void> {
  const receiverEmail = await getEffectiveContactEmail();
  const smtpConfig = getSmtpConfig(receiverEmail);

  if (smtpConfig) {
    await sendViaSmtp(payload, smtpConfig);
    return;
  }

  if (process.env.WEB3FORMS_ACCESS_KEY?.trim()) {
    await sendViaWeb3Forms(payload, receiverEmail || getEnvReceiverEmail());
    return;
  }

  throw new Error(
    "Server email delivery is not configured. Use client-side FormSubmit delivery instead."
  );
}

async function sendViaSmtp(payload: ContactEmailPayload, config: SmtpConfig): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: config.to,
    replyTo: payload.email,
    subject: `[Portfolio Contact] ${payload.subject}`,
    text: formatPlainText(payload),
    html: formatHtml(payload),
  });
}

async function sendViaWeb3Forms(
  payload: ContactEmailPayload,
  receiverEmail: string | null
): Promise<void> {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      access_key: process.env.WEB3FORMS_ACCESS_KEY,
      name: payload.name,
      email: payload.email,
      subject: `[Portfolio Contact] ${payload.subject}`,
      message: payload.message,
      replyto: payload.email,
      to: receiverEmail || undefined,
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Web3Forms delivery failed.");
  }
}

function formatPlainText(payload: ContactEmailPayload): string {
  return [
    "New message from your portfolio contact form",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");
}

function formatHtml(payload: ContactEmailPayload): string {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
      <h2 style="color: #dc2626;">New portfolio contact message</h2>
      <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
      <p><strong>Subject:</strong> ${escapeHtml(payload.subject)}</p>
      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;" />
      <p style="white-space: pre-wrap;">${escapeHtml(payload.message)}</p>
    </div>
  `;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getEmailProviderStatus() {
  return {
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    web3formsConfigured: Boolean(process.env.WEB3FORMS_ACCESS_KEY?.trim()),
    envReceiverEmail: getEnvReceiverEmail(),
  };
}
