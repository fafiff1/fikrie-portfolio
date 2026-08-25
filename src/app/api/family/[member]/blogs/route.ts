import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  readFamilyBlogs,
  writeFamilyBlogs,
  isFamilyMemberId,
  getMemberBlogCoverDir,
  isLocalFamilyBlogCover,
  localFamilyBlogCoverToFilePath,
  type BlogPost,
  type FamilyMemberId,
} from "@/lib/family-blogs";

const MAX_COVER_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type RouteContext = { params: Promise<{ member: string }> };

async function getMember(context: RouteContext): Promise<FamilyMemberId | null> {
  const { member } = await context.params;
  return isFamilyMemberId(member) ? member : null;
}

export async function GET(_request: Request, context: RouteContext) {
  const memberId = await getMember(context);
  if (!memberId) {
    return NextResponse.json({ error: "Invalid family member." }, { status: 400 });
  }

  const data = await readFamilyBlogs();
  return NextResponse.json({ blogs: data[memberId] });
}

async function saveCoverImage(
  cover: File,
  memberId: FamilyMemberId
): Promise<string | NextResponse> {
  if (cover.size > MAX_COVER_SIZE) {
    return NextResponse.json({ error: "Cover image exceeds 10MB limit." }, { status: 400 });
  }

  if (!IMAGE_TYPES.includes(cover.type)) {
    return NextResponse.json({ error: "Cover must be a photo." }, { status: 400 });
  }

  const ext = path.extname(cover.name) || ".jpg";
  const filename = `cover_${Date.now()}${ext}`;
  const mediaDir = getMemberBlogCoverDir(memberId);
  await fs.mkdir(mediaDir, { recursive: true });
  const buffer = Buffer.from(await cover.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);
  return `/family/${memberId}/${filename}`;
}

async function deleteLocalCover(coverImage: string | undefined): Promise<void> {
  if (coverImage && isLocalFamilyBlogCover(coverImage)) {
    try {
      await fs.unlink(localFamilyBlogCoverToFilePath(coverImage));
    } catch {
      // Cover may already be missing
    }
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = await getMember(context);
  if (!memberId) {
    return NextResponse.json({ error: "Invalid family member." }, { status: 400 });
  }

  const formData = await request.formData();
  const title = formData.get("title");
  const content = formData.get("content");
  const cover = formData.get("cover");

  if (typeof title !== "string" || title.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a blog title." }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < 20) {
    return NextResponse.json(
      { error: "Please write at least 20 characters for your blog." },
      { status: 400 }
    );
  }

  let coverImage: string | undefined;

  if (cover instanceof File && cover.size > 0) {
    const saved = await saveCoverImage(cover, memberId);
    if (saved instanceof NextResponse) return saved;
    coverImage = saved;
  }

  const blog: BlogPost = {
    id: `${memberId}-blog-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    coverImage,
  };

  const allData = await readFamilyBlogs();
  allData[memberId] = [blog, ...allData[memberId]];
  await writeFamilyBlogs(allData);

  return NextResponse.json({ blog, blogs: allData[memberId] });
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = await getMember(context);
  if (!memberId) {
    return NextResponse.json({ error: "Invalid family member." }, { status: 400 });
  }

  const formData = await request.formData();
  const blogId = formData.get("blogId");
  const title = formData.get("title");
  const content = formData.get("content");
  const cover = formData.get("cover");
  const removeCover = formData.get("removeCover") === "true";

  if (typeof blogId !== "string") {
    return NextResponse.json({ error: "Invalid update request." }, { status: 400 });
  }

  if (typeof title !== "string" || title.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a blog title." }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < 20) {
    return NextResponse.json(
      { error: "Please write at least 20 characters for your blog." },
      { status: 400 }
    );
  }

  const allData = await readFamilyBlogs();
  const index = allData[memberId].findIndex((entry) => entry.id === blogId);

  if (index === -1) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  const existing = allData[memberId][index];
  let coverImage = existing.coverImage;

  if (removeCover) {
    await deleteLocalCover(coverImage);
    coverImage = undefined;
  }

  if (cover instanceof File && cover.size > 0) {
    const saved = await saveCoverImage(cover, memberId);
    if (saved instanceof NextResponse) return saved;

    await deleteLocalCover(coverImage);
    coverImage = saved;
  }

  const updated: BlogPost = {
    ...existing,
    title: title.trim(),
    content: content.trim(),
    coverImage,
  };

  allData[memberId][index] = updated;
  await writeFamilyBlogs(allData);

  return NextResponse.json({ blog: updated, blogs: allData[memberId] });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberId = await getMember(context);
  if (!memberId) {
    return NextResponse.json({ error: "Invalid family member." }, { status: 400 });
  }

  const queryBlogId = new URL(request.url).searchParams.get("blogId");
  let blogId = queryBlogId;

  if (!blogId) {
    try {
      const body = (await request.json()) as { blogId?: unknown };
      if (typeof body.blogId === "string") {
        blogId = body.blogId;
      }
    } catch {
      // Fall through to invalid request response below.
    }
  }

  if (!blogId) {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const allData = await readFamilyBlogs();
  const blog = allData[memberId].find((entry) => entry.id === blogId);

  if (!blog) {
    return NextResponse.json({ blogs: allData[memberId] });
  }

  await deleteLocalCover(blog.coverImage);

  allData[memberId] = allData[memberId].filter((entry) => entry.id !== blogId);
  await writeFamilyBlogs(allData);

  return NextResponse.json({ blogs: allData[memberId] });
}
