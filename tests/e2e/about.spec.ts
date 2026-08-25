import path from "node:path";
import { test, expect } from "../fixtures/auth.fixture";
import { FamilyPage, HobbiesPage, SportsPage } from "../pages";
import {
  uniqueHobbiesBlog,
  uniqueMikhailBlog,
  uniqueMiraBlog,
  uniqueRafaelBlog,
  uniqueSportsBlog,
} from "../helpers/test-data";

const dummyPhotoPath = path.resolve("tests/fixtures/dummy-photo.png");

test.describe.configure({ mode: "serial", timeout: 120_000 });

test.describe("About / Hobbies", () => {
  test("publishes, edits, and deletes a blog", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueHobbiesBlog();
    const hobbiesPage = new HobbiesPage(page);

    await hobbiesPage.goto();

    await hobbiesPage.publishBlog(blog.title, blog.content);
    await expect(page.getByRole("article").getByText(blog.content)).toBeVisible();

    await hobbiesPage.editBlog(blog.title, blog.updatedTitle, blog.updatedContent);
    await expect(page.getByRole("article").getByText(blog.updatedContent)).toBeVisible();
    await expect(page.getByRole("article").getByText(blog.content)).not.toBeVisible();

    await hobbiesPage.deleteBlog(blog.updatedTitle);
  });

  test("uploads a dummy photo", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const hobbiesPage = new HobbiesPage(page);

    await hobbiesPage.goto();
    const mediaId = await hobbiesPage.uploadPhoto(dummyPhotoPath);

    await expect(page.getByText("dummy-photo").first()).toBeVisible();

    await hobbiesPage.deleteMediaById(mediaId);
  });
});

test.describe("About / Sports", () => {
  test("publishes, edits, and deletes a blog", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueSportsBlog();
    const sportsPage = new SportsPage(page);

    await sportsPage.goto();

    await sportsPage.publishBlog(blog.title, blog.content);
    await expect(page.getByRole("article").getByText(blog.content)).toBeVisible();

    await sportsPage.editBlog(blog.title, blog.updatedTitle, blog.updatedContent);
    await expect(page.getByRole("article").getByText(blog.updatedContent)).toBeVisible();
    await expect(page.getByRole("article").getByText(blog.content)).not.toBeVisible();

    await sportsPage.deleteBlog(blog.updatedTitle);
  });

  test("uploads a dummy photo", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const sportsPage = new SportsPage(page);

    await sportsPage.goto();
    const mediaId = await sportsPage.uploadPhoto(dummyPhotoPath);

    await expect(page.getByText("dummy-photo").first()).toBeVisible();

    await sportsPage.deleteMediaById(mediaId);
  });
});

test.describe("About / Family", () => {
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

  test("deletes a published blog for Rafael only", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueRafaelBlog();
    const familyPage = new FamilyPage(page);

    await familyPage.goto();
    await familyPage.publishRafaelBlog(blog.title, blog.content);

    const rafael = familyPage.rafaelSection();
    await expect(rafael.getByRole("article").getByRole("heading", { name: blog.title })).toBeVisible();

    await familyPage.deleteRafaelBlog(blog.title);

    await expect(rafael.getByRole("article").getByRole("heading", { name: blog.title })).not.toBeVisible();
    await expect(page.locator("#mikhail").getByRole("heading", { name: blog.title })).not.toBeVisible();
    await expect(page.locator("#mira").getByRole("heading", { name: blog.title })).not.toBeVisible();
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
