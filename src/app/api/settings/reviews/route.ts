import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth-session";
import {
  getReviewMediaDir,
  isLocalReviewSrc,
  localReviewSrcToFilePath,
  readReviews,
  writeReviews,
  type Review,
} from "@/lib/reviews";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function GET() {
  const reviews = await readReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = formData.get("name");
  const role = formData.get("role");
  const company = formData.get("company");
  const content = formData.get("content");
  const image = formData.get("image");
  const imageUrl = formData.get("imageUrl");

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a reviewer name." }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < 10) {
    return NextResponse.json({ error: "Please enter review content." }, { status: 400 });
  }

  let imageSrc = typeof imageUrl === "string" ? imageUrl.trim() : "";

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image exceeds 10MB limit." }, { status: 400 });
    }

    if (!IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const ext = path.extname(image.name) || ".jpg";
    const filename = `review_${Date.now()}${ext}`;
    const mediaDir = getReviewMediaDir();
    await fs.mkdir(mediaDir, { recursive: true });
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(path.join(mediaDir, filename), buffer);
    imageSrc = `/reviews/${filename}`;
  }

  if (!imageSrc) {
    return NextResponse.json({ error: "Please provide an image or image URL." }, { status: 400 });
  }

  const review: Review = {
    id: `review-${Date.now()}`,
    name: name.trim(),
    role: typeof role === "string" ? role.trim() : "",
    company: typeof company === "string" ? company.trim() : "",
    content: content.trim(),
    image: imageSrc,
  };

  const reviews = await readReviews();
  reviews.unshift(review);
  await writeReviews(reviews);

  return NextResponse.json({ review, reviews });
}

export async function PATCH(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const reviewId = formData.get("reviewId");
  const name = formData.get("name");
  const role = formData.get("role");
  const company = formData.get("company");
  const content = formData.get("content");
  const image = formData.get("image");
  const imageUrl = formData.get("imageUrl");

  if (typeof reviewId !== "string") {
    return NextResponse.json({ error: "Invalid update request." }, { status: 400 });
  }

  const reviews = await readReviews();
  const index = reviews.findIndex((entry) => entry.id === reviewId);

  if (index === -1) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  const existing = reviews[index];
  let imageSrc = existing.image;

  if (image instanceof File && image.size > 0) {
    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image exceeds 10MB limit." }, { status: 400 });
    }

    if (!IMAGE_TYPES.includes(image.type)) {
      return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
    }

    const ext = path.extname(image.name) || ".jpg";
    const filename = `review_${Date.now()}${ext}`;
    const mediaDir = getReviewMediaDir();
    await fs.mkdir(mediaDir, { recursive: true });
    const buffer = Buffer.from(await image.arrayBuffer());
    await fs.writeFile(path.join(mediaDir, filename), buffer);
    imageSrc = `/reviews/${filename}`;

    if (isLocalReviewSrc(existing.image)) {
      try {
        await fs.unlink(localReviewSrcToFilePath(existing.image));
      } catch {
        // Previous image may already be missing
      }
    }
  } else if (typeof imageUrl === "string" && imageUrl.trim()) {
    imageSrc = imageUrl.trim();
  }

  reviews[index] = {
    ...existing,
    name: typeof name === "string" ? name.trim() : existing.name,
    role: typeof role === "string" ? role.trim() : existing.role,
    company: typeof company === "string" ? company.trim() : existing.company,
    content: typeof content === "string" ? content.trim() : existing.content,
    image: imageSrc,
  };

  await writeReviews(reviews);
  return NextResponse.json({ review: reviews[index], reviews });
}

export async function DELETE(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reviewId } = await request.json();

  if (typeof reviewId !== "string") {
    return NextResponse.json({ error: "Invalid delete request." }, { status: 400 });
  }

  const reviews = await readReviews();
  const review = reviews.find((entry) => entry.id === reviewId);

  if (!review) {
    return NextResponse.json({ error: "Review not found." }, { status: 404 });
  }

  if (isLocalReviewSrc(review.image)) {
    try {
      await fs.unlink(localReviewSrcToFilePath(review.image));
    } catch {
      // Image may already be missing
    }
  }

  const updated = reviews.filter((entry) => entry.id !== reviewId);
  await writeReviews(updated);

  return NextResponse.json({ reviews: updated });
}
