import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth-session";
import {
  createPortfolioSectionId,
  readPortfolioSections,
  writePortfolioSections,
  type PortfolioSection,
} from "@/lib/portfolio";

export async function GET() {
  const sections = await readPortfolioSections();
  return NextResponse.json({ sections });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    period?: unknown;
    company?: unknown;
    role?: unknown;
    description?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid create request." }, { status: 400 });
  }

  const { period, company, role, description } = body;

  if (typeof company !== "string" || company.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a company name." }, { status: 400 });
  }

  if (typeof description !== "string" || description.trim().length < 10) {
    return NextResponse.json(
      { error: "Please write at least 10 characters for the description." },
      { status: 400 }
    );
  }

  const section: PortfolioSection = {
    id: createPortfolioSectionId(company.trim()),
    period: typeof period === "string" ? period.trim() : "",
    company: company.trim(),
    role: typeof role === "string" && role.trim() ? role.trim() : undefined,
    description: description.trim(),
    images: [],
  };

  const sections = await readPortfolioSections();
  const nextSections = [section, ...sections];
  await writePortfolioSections(nextSections);

  return NextResponse.json({ section, sections: nextSections });
}
