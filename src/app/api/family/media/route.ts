import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  readFamilyMedia,
  writeFamilyMedia,
  isFamilyMemberId,
  getMemberMediaDir,
  isLocalMediaSrc,
  localSrcToFilePath,
  type MediaItem,
} from "@/lib/family-media";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export async function GET() {
  const media = await readFamilyMedia();
  return NextResponse.json(media);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const memberId = formData.get("memberId");
  const title = formData.get("title");

  if (!(file instanceof File) || typeof memberId !== "string" || !isFamilyMemberId(memberId)) {
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

  const memberDir = getMemberMediaDir(memberId);
  await fs.mkdir(memberDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(memberDir, filename);
  await fs.writeFile(filePath, buffer);

  const mediaItem: MediaItem = {
    id: `${memberId}-${Date.now()}`,
    type: isPhoto ? "photo" : "video",
    title: typeof title === "string" && title.trim() ? title.trim() : file.name,
    src: `/family/${memberId}/${filename}`,
  };

  const allMedia = await readFamilyMedia();
  allMedia[memberId] = [mediaItem, ...allMedia[memberId]];
  await writeFamilyMedia(allMedia);

  return NextResponse.json({ item: mediaItem, media: allMedia[memberId] });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let memberId: unknown;
  let mediaId: unknown;

  try {
    const body = (await request.json()) as { memberId?: unknown; mediaId?: unknown };
    memberId = body.memberId;
    mediaId = body.mediaId;
  } catch {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  if (typeof memberId !== "string" || !isFamilyMemberId(memberId) || typeof mediaId !== "string") {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const allMedia = await readFamilyMedia();
  const item = allMedia[memberId].find((entry) => entry.id === mediaId);

  if (!item) {
    return NextResponse.json({ error: "Media not found." }, { status: 404 });
  }

  if (isLocalMediaSrc(item.src)) {
    try {
      await fs.unlink(localSrcToFilePath(item.src));
    } catch {
      // File may already be missing
    }
  }

  if (item.poster && isLocalMediaSrc(item.poster)) {
    try {
      await fs.unlink(localSrcToFilePath(item.poster));
    } catch {
      // Poster may already be missing
    }
  }

  allMedia[memberId] = allMedia[memberId].filter((entry) => entry.id !== mediaId);
  await writeFamilyMedia(allMedia);

  return NextResponse.json({ media: allMedia[memberId] });
}
