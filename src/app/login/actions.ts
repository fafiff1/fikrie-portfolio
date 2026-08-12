"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth-shared";
import { verifyUserCredentials, createUser } from "@/lib/users";
import { readSiteConfig } from "@/lib/site-config";

export type LoginState = {
  error?: string;
};

export type RegisterState = {
  error?: string;
  success?: string;
};

async function setSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

function getRedirectPath(from: FormDataEntryValue | null): string {
  return typeof from === "string" &&
    from.startsWith("/") &&
    !from.startsWith("//") &&
    from !== "/login"
    ? from
    : "/";
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  const valid = await verifyUserCredentials(username, password);
  if (!valid) {
    return { error: "Invalid username or password." };
  }

  await setSessionCookie();
  redirect(getRedirectPath(formData.get("from")));
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const siteConfig = await readSiteConfig();
  if (!siteConfig.allowRegistration) {
    return { error: "New account registration is currently disabled." };
  }

  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password || !confirmPassword) {
    return { error: "Please fill in all fields." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  try {
    await createUser(username, password);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Could not create account.",
    };
  }

  await setSessionCookie();
  redirect(getRedirectPath(formData.get("from")));
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
