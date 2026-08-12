import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_SITE_CONFIG, type SiteConfig } from "@/lib/site-config-shared";

export type { SiteConfig } from "@/lib/site-config-shared";
export { DEFAULT_SITE_CONFIG } from "@/lib/site-config-shared";

const DATA_FILE = path.join(process.cwd(), "data", "site-config.json");

export async function readSiteConfig(): Promise<SiteConfig> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<SiteConfig>;
    return { ...DEFAULT_SITE_CONFIG, ...parsed };
  } catch {
    return DEFAULT_SITE_CONFIG;
  }
}

export async function writeSiteConfig(config: SiteConfig): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(config, null, 2), "utf-8");
}

export async function getEffectiveContactEmail(): Promise<string | null> {
  const config = await readSiteConfig();
  const fromConfig = config.contactReceiverEmail.trim();
  if (fromConfig) return fromConfig;

  const fromEnv = process.env.CONTACT_RECEIVER_EMAIL?.trim();
  return fromEnv || null;
}
