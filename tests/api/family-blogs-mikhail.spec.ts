import { expect, test, type APIRequestContext } from "@playwright/test";
import { createAuthenticatedRequest } from "../helpers/auth";
import { FAMILY_MEMBERS, uniqueMikhailBlog } from "../helpers/test-data";

const mikhailBlogsPath = FAMILY_MEMBERS.mikhail.blogsApiPath;

type FamilyBlog = {
  id: string;
  title: string;
  content: string;
};

async function createMikhailBlog(
  request: APIRequestContext,
  title: string,
  content: string,
): Promise<FamilyBlog> {
  const response = await request.post(mikhailBlogsPath, {
    multipart: { title, content },
  });

  expect(response.ok(), `Create failed: ${response.status()}`).toBeTruthy();

  const body = (await response.json()) as { blog: FamilyBlog };
  return body.blog;
}

async function deleteMikhailBlog(request: APIRequestContext, blogId: string): Promise<void> {
  await expect(async () => {
    const response = await request.delete(`${mikhailBlogsPath}?blogId=${encodeURIComponent(blogId)}`);

    expect(response.ok(), `Cleanup delete failed: ${response.status()}`).toBeTruthy();
  }).toPass({ timeout: 15_000 });
}

test.describe("Family blogs API / Rafael", () => {
  test.describe.configure({ mode: "serial" });

  test("creates a blog and returns it in the list", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const blog = uniqueMikhailBlog();
    let blogId: string | undefined;

    try {
      const created = await createMikhailBlog(request, blog.title, blog.content);
      blogId = created.id;

      expect(created.title).toBe(blog.title);
      expect(created.content).toBe(blog.content);

      const listResponse = await request.get(mikhailBlogsPath);
      expect(listResponse.ok()).toBeTruthy();

      const { blogs } = (await listResponse.json()) as { blogs: FamilyBlog[] };
      expect(blogs.some((entry) => entry.id === created.id && entry.title === blog.title)).toBeTruthy();
    } finally {
      if (blogId) {
        await deleteMikhailBlog(request, blogId);
      }
      await request.dispose();
    }
  });

  test("updates a blog title and content", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const blog = uniqueMikhailBlog();
    let blogId: string | undefined;

    try {
      const created = await createMikhailBlog(request, blog.title, blog.content);
      blogId = created.id;

      const updateResponse = await request.patch(mikhailBlogsPath, {
        multipart: {
          blogId: created.id,
          title: blog.updatedTitle,
          content: blog.updatedContent,
        },
      });

      expect(updateResponse.ok(), `Update failed: ${updateResponse.status()}`).toBeTruthy();

      const { blog: updated } = (await updateResponse.json()) as { blog: FamilyBlog };
      expect(updated.id).toBe(created.id);
      expect(updated.title).toBe(blog.updatedTitle);
      expect(updated.content).toBe(blog.updatedContent);
    } finally {
      if (blogId) {
        await deleteMikhailBlog(request, blogId);
      }
      await request.dispose();
    }
  });

  test("deletes a blog and treats a second delete as success", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const blog = uniqueMikhailBlog();

    const created = await createMikhailBlog(request, blog.title, blog.content);

    await expect(async () => {
      const firstDelete = await request.delete(`${mikhailBlogsPath}?blogId=${encodeURIComponent(created.id)}`);
      expect(firstDelete.ok()).toBeTruthy();
    }).toPass({ timeout: 15_000 });

    const listResponse = await request.get(mikhailBlogsPath);
    const { blogs } = (await listResponse.json()) as { blogs: FamilyBlog[] };
    expect(blogs.some((entry) => entry.id === created.id)).toBeFalsy();

    await expect(async () => {
      const secondDelete = await request.delete(`${mikhailBlogsPath}?blogId=${encodeURIComponent(created.id)}`);
      expect(secondDelete.ok()).toBeTruthy();
    }).toPass({ timeout: 15_000 });
    await request.dispose();
  });

  test("rejects unauthenticated create requests", async ({ request }) => {
    const blog = uniqueMikhailBlog();

    const response = await request.post(mikhailBlogsPath, {
      multipart: {
        title: blog.title,
        content: blog.content,
      },
    });

    expect(response.status()).toBe(401);
  });

  test("rejects a title that is too short", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const blog = uniqueMikhailBlog();

    const response = await request.post(mikhailBlogsPath, {
      multipart: {
        title: "A",
        content: blog.content,
      },
    });

    expect(response.status()).toBe(400);
    await request.dispose();
  });

  test("rejects content that is too short", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const blog = uniqueMikhailBlog();

    const response = await request.post(mikhailBlogsPath, {
      multipart: {
        title: blog.title,
        content: "too short",
      },
    });

    expect(response.status()).toBe(400);
    await request.dispose();
  });
});
