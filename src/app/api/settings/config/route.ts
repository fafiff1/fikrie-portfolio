import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-session";
import { getEmailProviderStatus, isEmailConfigured } from "@/lib/email";
import { getEffectiveContactEmail, readSiteConfig, writeSiteConfig, type SiteConfig } from "@/lib/site-config";

export async function GET() {
  const config = await readSiteConfig();
  const effectiveEmail = await getEffectiveContactEmail();
  const emailConfigured = await isEmailConfigured();

  return NextResponse.json({
    config,
    effectiveContactEmail: effectiveEmail,
    emailConfigured,
    emailProviders: getEmailProviderStatus(),
  });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SiteConfig>;
  const current = await readSiteConfig();

  const config: SiteConfig = {
    contactReceiverEmail:
      typeof body.contactReceiverEmail === "string"
        ? body.contactReceiverEmail.trim()
        : current.contactReceiverEmail,
    saveContactMessages:
      typeof body.saveContactMessages === "boolean"
        ? body.saveContactMessages
        : current.saveContactMessages,
    allowRegistration:
      typeof body.allowRegistration === "boolean"
        ? body.allowRegistration
        : current.allowRegistration,
  };

  await writeSiteConfig(config);

  const effectiveEmail = await getEffectiveContactEmail();
  const emailConfigured = await isEmailConfigured();

  return NextResponse.json({
    config,
    effectiveContactEmail: effectiveEmail,
    emailConfigured,
    emailProviders: getEmailProviderStatus(),
  });
}
