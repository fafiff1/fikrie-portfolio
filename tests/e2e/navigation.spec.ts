import { test, expect } from "../fixtures/auth.fixture";
import { Navbar, goHome } from "../pages";
import { ROUTES } from "../helpers/test-data";

test.describe("Authenticated navigation", () => {
  test.describe.configure({ mode: "serial" });

  test("shows navbar links after login", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);

    const navbar = new Navbar(page);
    await navbar.expectLoggedIn();
    await expect(page.getByRole("banner").getByRole("link", { name: "About", exact: true })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Family", exact: true })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("link", { name: "Contact", exact: true })).toBeVisible();
  });

  test("navigates to family page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);
    const navbar = new Navbar(page);

    await navbar.goTo("Family");
    await expect(page).toHaveURL(ROUTES.family);
    await expect(page.getByRole("heading", { name: /Meet My/i })).toBeVisible();
  });

  test("navigates to contact page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);
    const navbar = new Navbar(page);

    await navbar.goTo("Contact");
    await expect(page).toHaveURL(ROUTES.contact);
    await expect(page.getByRole("heading", { name: /Connect/i })).toBeVisible();
  });

  test("navigates to about page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);
    const navbar = new Navbar(page);

    await navbar.goTo("About");
    await expect(page).toHaveURL(ROUTES.about);
    await expect(page.getByRole("heading", { name: /About /i })).toBeVisible();
  });

  test("navigates to reviews page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);
    const navbar = new Navbar(page);

    await navbar.goTo("Reviews");
    await expect(page).toHaveURL(ROUTES.reviews);
    await expect(page.getByRole("heading", { name: /Client /i })).toBeVisible();
  });

  test("navigates to portfolio page", async ({ page, authenticatedPage }) => {
    void authenticatedPage;
    await goHome(page);
    const navbar = new Navbar(page);

    await navbar.goTo("Portfolio");
    await expect(page).toHaveURL(ROUTES.portfolio);
    await expect(page.getByRole("heading", { name: /Professional /i })).toBeVisible();
  });
});
