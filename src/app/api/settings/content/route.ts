import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-session";
import { readSiteContent, writeSiteContent, type SiteContent } from "@/lib/site-content";

export async function GET() {
  const content = await readSiteContent();
  return NextResponse.json({ content });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<SiteContent>;
  const current = await readSiteContent();

  const content: SiteContent = {
    hero: { ...current.hero, ...body.hero },
    about: {
      intro: body.about?.intro ?? current.about.intro,
      stats: body.about?.stats?.length ? body.about.stats : current.about.stats,
    },
    contact: {
      ...current.contact,
      ...body.contact,
      socialLinks: {
        ...current.contact.socialLinks,
        ...body.contact?.socialLinks,
      },
    },
    seo: { ...current.seo, ...body.seo },
    footer: { ...current.footer, ...body.footer },
  };

  await writeSiteContent(content);
  return NextResponse.json({ content });
}
