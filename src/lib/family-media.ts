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

export function isFamilyMemberId(value: string): value is FamilyMemberId {
  return FAMILY_MEMBER_IDS.includes(value as FamilyMemberId);
}

export async function readFamilyMedia(): Promise<Record<FamilyMemberId, MediaItem[]>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as Record<FamilyMemberId, MediaItem[]>;
  } catch {
    return { rafael: [], mikhail: [], mira: [] };
  }
}

export async function writeFamilyMedia(data: Record<FamilyMemberId, MediaItem[]>): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
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
