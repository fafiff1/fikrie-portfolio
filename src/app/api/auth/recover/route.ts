import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/contact-messages";
import {
  buildRecoveryEmailBody,
  buildRecoveryEmailSubject,
  isRecoveryType,
} from "@/lib/auth-recovery";

function getRecoveryEmail(): string | null {
  return process.env.CONTACT_RECEIVER_EMAIL?.trim() || null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, website } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    const recoveryEmail = getRecoveryEmail();
    if (!recoveryEmail) {
      return NextResponse.json(
        { error: "Login recovery is not configured on this site." },
        { status: 503 }
      );
    }

    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (typeof type !== "string" || !isRecoveryType(type)) {
      return NextResponse.json({ error: "Please choose what to recover." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRecovery = recoveryEmail.toLowerCase();

    if (normalizedEmail !== normalizedRecovery) {
      return NextResponse.json({
        success: true,
        message:
          "If that email is registered for recovery, you will receive your login details shortly.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Recovery email sent. Check your inbox.",
      clientEmailDelivery: {
        receiverEmail: recoveryEmail,
        subject: buildRecoveryEmailSubject(type),
        body: buildRecoveryEmailBody(type),
      },
    });
  } catch (error) {
    console.error("Login recovery error:", error);
    return NextResponse.json(
      { error: "Could not send recovery email. Please try again later." },
      { status: 500 }
    );
  }
}
