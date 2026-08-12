import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  getProfileMediaDir,
  isLocalProfileSrc,
  localProfileSrcToFilePath,
  readSiteContent,
  writeSiteContent,
} from "@/lib/site-content";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

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
    return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  }

  const ext = path.extname(file.name) || ".png";
  const filename = `profile_${Date.now()}${ext}`;
  const mediaDir = getProfileMediaDir();
  await fs.mkdir(mediaDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);

  const profileImage = `/profile/${filename}`;
  const content = await readSiteContent();
  const previousImage = content.hero.profileImage;

  content.hero.profileImage = profileImage;
  await writeSiteContent(content);

  if (isLocalProfileSrc(previousImage) && previousImage !== profileImage) {
    try {
      await fs.unlink(localProfileSrcToFilePath(previousImage));
    } catch {
      // Previous image may already be missing
    }
  }

  return NextResponse.json({ profileImage, content });
}
