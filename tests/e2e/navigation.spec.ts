import { test, expect } from "../fixtures/auth.fixture";
import { Navbar } from "../pages";
import { ROUTES } from "../helpers/test-data";

test.describe("Authenticated navigation", () => {
  test("shows navbar links after login", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await page.goto(ROUTES.home);

    const navbar = new Navbar(page);
    await navbar.expectLoggedIn();
    await expect(page.getByRole("link", { name: "About", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Family", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Contact", exact: true })).toBeVisible();
  });

  test("navigates to family page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await page.goto(ROUTES.home);
    const navbar = new Navbar(page);

    await navbar.goTo("Family");
    await expect(page).toHaveURL(ROUTES.family);
    await expect(page.getByRole("heading", { name: /Meet My/i })).toBeVisible();
  });
});
