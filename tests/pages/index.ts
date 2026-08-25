import { expect, type Page, type Locator } from "@playwright/test";
import { FAMILY_MEMBERS, LIFESTYLE, ROUTES, TEST_USER } from "../helpers/test-data";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(from = "/") {
    await this.page.goto(`${ROUTES.login}?from=${encodeURIComponent(from)}`, {
      waitUntil: "domcontentloaded",
    });
    await expect(this.page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  }

  async signIn(username = TEST_USER.username, password = TEST_USER.password) {
    await expect(this.page.getByLabel("Username")).toBeVisible();
    await this.page.getByLabel("Username").fill(username);
    await this.page.getByLabel("Password", { exact: true }).fill(password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }

  async openCreateAccount() {
    const createButton = this.page.getByRole("button", { name: "Create one" });
    await expect(createButton).toBeVisible();

    await expect(async () => {
      await createButton.click();
      await expect(this.page.getByRole("heading", { name: "Create Account" })).toBeVisible();
    }).toPass();
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
    await expect(this.page.getByRole("banner").getByRole("button", { name: "Logout" })).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.page.getByRole("banner").getByRole("link", { name: "Login" })).toBeVisible();
  }

  async goTo(linkName: string) {
    const link = this.page
      .getByRole("banner")
      .getByRole("link", { name: linkName, exact: true });

    await expect(link).toBeVisible();
    await link.click();
  }

  async goToAboutChild(childName: string) {
    const about = this.page.getByRole("banner").getByRole("link", { name: "About", exact: true });
    await expect(about).toBeVisible();
    await about.hover();
    const child = this.page.getByRole("banner").getByRole("link", { name: childName, exact: true });
    await expect(child).toBeVisible();
    await child.click();
  }
}

export async function goHome(page: Page) {
  await expect(async () => {
    await page.goto(ROUTES.home, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("dialog", { name: "Runtime Error" })).not.toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "Logout" })).toBeVisible();
  }).toPass({ timeout: 30_000 });
}

export async function loginAsTestUser(page: Page, from = "/") {
  const loginPage = new LoginPage(page);
  await loginPage.goto(from);
  await loginPage.signIn();
  await expect(page).not.toHaveURL(/\/login/);
}

export class FamilyPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await expect(async () => {
      await this.page.goto(ROUTES.family, { waitUntil: "domcontentloaded" });
      await expect(this.page.getByRole("dialog", { name: "Runtime Error" })).not.toBeVisible();
      await expect(this.page.getByRole("heading", { name: /Meet My/i })).toBeVisible();
    }).toPass({ timeout: 30_000 });
  }

  rafaelSection(): Locator {
    return this.page.locator(`#${FAMILY_MEMBERS.rafael.id}`);
  }

  mikhailSection(): Locator {
    return this.page.locator(`#${FAMILY_MEMBERS.mikhail.id}`);
  }

  miraSection(): Locator {    
    return this.page.locator(`#${FAMILY_MEMBERS.mira.id}`);
  }

  async publishBlog(
    section: Locator,
    title: string,
    content: string,
    blogsApiPath: string,
  ): Promise<string> {
    await section.scrollIntoViewIfNeeded();

    const writeBlog = section.getByRole("button", { name: "Write Blog" });
    await expect(writeBlog).toBeVisible();
    await expect(async () => {
      await writeBlog.click();
      await expect(section.getByRole("heading", { name: "New Blog" })).toBeVisible();
    }).toPass();

    await section.getByPlaceholder("My weekend hiking adventure").fill(title);
    await section.getByPlaceholder("Write your blog post here...").fill(content);

    const publishResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(blogsApiPath) &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await section.getByRole("button", { name: "Publish Blog" }).click();
    const response = await publishResponse;
    const { blog } = (await response.json()) as { blog: { id: string } };

    await expect(section.getByRole("heading", { name: "New Blog" })).not.toBeVisible();
    await expect(section.getByRole("article").getByRole("heading", { name: title })).toBeVisible();

    return blog.id;
  }

  async publishRafaelBlog(title: string, content: string): Promise<string> {
    return this.publishBlog(
      this.rafaelSection(),
      title,
      content,
      FAMILY_MEMBERS.rafael.blogsApiPath,
    );
  }

  async deleteRafaelBlogById(blogId: string) {
    const response = await this.page.request.delete(FAMILY_MEMBERS.rafael.blogsApiPath, {
      data: { blogId },
    });
    expect(response.ok()).toBeTruthy();
    await this.goto();
  }

  async publishMikhailBlog(title: string, content: string): Promise<string> {
    return this.publishBlog(
      this.mikhailSection(),
      title,
      content,
      FAMILY_MEMBERS.mikhail.blogsApiPath,
    );
  }

  async deleteMikhailBlogById(blogId: string) {
    const response = await this.page.request.delete(FAMILY_MEMBERS.mikhail.blogsApiPath, {
      data: { blogId },
    });
    expect(response.ok()).toBeTruthy();
    await this.goto();
  }

  async publishMiraBlog(title: string, content: string): Promise<string> {
    return this.publishBlog(
      this.miraSection(),
      title,
      content,
      FAMILY_MEMBERS.mira.blogsApiPath,
    );
  }

  async deleteMiraBlogById(blogId: string) {
    const response = await this.page.request.delete(FAMILY_MEMBERS.mira.blogsApiPath, {
      data: { blogId },
    });
    expect(response.ok()).toBeTruthy();
    await this.goto();
  }
}

type LifestylePageConfig = (typeof LIFESTYLE)[keyof typeof LIFESTYLE];

class LifestylePage {
  constructor(
    private readonly page: Page,
    private readonly config: LifestylePageConfig,
  ) {}

  async goto() {
    await expect(async () => {
      await this.page.goto(this.config.path, { waitUntil: "domcontentloaded" });
      await expect(this.page.getByRole("dialog", { name: "Runtime Error" })).not.toBeVisible();
      await expect(this.page.getByRole("heading", { name: this.config.title, exact: true })).toBeVisible();
      await expect(this.page.getByRole("button", { name: "Write Blog" })).toBeVisible();
    }).toPass({ timeout: 30_000 });
  }

  private sectionTab(name: "Blog" | "Photos & Videos") {
    return this.page
      .locator(".flex.justify-center.mb-10")
      .getByRole("button", { name, exact: true });
  }

  private blogArticle(title: string): Locator {
    return this.page.getByRole("article").filter({
      has: this.page.getByRole("heading", { name: title }),
    });
  }

  async publishBlog(title: string, content: string): Promise<string> {
    const writeBlog = this.page.getByRole("button", { name: "Write Blog" });
    await expect(writeBlog).toBeVisible();
    await expect(async () => {
      await writeBlog.click();
      await expect(this.page.getByRole("heading", { name: "New Blog" })).toBeVisible();
    }).toPass();

    await this.page.getByPlaceholder("My weekend hiking adventure").fill(title);
    await this.page.getByPlaceholder("Write your blog post here...").fill(content);

    const publishResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(this.config.blogsApiPath) &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await this.page.getByRole("button", { name: "Publish Blog" }).click();
    const response = await publishResponse;
    const { blog } = (await response.json()) as { blog: { id: string } };

    await expect(this.page.getByRole("heading", { name: "New Blog" })).not.toBeVisible();
    await expect(this.blogArticle(title)).toBeVisible();

    return blog.id;
  }

  async editBlog(currentTitle: string, newTitle: string, newContent: string) {
    await this.blogArticle(currentTitle).getByRole("button", { name: `Edit ${currentTitle}` }).click();
    await expect(this.page.getByRole("heading", { name: "Edit Blog" })).toBeVisible();

    await this.page.getByPlaceholder("My weekend hiking adventure").fill(newTitle);
    await this.page.getByPlaceholder("Write your blog post here...").fill(newContent);

    const patchResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(this.config.blogsApiPath) &&
        response.request().method() === "PATCH" &&
        response.ok(),
    );
    await this.page.getByRole("button", { name: "Save Changes" }).click();
    await patchResponse;

    await expect(this.page.getByRole("heading", { name: "Edit Blog" })).not.toBeVisible();
    await expect(this.blogArticle(newTitle)).toBeVisible();
  }

  async deleteBlog(title: string) {
    this.page.once("dialog", (dialog) => dialog.accept());

    const deleteResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(this.config.blogsApiPath) &&
        response.request().method() === "DELETE" &&
        response.ok(),
    );
    await this.blogArticle(title).getByRole("button", { name: `Delete ${title}` }).click();
    await deleteResponse;

    await expect(this.blogArticle(title)).not.toBeVisible();
  }

  async switchToMedia() {
    const mediaTab = this.sectionTab("Photos & Videos");
    await expect(mediaTab).toBeVisible();

    if (await this.page.getByRole("button", { name: "Upload" }).isVisible()) {
      return;
    }

    await expect(async () => {
      await mediaTab.scrollIntoViewIfNeeded();
      await mediaTab.click();
      await expect(this.page.getByRole("heading", { name: "Blog", level: 3 })).not.toBeVisible();
      await expect(this.page.getByRole("heading", { name: "Photos & Videos", level: 3 })).toBeVisible();
      await expect(this.page.getByRole("button", { name: "Upload" })).toBeVisible();
    }).toPass({ timeout: 20_000 });
  }

  async switchToBlog() {
    const blogTab = this.sectionTab("Blog");
    await expect(blogTab).toBeVisible();

    if (await this.page.getByRole("button", { name: "Write Blog" }).isVisible()) {
      return;
    }

    await expect(async () => {
      await blogTab.scrollIntoViewIfNeeded();
      await blogTab.click();
      await expect(this.page.getByRole("heading", { name: "Blog", level: 3 })).toBeVisible();
    }).toPass({ timeout: 20_000 });
  }

  async uploadPhoto(filePath: string): Promise<string> {
    await this.switchToMedia();

    const uploadResponse = this.page.waitForResponse(
      (response) =>
        response.url().includes(this.config.mediaApiPath) &&
        response.request().method() === "POST" &&
        response.ok(),
    );

    await this.page.locator('input[type="file"].hidden').setInputFiles(filePath);
    const response = await uploadResponse;
    const { item } = (await response.json()) as { item: { id: string; title: string } };

    await expect(this.page.getByText(item.title).first()).toBeVisible();
    return item.id;
  }

  async deleteMediaById(mediaId: string) {
    const response = await this.page.request.delete(this.config.mediaApiPath, {
      data: { mediaId },
    });
    expect(response.ok()).toBeTruthy();
  }
}

export class HobbiesPage extends LifestylePage {
  constructor(page: Page) {
    super(page, LIFESTYLE.hobbies);
  }
}

export class SportsPage extends LifestylePage {
  constructor(page: Page) {
    super(page, LIFESTYLE.sports);
  }
}

export class TravelPage extends LifestylePage {
  constructor(page: Page) {
    super(page, LIFESTYLE.travel);
  }
}
