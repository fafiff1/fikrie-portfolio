import path from "node:path";
import { readFile } from "node:fs/promises";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { createAuthenticatedRequest } from "../helpers/auth";
import { FAMILY_MEDIA_API_PATH, FAMILY_MEMBERS, uniqueRafaelMedia } from "../helpers/test-data";

const rafaelId = FAMILY_MEMBERS.rafael.id;
const dummyPhotoPath = path.resolve("tests/fixtures/dummy-photo.png");

type FamilyMediaItem = {
  id: string;
  type: "photo" | "video";
  title: string;
  src: string;
};

type FamilyMediaList = {
  rafael: FamilyMediaItem[];
  mikhail: FamilyMediaItem[];
  mira: FamilyMediaItem[];
};

async function uploadRafaelPhoto(
  request: APIRequestContext,
  title: string,
): Promise<FamilyMediaItem> {
  const buffer = await readFile(dummyPhotoPath);
  const response = await request.post(FAMILY_MEDIA_API_PATH, {
    multipart: {
      memberId: rafaelId,
      title,
      file: {
        name: "dummy-photo.png",
        mimeType: "image/png",
        buffer,
      },
    },
  });

  expect(response.ok(), `Upload failed: ${response.status()}`).toBeTruthy();

  const body = (await response.json()) as { item: FamilyMediaItem };
  return body.item;
}

async function deleteRafaelMedia(request: APIRequestContext, mediaId: string): Promise<void> {
  await expect(async () => {
    const response = await request.delete(FAMILY_MEDIA_API_PATH, {
      data: { memberId: rafaelId, mediaId },
    });

    expect(response.ok(), `Cleanup delete failed: ${response.status()}`).toBeTruthy();
  }).toPass({ timeout: 15_000 });
}

test.describe("Family media API / Rafael", () => {
  test.describe.configure({ mode: "serial" });

  test("uploads a photo and returns it in the GET list", async ({ playwright, baseURL }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const media = uniqueRafaelMedia();
    let mediaId: string | undefined;

    try {
      const created = await test.step("POST /api/family/media", async () => {
        return uploadRafaelPhoto(request, media.title);
      });
      mediaId = created.id;

      expect(created.title).toBe(media.title);
      expect(created.type).toBe("photo");
      expect(created.src).toContain("/family/rafael/");

      await test.step("GET /api/family/media", async () => {
        const listResponse = await request.get(FAMILY_MEDIA_API_PATH);
        expect(listResponse.ok()).toBeTruthy();

        const list = (await listResponse.json()) as FamilyMediaList;
        expect(
          list.rafael.some((entry) => entry.id === created.id && entry.title === media.title),
        ).toBeTruthy();
      });
    } finally {
      if (mediaId) {
        await deleteRafaelMedia(request, mediaId);
      }
      await request.dispose();
    }
  });

  test("deletes an uploaded photo and removes it from the GET list", async ({
    playwright,
    baseURL,
  }) => {
    const request = await createAuthenticatedRequest(playwright, baseURL);
    const media = uniqueRafaelMedia();

    const created = await test.step("POST /api/family/media", async () => {
      return uploadRafaelPhoto(request, media.title);
    });

    await test.step("DELETE /api/family/media", async () => {
      await expect(async () => {
        const deleteResponse = await request.delete(FAMILY_MEDIA_API_PATH, {
          data: { memberId: rafaelId, mediaId: created.id },
        });
        expect(deleteResponse.ok()).toBeTruthy();
      }).toPass({ timeout: 15_000 });
    });

    await test.step("GET /api/family/media", async () => {
      const listResponse = await request.get(FAMILY_MEDIA_API_PATH);
      expect(listResponse.ok()).toBeTruthy();

      const list = (await listResponse.json()) as FamilyMediaList;
      expect(list.rafael.some((entry) => entry.id === created.id)).toBeFalsy();
    });

    await request.dispose();
  });
});
