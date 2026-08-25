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

function normalizeLifestyleData(
  data: Partial<Record<LifestyleCategory, LifestyleSection>>
): Record<LifestyleCategory, LifestyleSection> {
  return {
    hobbies: {
      blogs: data.hobbies?.blogs ?? [],
      media: data.hobbies?.media ?? [],
    },
    sports: {
      blogs: data.sports?.blogs ?? [],
      media: data.sports?.media ?? [],
    },
    travel: {
      blogs: data.travel?.blogs ?? [],
      media: data.travel?.media ?? [],
    },
  };
}

let writeQueue: Promise<void> = Promise.resolve();

async function readLifestyleDataFromDisk(): Promise<Record<LifestyleCategory, LifestyleSection>> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      if (!raw.trim()) {
        throw new Error("Lifestyle data file is empty.");
      }

      return normalizeLifestyleData(
        JSON.parse(raw) as Partial<Record<LifestyleCategory, LifestyleSection>>,
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

export async function readLifestyleData(): Promise<Record<LifestyleCategory, LifestyleSection>> {
  await writeQueue;
  return readLifestyleDataFromDisk();
}

export async function writeLifestyleData(
  data: Record<LifestyleCategory, LifestyleSection>
): Promise<void> {
  const nextWrite = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const payload = JSON.stringify(normalizeLifestyleData(data), null, 2);
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
