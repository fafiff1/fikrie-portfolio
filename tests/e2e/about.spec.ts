import path from "node:path";
import { test, expect } from "../fixtures/auth.fixture";
import { HobbiesPage, SportsPage, TravelPage } from "../pages";
import { uniqueHobbiesBlog } from "../helpers/test-data";

const dummyPhotoPath = path.resolve("tests/fixtures/dummy-photo.png");

test.describe("About / Hobbies", () => {
  test.describe.configure({ mode: "serial", timeout: 120_000 });

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
  test.describe.configure({ mode: "serial", timeout: 120_000 });

  test("publishes, edits, and deletes a blog", async ({ page, authenticatedPage }) => {
    void authenticatedPage;

    const blog = uniqueHobbiesBlog();
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
