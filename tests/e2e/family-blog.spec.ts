import { test, expect } from "../fixtures/auth.fixture";
import { FamilyPage } from "../pages";
import { uniqueRafaelBlog } from "../helpers/test-data";

test.describe("Family blogs", () => {
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
});
