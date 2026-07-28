import { promises as fs } from "fs";
import path from "path";
import {
  type BlogPost,
  type LifestyleCategory,
  type LifestyleSection,
  type MediaItem,
} from "@/lib/lifestyle-shared";

export type { BlogPost, LifestyleCategory, LifestyleSection, MediaItem } from "@/lib/lifestyle-shared";
export {
  LIFESTYLE_CATEGORIES,
  LIFESTYLE_META,
  isLifestyleCategory,
} from "@/lib/lifestyle-shared";

const DATA_FILE = path.join(process.cwd(), "data", "lifestyle.json");

const DEFAULT_DATA: Record<LifestyleCategory, LifestyleSection> = {
  hobbies: { blogs: [], media: [] },
  sports: { blogs: [], media: [] },
  travel: { blogs: [], media: [] },
};

export async function readLifestyleData(): Promise<Record<LifestyleCategory, LifestyleSection>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<LifestyleCategory, LifestyleSection>;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeLifestyleData(
  data: Record<LifestyleCategory, LifestyleSection>
): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function readLifestyleSection(category: LifestyleCategory): Promise<LifestyleSection> {
  const data = await readLifestyleData();
  return data[category] ?? { blogs: [], media: [] };
}

export function getLifestyleMediaDir(category: LifestyleCategory): string {
  return path.join(process.cwd(), "public", "lifestyle", category);
}

export function isLocalLifestyleSrc(src: string): boolean {
  return src.startsWith("/lifestyle/");
}

export function localLifestyleSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
