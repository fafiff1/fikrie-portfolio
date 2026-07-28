import type { ContactEmailPayload } from "@/lib/email";

type FormSubmitPayload = ContactEmailPayload | {
  subject: string;
  message: string;
};

export async function sendFormSubmitEmail(
  receiverEmail: string,
  payload: FormSubmitPayload
): Promise<void> {
  const subject =
    "subject" in payload && payload.subject.startsWith("[Portfolio Contact]")
      ? payload.subject
      : `[Portfolio Contact] ${"subject" in payload ? payload.subject : "Message"}`;

  const response = await fetch(
    `https://formsubmit.co/ajax/${encodeURIComponent(receiverEmail)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: "name" in payload ? payload.name : "Portfolio",
        email: "email" in payload ? payload.email : receiverEmail,
        subject,
        message: payload.message,
        _replyto: "email" in payload ? payload.email : receiverEmail,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    }
  );

  let data: { success?: string | boolean; message?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error("Email delivery failed. Please try again later.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Email delivery failed. Please try again later.");
  }

  if (data.success !== "true" && data.success !== true) {
    throw new Error(
      data.message ||
        "Email delivery failed. If this is your first message, check your inbox for a FormSubmit activation email and click the link."
    );
  }
}

export async function sendContactEmailFromBrowser(
  payload: ContactEmailPayload,
  receiverEmail: string
): Promise<void> {
  await sendFormSubmitEmail(receiverEmail, payload);
}

export async function sendRecoveryEmailFromBrowser(
  receiverEmail: string,
  subject: string,
  body: string
): Promise<void> {
  await sendFormSubmitEmail(receiverEmail, { subject, message: body });
}
