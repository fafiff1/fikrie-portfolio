import { test, expect } from "../fixtures/test.fixture";
import { LoginPage } from "../pages";
import { ROUTES } from "../helpers/test-data";

test.describe("Login page", () => {
  test.describe.configure({ mode: "serial" });

  test("shows sign-in form for unauthenticated visitors", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.expectSignInForm();
    await expect(page.getByRole("button", { name: "Create one" })).toBeVisible();
  });

  test("redirects unauthenticated users from protected routes", async ({ page }) => {
    await page.goto(ROUTES.family, { waitUntil: "domcontentloaded" });

    await expect(page).toHaveURL(/\/login\?from=/);
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  });

  test("opens create account form", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.openCreateAccount();

    await loginPage.expectCreateAccountForm();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });
});
