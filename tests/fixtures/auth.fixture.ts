import { test as base } from "./test.fixture";
import { setAuthenticatedSession } from "../helpers/auth";

type Fixtures = {
  authenticatedPage: void;
};

export const test = base.extend<Fixtures>({
  authenticatedPage: async ({ context }, use) => {
    await setAuthenticatedSession(context);
    await use();
  },
});

export { expect } from "@playwright/test";
