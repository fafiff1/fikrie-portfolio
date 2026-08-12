import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SITE_CONTENT, type SiteContent } from "@/lib/site-content-shared";

export type { AboutStat, SiteContent } from "@/lib/site-content-shared";
export { DEFAULT_SITE_CONTENT } from "@/lib/site-content-shared";

const DATA_FILE = path.join(process.cwd(), "data", "site-content.json");

export async function readSiteContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteContent>;
    return mergeSiteContent(parsed);
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

function mergeSiteContent(partial: Partial<SiteContent>): SiteContent {
  return {
    hero: { ...DEFAULT_SITE_CONTENT.hero, ...partial.hero },
    about: {
      intro: partial.about?.intro ?? DEFAULT_SITE_CONTENT.about.intro,
      stats: partial.about?.stats?.length ? partial.about.stats : DEFAULT_SITE_CONTENT.about.stats,
    },
    contact: {
      ...DEFAULT_SITE_CONTENT.contact,
      ...partial.contact,
      socialLinks: {
        ...DEFAULT_SITE_CONTENT.contact.socialLinks,
        ...partial.contact?.socialLinks,
      },
    },
    seo: { ...DEFAULT_SITE_CONTENT.seo, ...partial.seo },
    footer: { ...DEFAULT_SITE_CONTENT.footer, ...partial.footer },
  };
}

export async function writeSiteContent(content: SiteContent): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2), "utf-8");
}

export function getProfileMediaDir(): string {
  return path.join(process.cwd(), "public", "profile");
}

export function isLocalProfileSrc(src: string): boolean {
  return src.startsWith("/profile/");
}

export function localProfileSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}
