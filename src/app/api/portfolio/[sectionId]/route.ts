import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-session";
import {
  isPortfolioSectionId,
  readPortfolioSections,
  writePortfolioSections,
  type PortfolioClient,
  type PortfolioSectionId,
} from "@/lib/portfolio";

type RouteContext = { params: Promise<{ sectionId: string }> };

async function getSectionId(context: RouteContext): Promise<PortfolioSectionId | null> {
  const { sectionId } = await context.params;
  return isPortfolioSectionId(sectionId) ? sectionId : null;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sectionId = await getSectionId(context);
  if (!sectionId) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }

  const body = await request.json();
  const { period, company, role, description, clients } = body as {
    period?: string;
    company?: string;
    role?: string;
    description?: string;
    clients?: PortfolioClient[];
  };

  if (typeof company !== "string" || company.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a company name." }, { status: 400 });
  }

  if (typeof description !== "string" || description.trim().length < 10) {
    return NextResponse.json(
      { error: "Please write at least 10 characters for the description." },
      { status: 400 }
    );
  }

  const sections = await readPortfolioSections();
  const index = sections.findIndex((section) => section.id === sectionId);

  if (index === -1) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const existing = sections[index];

  sections[index] = {
    ...existing,
    period: typeof period === "string" ? period.trim() : existing.period,
    company: company.trim(),
    role: typeof role === "string" ? role.trim() : existing.role,
    description: description.trim(),
    clients: Array.isArray(clients)
      ? clients.map((client) => ({
          id: client.id,
          name: client.name.trim(),
          description: client.description.trim(),
        }))
      : existing.clients,
  };

  await writePortfolioSections(sections);

  return NextResponse.json({ section: sections[index], sections });
}
