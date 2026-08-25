import { promises as fs } from "fs";
import path from "path";
import type { BlogPost } from "@/lib/lifestyle-shared";
import {
  type FamilyMemberId,
  isFamilyMemberId,
} from "@/lib/family-media-shared";

export type { BlogPost, FamilyMemberId } from "@/lib/family-shared";
export { isFamilyMemberId } from "@/lib/family-media-shared";

const DATA_FILE = path.join(process.cwd(), "data", "family-blogs.json");

const DEFAULT_DATA: Record<FamilyMemberId, BlogPost[]> = {
  rafael: [],
  mikhail: [],
  mira: [],
};

function normalizeFamilyBlogs(
  data: Partial<Record<FamilyMemberId, BlogPost[]>>
): Record<FamilyMemberId, BlogPost[]> {
  return {
    rafael: data.rafael ?? [],
    mikhail: data.mikhail ?? [],
    mira: data.mira ?? [],
  };
}

let writeQueue: Promise<void> = Promise.resolve();

async function readFamilyBlogsFromDisk(): Promise<Record<FamilyMemberId, BlogPost[]>> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      if (!raw.trim()) {
        throw new Error("Family blogs file is empty.");
      }

      return normalizeFamilyBlogs(
        JSON.parse(raw) as Partial<Record<FamilyMemberId, BlogPost[]>>,
      );
    } catch {
      if (attempt === 2) {
        return { ...DEFAULT_DATA };
      }

      await new Promise((resolve) => setTimeout(resolve, 15 * (attempt + 1)));
    }
  }

  return { ...DEFAULT_DATA };
}

export async function readFamilyBlogs(): Promise<Record<FamilyMemberId, BlogPost[]>> {
  await writeQueue;
  return readFamilyBlogsFromDisk();
}

export async function writeFamilyBlogs(
  data: Record<FamilyMemberId, BlogPost[]>
): Promise<void> {
  const nextWrite = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const payload = JSON.stringify(normalizeFamilyBlogs(data), null, 2);
    const tempFile = `${DATA_FILE}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempFile, payload, "utf-8");

    try {
      await fs.rename(tempFile, DATA_FILE);
    } catch {
      await fs.unlink(DATA_FILE).catch(() => undefined);
      await fs.rename(tempFile, DATA_FILE);
    }
  });

  writeQueue = nextWrite.catch(() => undefined);
  await nextWrite;
}

export async function readMemberBlogs(memberId: FamilyMemberId): Promise<BlogPost[]> {
  const data = await readFamilyBlogs();
  return data[memberId] ?? [];
}

export function getMemberBlogCoverDir(memberId: FamilyMemberId): string {
  return path.join(process.cwd(), "public", "family", memberId);
}

export function isLocalFamilyBlogCover(src: string): boolean {
  return src.startsWith("/family/");
}

export function localFamilyBlogCoverToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
