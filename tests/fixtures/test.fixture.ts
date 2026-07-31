import { test as base } from "@playwright/test";

/**
 * Runs automatically after every test to reset browser state.
 * Clears auth cookies/storage and navigates away from the app under test.
 */
export const test = base.extend({
  _teardown: [
    async ({ page, context }, use) => {
      await use();

      // Reset browser state after each test (workers reuse browser processes).
      await context.clearCookies();

      if (!page.isClosed() && page.url() !== "about:blank") {
        await page
          .evaluate(() => {
            localStorage.clear();
            sessionStorage.clear();
          })
          .catch(() => {});
      }

      for (const openPage of context.pages()) {
        if (!openPage.isClosed() && openPage !== page) {
          await openPage.close().catch(() => {});
        }
      }
    },
    { auto: true },
  ],
});

export { expect } from "@playwright/test";
