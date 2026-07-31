import type { BrowserContext } from "@playwright/test";
import { SESSION_COOKIE, SESSION_VALUE } from "../../src/lib/auth-shared";

export async function setAuthenticatedSession(context: BrowserContext) {
  await context.addCookies([
    {
      name: SESSION_COOKIE,
      value: SESSION_VALUE,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
