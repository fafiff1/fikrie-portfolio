import { test, expect } from "../fixtures/auth.fixture";
import { FamilyPage } from "../pages";
import { uniqueMikhailBlog, uniqueRafaelBlog, uniqueMiraBlog } from "../helpers/test-data";

test.describe("Family blogs", () => {
  test.describe.configure({ mode: "serial" });

  test("publishes a blog for Rafael only", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueRafaelBlog();
    const familyPage = new FamilyPage(page);

    await familyPage.goto();
    const blogId = await familyPage.publishRafaelBlog(blog.title, blog.content);

    const rafael = familyPage.rafaelSection();
    await expect(rafael.getByRole("article").getByText(blog.content)).toBeVisible();
    await expect(page.locator("#mikhail").getByRole("heading", { name: blog.title })).not.toBeVisible();
    await expect(page.locator("#mira").getByRole("heading", { name: blog.title })).not.toBeVisible();

    await familyPage.deleteRafaelBlogById(blogId);
    await expect(rafael.getByRole("article").getByRole("heading", { name: blog.title })).not.toBeVisible();
  });

  test("publishes a blog for Mikhail only", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueMikhailBlog();
    const familyPage = new FamilyPage(page);

    await familyPage.goto();
    const blogId = await familyPage.publishMikhailBlog(blog.title, blog.content);

    const mikhail = familyPage.mikhailSection();
    await expect(mikhail.getByRole("article").getByText(blog.content)).toBeVisible();
    await expect(page.locator("#rafael").getByRole("heading", { name: blog.title })).not.toBeVisible();
    await expect(page.locator("#mira").getByRole("heading", { name: blog.title })).not.toBeVisible();

    await familyPage.deleteMikhailBlogById(blogId);
    await expect(mikhail.getByRole("article").getByRole("heading", { name: blog.title })).not.toBeVisible();
  });

  test("publishes a blog for Mira only", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueMiraBlog();
    const familyPage = new FamilyPage(page);

    await familyPage.goto();
    const blogId = await familyPage.publishMiraBlog(blog.title, blog.content);

    const mira = familyPage.miraSection();
    await expect(mira.getByRole("article").getByText(blog.content)).toBeVisible();
    await expect(page.locator("#rafael").getByRole("heading", { name: blog.title })).not.toBeVisible();
    await expect(page.locator("#mikhail").getByRole("heading", { name: blog.title })).not.toBeVisible();

    await familyPage.deleteMiraBlogById(blogId);
    await expect(mira.getByRole("article").getByRole("heading", { name: blog.title })).not.toBeVisible();
  });
});
