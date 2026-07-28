import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  readLifestyleData,
  writeLifestyleData,
  isLifestyleCategory,
  getLifestyleMediaDir,
  isLocalLifestyleSrc,
  localLifestyleSrcToFilePath,
  type MediaItem,
  type LifestyleCategory,
} from "@/lib/lifestyle";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

type RouteContext = { params: Promise<{ category: string }> };

async function getCategory(context: RouteContext): Promise<LifestyleCategory | null> {
  const { category } = await context.params;
  return isLifestyleCategory(category) ? category : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const category = await getCategory(context);
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const data = await readLifestyleData();
  return NextResponse.json({ media: data[category].media });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await getCategory(context);
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = formData.get("title");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 100MB limit." }, { status: 400 });
  }

  const isPhoto = IMAGE_TYPES.includes(file.type);
  const isVideo = VIDEO_TYPES.includes(file.type);

  if (!isPhoto && !isVideo) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a photo or video." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name) || (isPhoto ? ".jpg" : ".mp4");
  const safeBase = path
    .basename(file.name, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 50);
  const filename = `${safeBase || "upload"}_${Date.now()}${ext}`;

  const mediaDir = getLifestyleMediaDir(category);
  await fs.mkdir(mediaDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);

  const mediaItem: MediaItem = {
    id: `${category}-media-${Date.now()}`,
    type: isPhoto ? "photo" : "video",
    title: typeof title === "string" && title.trim() ? title.trim() : file.name,
    src: `/lifestyle/${category}/${filename}`,
  };

  const allData = await readLifestyleData();
  allData[category].media = [mediaItem, ...allData[category].media];
  await writeLifestyleData(allData);

  return NextResponse.json({ item: mediaItem, media: allData[category].media });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await getCategory(context);
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  const { mediaId } = await request.json();

  if (typeof mediaId !== "string") {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const allData = await readLifestyleData();
  const item = allData[category].media.find((entry) => entry.id === mediaId);

  if (!item) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  if (isLocalLifestyleSrc(item.src)) {
    try {
      await fs.unlink(localLifestyleSrcToFilePath(item.src));
    } catch {
      // File may already be missing
    }
  }

  if (item.poster && isLocalLifestyleSrc(item.poster)) {
    try {
      await fs.unlink(localLifestyleSrcToFilePath(item.poster));
    } catch {
      // Poster may already be missing
    }
  }

  allData[category].media = allData[category].media.filter((entry) => entry.id !== mediaId);
  await writeLifestyleData(allData);

  return NextResponse.json({ media: allData[category].media });
}
