import { expect, type Page } from "@playwright/test";
import { ROUTES, TEST_USER } from "../helpers/test-data";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(from = "/") {
    await this.page.goto(`${ROUTES.login}?from=${encodeURIComponent(from)}`);
  }

  async signIn(username = TEST_USER.username, password = TEST_USER.password) {
    await this.page.getByLabel("Username").fill(username);
    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }

  async openCreateAccount() {
    await this.page.getByRole("button", { name: "Create one" }).click();
  }

  async expectSignInForm() {
    await expect(this.page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Sign In" })).toBeVisible();
  }

  async expectCreateAccountForm() {
    await expect(this.page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    await expect(this.page.getByRole("button", { name: "Create Account" })).toBeVisible();
  }
}

export class Navbar {
  constructor(private readonly page: Page) {}

  async expectLoggedIn() {
    await expect(this.page.getByRole("button", { name: "Logout" })).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.page.getByRole("link", { name: "Login" })).toBeVisible();
  }

  async goTo(linkName: string) {
    await this.page.getByRole("link", { name: linkName, exact: true }).click();
  }
}

export async function loginAsTestUser(page: Page, from = "/") {
  const loginPage = new LoginPage(page);
  await loginPage.goto(from);
  await loginPage.signIn();
  await expect(page).not.toHaveURL(/\/login/);
}
