import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_PORTFOLIO_SECTIONS,
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
  DEFAULT_PORTFOLIO_SECTIONS,
  isPortfolioSectionId,
  PORTFOLIO_SECTION_IDS,
} from "@/lib/portfolio-shared";

const DATA_FILE = path.join(process.cwd(), "data", "portfolio.json");

export async function readPortfolioSections(): Promise<PortfolioSection[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { sections: PortfolioSection[] };
    return mergeWithDefaults(parsed.sections);
  } catch {
    return DEFAULT_PORTFOLIO_SECTIONS;
  }
}

function mergeWithDefaults(sections: PortfolioSection[]): PortfolioSection[] {
  const byId = new Map(sections.map((section) => [section.id, section]));

  return DEFAULT_PORTFOLIO_SECTIONS.map((defaults) => {
    const existing = byId.get(defaults.id);
    if (!existing) return defaults;

    return {
      ...defaults,
      ...existing,
      images: existing.images ?? [],
      clients: existing.clients ?? defaults.clients,
    };
  });
}

export async function writePortfolioSections(sections: PortfolioSection[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ sections }, null, 2), "utf-8");
}

export function getPortfolioMediaDir(sectionId: PortfolioSectionId): string {
  return path.join(process.cwd(), "public", "portfolio", sectionId);
}

export function isLocalPortfolioSrc(src: string): boolean {
  return src.startsWith("/portfolio/");
}

export function localPortfolioSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
