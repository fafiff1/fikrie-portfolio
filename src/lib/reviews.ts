import { promises as fs } from "fs";
import path from "path";
import {
  DEFAULT_REVIEWS,
  isReviewAudience,
  type Review,
  type ReviewAudience,
} from "@/lib/reviews-shared";

export type { Review, ReviewAudience } from "@/lib/reviews-shared";
export {
  DEFAULT_REVIEWS,
  REVIEW_AUDIENCES,
  REVIEW_AUDIENCE_LABELS,
  isReviewAudience,
} from "@/lib/reviews-shared";

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json");
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function normalizeReview(review: Review): Review {
  return {
    ...review,
    role: review.role ?? "",
    company: review.company ?? "",
    image: review.image ?? "",
    audience: isReviewAudience(review.audience) ? review.audience : "client",
  };
}

export async function readReviews(): Promise<Review[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { reviews: Review[] };
    const reviews = parsed.reviews?.length ? parsed.reviews : DEFAULT_REVIEWS;
    return reviews.map(normalizeReview);
  } catch {
    return DEFAULT_REVIEWS;
  }
}

export async function writeReviews(reviews: Review[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify({ reviews }, null, 2), "utf-8");
}

export function getReviewMediaDir(): string {
  return path.join(process.cwd(), "public", "reviews");
}

export function isLocalReviewSrc(src: string): boolean {
  return src.startsWith("/reviews/");
}

export function localReviewSrcToFilePath(src: string): string {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

export async function saveReviewImage(image: File): Promise<string> {
  if (image.size > MAX_FILE_SIZE) {
    throw new Error("Image exceeds 10MB limit.");
  }

  if (!IMAGE_TYPES.includes(image.type)) {
    throw new Error("Unsupported image type.");
  }

  const ext = path.extname(image.name) || ".jpg";
  const filename = `review_${Date.now()}${ext}`;
  const mediaDir = getReviewMediaDir();
  await fs.mkdir(mediaDir, { recursive: true });
  const buffer = Buffer.from(await image.arrayBuffer());
  await fs.writeFile(path.join(mediaDir, filename), buffer);
  return `/reviews/${filename}`;
}

export async function addReview(input: {
  name: string;
  role: string;
  company: string;
  content: string;
  audience: ReviewAudience;
  image: string;
}): Promise<{ review: Review; reviews: Review[] }> {
  const review: Review = {
    id: `review-${Date.now()}`,
    name: input.name,
    role: input.role,
    company: input.company,
    content: input.content,
    audience: input.audience,
    image: input.image,
  };

  const reviews = await readReviews();
  reviews.unshift(review);
  await writeReviews(reviews);
  return { review, reviews };
}
