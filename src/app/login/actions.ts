"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isValidCredentials, SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  if (!isValidCredentials(username, password)) {
    return { error: "Invalid username or password." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  const from = formData.get("from");
  const redirectTo =
    typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && from !== "/login"
      ? from
      : "/";

  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
