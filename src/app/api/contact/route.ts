import { NextResponse } from "next/server";
import { isValidEmail, saveContactMessage } from "@/lib/contact-messages";
import { getEmailDelivery, isEmailConfigured, sendContactEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, subject, message, website } = body;

    if (website) {
      return NextResponse.json({ success: true });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
    }

    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (typeof subject !== "string" || subject.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a subject." }, { status: 400 });
    }

    if (typeof message !== "string" || message.trim().length < 10) {
      return NextResponse.json(
        { error: "Please enter a message of at least 10 characters." },
        { status: 400 }
      );
    }

    if (!(await isEmailConfigured())) {
      return NextResponse.json(
        {
          error:
            "Email delivery is not configured. Add CONTACT_RECEIVER_EMAIL to .env.local on the server.",
        },
        { status: 503 }
      );
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    await saveContactMessage(payload);

    const delivery = await getEmailDelivery();
    if (!delivery) {
      return NextResponse.json(
        { error: "Email delivery is not configured." },
        { status: 503 }
      );
    }

    if (delivery.mode === "server") {
      await sendContactEmail(payload);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({
      success: true,
      clientEmailDelivery: { receiverEmail: delivery.receiverEmail },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Your message could not be delivered by email. Please try again later.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
