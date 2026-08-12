import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-session";
import {
  getPrimaryUser,
  updatePrimaryUserAccount,
  updatePrimaryUserPassword,
} from "@/lib/users";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await getPrimaryUser();
  if (!user) {
    return NextResponse.json({ error: "No user account found." }, { status: 404 });
  }

  return NextResponse.json({
    account: {
      username: user.username,
      recoveryEmail: user.recoveryEmail ?? "",
      createdAt: user.createdAt,
    },
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    if (body.currentPassword || body.newPassword) {
      if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
        return NextResponse.json({ error: "Invalid password update request." }, { status: 400 });
      }

      await updatePrimaryUserPassword(body.currentPassword, body.newPassword);
    }

    const account = await updatePrimaryUserAccount({
      username: typeof body.username === "string" ? body.username : undefined,
      recoveryEmail: typeof body.recoveryEmail === "string" ? body.recoveryEmail : undefined,
    });

    return NextResponse.json({
      account: {
        username: account.username,
        recoveryEmail: account.recoveryEmail ?? "",
        createdAt: account.createdAt,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Account update failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
