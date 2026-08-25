import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { isAuthenticated } from "@/lib/auth-session";
import {
  addReview,
  isLocalReviewSrc,
  isReviewAudience,
  localReviewSrcToFilePath,
  readReviews,
  saveReviewImage,
  writeReviews,
} from "@/lib/reviews";

export async function GET() {
  const reviews = await readReviews();
  return NextResponse.json({ reviews });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  if (typeof formData.get("website") === "string" && formData.get("website")) {
    const reviews = await readReviews();
    return NextResponse.json({ success: true, reviews });
  }

  const name = formData.get("name");
  const role = formData.get("role");
  const company = formData.get("company");
  const content = formData.get("content");
  const audienceValue = formData.get("audience");
  const image = formData.get("image");
  const imageUrl = formData.get("imageUrl");

  if (typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json({ error: "Please enter a reviewer name." }, { status: 400 });
  }

  if (typeof audienceValue !== "string" || !isReviewAudience(audienceValue)) {
    return NextResponse.json({ error: "Please choose an audience." }, { status: 400 });
  }

  if (typeof content !== "string" || content.trim().length < 10) {
    return NextResponse.json({ error: "Please enter review content." }, { status: 400 });
  }

  let imageSrc = typeof imageUrl === "string" ? imageUrl.trim() : "";

  if (image instanceof File && image.size > 0) {
    try {
      imageSrc = await saveReviewImage(image);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save image.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const { review, reviews } = await addReview({
    name: name.trim(),
    role: typeof role === "string" ? role.trim() : "",
    company: typeof company === "string" ? company.trim() : "",
    content: content.trim(),
    audience: audienceValue,
    image: imageSrc,
  });

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

  const audienceValue = formData.get("audience");

  if (image instanceof File && image.size > 0) {
    try {
      imageSrc = await saveReviewImage(image);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save image.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

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
    audience: typeof audienceValue === "string" && isReviewAudience(audienceValue)
      ? audienceValue
      : existing.audience,
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
