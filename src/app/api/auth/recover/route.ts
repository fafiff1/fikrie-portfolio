import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/contact-messages";
import {
  buildRecoveryEmailBody,
  buildRecoveryEmailSubject,
  isRecoveryType,
} from "@/lib/auth-recovery";
import { findUserByRecoveryEmail } from "@/lib/users";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, type, website } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    const recoveryEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim();
    if (!recoveryEmail) {
      return NextResponse.json(
        { error: "Login recovery isn't set up yet. Please contact the site owner." },
        { status: 503 }
      );
    }

    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (typeof type !== "string" || !isRecoveryType(type)) {
      return NextResponse.json(
        { error: "Please choose whether you need your username, password, or both." },
        { status: 400 }
      );
    }

    const user = await findUserByRecoveryEmail(email.trim());

    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If that email is registered, your login details are on the way. Check your inbox in a minute or two.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Done! Your login details have been sent. Check your inbox.",
      clientEmailDelivery: {
        receiverEmail: email.trim(),
        subject: buildRecoveryEmailSubject(type),
        body: buildRecoveryEmailBody(user, type),
      },
    });
  } catch (error) {
    console.error("Login recovery error:", error);
    return NextResponse.json(
      { error: "We couldn't send the email right now. Please try again in a moment." },
      { status: 500 }
    );
  }
}
