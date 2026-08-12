import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  getPortfolioMediaDir,
  isLocalPortfolioSrc,
  isPortfolioSectionId,
  localPortfolioSrcToFilePath,
  readPortfolioSections,
  writePortfolioSections,
  type PortfolioImage,
  type PortfolioSectionId,
} from "@/lib/portfolio";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type RouteContext = { params: Promise<{ sectionId: string }> };

async function getSectionId(context: RouteContext): Promise<PortfolioSectionId | null> {
  const { sectionId } = await context.params;
  return isPortfolioSectionId(sectionId) ? sectionId : null;
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sectionId = await getSectionId(context);
  if (!sectionId) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const caption = formData.get("caption");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image exceeds 10MB limit." }, { status: 400 });
  }

  if (!IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Upload a photo." }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `image_${Date.now()}${ext}`;
  const mediaDir = getPortfolioMediaDir(sectionId);
  await fs.mkdir(mediaDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);

  const image: PortfolioImage = {
    id: `${sectionId}-img-${Date.now()}`,
    src: `/portfolio/${sectionId}/${filename}`,
    caption: typeof caption === "string" && caption.trim() ? caption.trim() : undefined,
  };

  const sections = await readPortfolioSections();
  const index = sections.findIndex((section) => section.id === sectionId);

  if (index === -1) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  sections[index].images = [image, ...sections[index].images];
  await writePortfolioSections(sections);

  return NextResponse.json({ image, section: sections[index] });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sectionId = await getSectionId(context);
  if (!sectionId) {
    return NextResponse.json({ error: "Invalid section." }, { status: 400 });
  }

  const { imageId } = await request.json();

  if (typeof imageId !== "string") {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const sections = await readPortfolioSections();
  const index = sections.findIndex((section) => section.id === sectionId);

  if (index === -1) {
    return NextResponse.json({ error: "Section not found." }, { status: 404 });
  }

  const image = sections[index].images.find((entry) => entry.id === imageId);

  if (!image) {
    return NextResponse.json({ error: "Image not found." }, { status: 404 });
  }

  if (isLocalPortfolioSrc(image.src)) {
    try {
      await fs.unlink(localPortfolioSrcToFilePath(image.src));
    } catch {
      // File may already be missing
    }
  }

  sections[index].images = sections[index].images.filter((entry) => entry.id !== imageId);
  await writePortfolioSections(sections);

  return NextResponse.json({ section: sections[index] });
}
