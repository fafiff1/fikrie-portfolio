import { NextResponse } from "next/server";
import { readPortfolioSections } from "@/lib/portfolio";

export async function GET() {
  const sections = await readPortfolioSections();
  return NextResponse.json({ sections });
}
