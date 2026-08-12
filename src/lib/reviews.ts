import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_REVIEWS, type Review } from "@/lib/reviews-shared";

export type { Review } from "@/lib/reviews-shared";
export { DEFAULT_REVIEWS } from "@/lib/reviews-shared";

const DATA_FILE = path.join(process.cwd(), "data", "reviews.json");

export async function readReviews(): Promise<Review[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw) as { reviews: Review[] };
    return parsed.reviews?.length ? parsed.reviews : DEFAULT_REVIEWS;
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
