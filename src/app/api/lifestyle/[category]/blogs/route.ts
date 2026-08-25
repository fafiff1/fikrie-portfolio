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
  type BlogPost,
  type LifestyleCategory,
} from "@/lib/lifestyle";

const MAX_COVER_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
  return NextResponse.json({ blogs: data[category].blogs });
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
    const saved = await saveCoverImage(cover, category);
    if (saved instanceof NextResponse) return saved;
    coverImage = saved;
  }

  const blog: BlogPost = {
    id: `${category}-blog-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    createdAt: new Date().toISOString(),
    coverImage,
  };

  const allData = await readLifestyleData();
  allData[category].blogs = [blog, ...allData[category].blogs];
  await writeLifestyleData(allData);

  return NextResponse.json({ blog, blogs: allData[category].blogs });
}

async function saveCoverImage(
  cover: File,
  category: LifestyleCategory
): Promise<string | NextResponse> {
  if (cover.size > MAX_COVER_SIZE) {
    return NextResponse.json({ error: "Cover image exceeds 10MB limit." }, { status: 400 });
  }

  if (!IMAGE_TYPES.includes(cover.type)) {
    return NextResponse.json({ error: "Cover must be a photo." }, { status: 400 });
  }

  const ext = path.extname(cover.name) || ".jpg";
  const filename = `cover_${Date.now()}${ext}`;
  const mediaDir = getLifestyleMediaDir(category);
  await fs.mkdir(mediaDir, { recursive: true });
  const buffer = Buffer.from(await cover.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);
  return `/lifestyle/${category}/${filename}`;
}

async function deleteLocalCover(coverImage: string | undefined): Promise<void> {
  if (coverImage && isLocalLifestyleSrc(coverImage)) {
    try {
      await fs.unlink(localLifestyleSrcToFilePath(coverImage));
    } catch {
      // Cover may already be missing
    }
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await getCategory(context);
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
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

  const allData = await readLifestyleData();
  const index = allData[category].blogs.findIndex((entry) => entry.id === blogId);

  if (index === -1) {
    return NextResponse.json({ error: "Blog not found." }, { status: 404 });
  }

  const existing = allData[category].blogs[index];
  let coverImage = existing.coverImage;

  if (removeCover) {
    await deleteLocalCover(coverImage);
    coverImage = undefined;
  }

  if (cover instanceof File && cover.size > 0) {
    const saved = await saveCoverImage(cover, category);
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

  allData[category].blogs[index] = updated;
  await writeLifestyleData(allData);

  return NextResponse.json({ blog: updated, blogs: allData[category].blogs });
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const category = await getCategory(context);
  if (!category) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
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

  const allData = await readLifestyleData();
  const blog = allData[category].blogs.find((entry) => entry.id === blogId);

  if (!blog) {
    return NextResponse.json({ blogs: allData[category].blogs });
  }

  await deleteLocalCover(blog.coverImage);

  allData[category].blogs = allData[category].blogs.filter((entry) => entry.id !== blogId);
  await writeLifestyleData(allData);

  return NextResponse.json({ blogs: allData[category].blogs });
}
