export type MediaItem = {
  id: string;
  type: "photo" | "video";
  title: string;
  src: string;
  poster?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  coverImage?: string;
};

export type LifestyleCategory = "hobbies" | "sports" | "travel";

export type LifestyleSection = {
  blogs: BlogPost[];
  media: MediaItem[];
};

export const LIFESTYLE_CATEGORIES: LifestyleCategory[] = ["hobbies", "sports", "travel"];

export function isLifestyleCategory(value: string): value is LifestyleCategory {
  return LIFESTYLE_CATEGORIES.includes(value as LifestyleCategory);
}

export const LIFESTYLE_META: Record<
  LifestyleCategory,
  { title: string; description: string; emoji: string }
> = {
  hobbies: {
    title: "Hobbies",
    description: "Creative pursuits, passions, and pastimes I enjoy in my free time.",
    emoji: "🎨",
  },
  sports: {
    title: "Sports",
    description: "Active moments on the field, court, and everywhere in between.",
    emoji: "⚽",
  },
  travel: {
    title: "Travel",
    description: "Adventures, destinations, and memories from places near and far.",
    emoji: "✈️",
  },
};
