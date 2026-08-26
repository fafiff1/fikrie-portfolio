import { promises as fs } from "fs";
import path from "path";

export type MediaItem = {
  id: string;
  type: "photo" | "video";
  title: string;
  src: string;
  poster?: string;
};

export type FamilyMemberId = "rafael" | "mikhail" | "mira";

export const FAMILY_MEMBER_IDS: FamilyMemberId[] = ["rafael", "mikhail", "mira"];

const DATA_FILE = path.join(process.cwd(), "data", "family-media.json");

const DEFAULT_DATA: Record<FamilyMemberId, MediaItem[]> = {
  rafael: [],
  mikhail: [],
  mira: [],
};

export function isFamilyMemberId(value: string): value is FamilyMemberId {
  return FAMILY_MEMBER_IDS.includes(value as FamilyMemberId);
}

function normalizeFamilyMedia(
  data: Partial<Record<FamilyMemberId, MediaItem[]>>
): Record<FamilyMemberId, MediaItem[]> {
  return {
    rafael: data.rafael ?? [],
    mikhail: data.mikhail ?? [],
    mira: data.mira ?? [],
  };
}

let writeQueue: Promise<void> = Promise.resolve();

async function readFamilyMediaFromDisk(): Promise<Record<FamilyMemberId, MediaItem[]>> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      if (!raw.trim()) {
        throw new Error("Family media file is empty.");
      }

      return normalizeFamilyMedia(
        JSON.parse(raw) as Partial<Record<FamilyMemberId, MediaItem[]>>,
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

export async function readFamilyMedia(): Promise<Record<FamilyMemberId, MediaItem[]>> {
  await writeQueue;
  return readFamilyMediaFromDisk();
}

export async function writeFamilyMedia(data: Record<FamilyMemberId, MediaItem[]>): Promise<void> {
  const nextWrite = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const payload = JSON.stringify(normalizeFamilyMedia(data), null, 2);
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

export function getMemberMediaDir(memberId: FamilyMemberId): string {
  return path.join(process.cwd(), "public", "family", memberId);
}

export function isLocalMediaSrc(src: string): boolean {
  return src.startsWith("/family/");
}

export function localSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
