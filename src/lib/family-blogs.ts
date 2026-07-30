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

export async function readFamilyBlogs(): Promise<Record<FamilyMemberId, BlogPost[]>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<FamilyMemberId, BlogPost[]>;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeFamilyBlogs(
  data: Record<FamilyMemberId, BlogPost[]>
): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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
