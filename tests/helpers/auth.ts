import type { APIRequestContext, BrowserContext, Playwright } from "@playwright/test";
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

export async function createAuthenticatedRequest(
  playwright: Playwright,
  baseURL: string | undefined,
): Promise<APIRequestContext> {
  return playwright.request.newContext({
    baseURL,
    extraHTTPHeaders: {
      Cookie: `${SESSION_COOKIE}=${SESSION_VALUE}`,
    },
  });
}
