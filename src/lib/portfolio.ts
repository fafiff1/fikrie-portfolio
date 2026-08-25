import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_PORTFOLIO_SECTIONS,
  isPortfolioSectionId,
  type PortfolioSection,
  type PortfolioSectionId,
} from "@/lib/portfolio-shared";

export type {
  PortfolioClient,
  PortfolioImage,
  PortfolioSection,
  PortfolioSectionId,
} from "@/lib/portfolio-shared";
export {
  createPortfolioSectionId,
  DEFAULT_PORTFOLIO_SECTIONS,
  isPortfolioSectionId,
  PORTFOLIO_SECTION_IDS,
} from "@/lib/portfolio-shared";

const DATA_FILE = path.join(process.cwd(), "data", "portfolio.json");

let writeQueue: Promise<void> = Promise.resolve();

function normalizeSections(sections: PortfolioSection[]): PortfolioSection[] {
  return sections
    .filter((section) => isPortfolioSectionId(section.id))
    .map((section) => ({
      ...section,
      period: section.period ?? "",
      company: section.company ?? "",
      description: section.description ?? "",
      images: Array.isArray(section.images) ? section.images : [],
      clients: Array.isArray(section.clients) ? section.clients : undefined,
    }));
}

async function readPortfolioSectionsFromDisk(): Promise<PortfolioSection[]> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const raw = await fs.readFile(DATA_FILE, "utf-8");
      if (!raw.trim()) {
        throw new Error("Portfolio data file is empty.");
      }

      const parsed = JSON.parse(raw) as { sections?: PortfolioSection[] };
      if (!Array.isArray(parsed.sections)) {
        return DEFAULT_PORTFOLIO_SECTIONS;
      }

      return normalizeSections(parsed.sections);
    } catch (error) {
      const missingFile =
        error instanceof Error && "code" in error && error.code === "ENOENT";
      if (missingFile) {
        return DEFAULT_PORTFOLIO_SECTIONS;
      }

      if (attempt === 2) {
        return DEFAULT_PORTFOLIO_SECTIONS;
      }

      await new Promise((resolve) => setTimeout(resolve, 15 * (attempt + 1)));
    }
  }

  return DEFAULT_PORTFOLIO_SECTIONS;
}

export async function readPortfolioSections(): Promise<PortfolioSection[]> {
  await writeQueue;
  return readPortfolioSectionsFromDisk();
}

export async function writePortfolioSections(sections: PortfolioSection[]): Promise<void> {
  const nextWrite = writeQueue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    const payload = JSON.stringify({ sections: normalizeSections(sections) }, null, 2);
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

export function getPortfolioMediaDir(sectionId: PortfolioSectionId): string {
  return path.join(process.cwd(), "public", "portfolio", sectionId);
}

export async function deletePortfolioSectionMedia(sectionId: PortfolioSectionId): Promise<void> {
  await fs.rm(getPortfolioMediaDir(sectionId), { recursive: true, force: true }).catch(() => undefined);
}

export function isLocalPortfolioSrc(src: string): boolean {
  return src.startsWith("/portfolio/");
}

export function localPortfolioSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
