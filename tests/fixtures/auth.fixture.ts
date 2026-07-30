import { test as base, expect } from "@playwright/test";
import { loginAsTestUser } from "../pages";

type Fixtures = {
  authenticatedPage: void;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginAsTestUser(page);
    await use();
  },
});

export { expect };
