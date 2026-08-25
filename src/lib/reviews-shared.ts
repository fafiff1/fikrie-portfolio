export const REVIEW_AUDIENCES = [
  "manager",
  "tech-lead",
  "developer",
  "project-manager",
  "client",
] as const;

export type ReviewAudience = (typeof REVIEW_AUDIENCES)[number];

export const REVIEW_AUDIENCE_LABELS: Record<ReviewAudience, string> = {
  manager: "Manager",
  "tech-lead": "Tech Lead",
  developer: "Developer",
  "project-manager": "Project Manager",
  client: "Client",
};

export type Review = {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
  audience: ReviewAudience;
};

export function isReviewAudience(value: string): value is ReviewAudience {
  return REVIEW_AUDIENCES.includes(value as ReviewAudience);
}

export const DEFAULT_REVIEWS: Review[] = [
  {
    id: "review-1",
    name: "Sarah Jenkins",
    role: "Product Manager",
    company: "TechFlow",
    audience: "project-manager",
    content:
      "Fahreza's attention to detail is unmatched. He caught edge cases we hadn't even considered. A true quality champion.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "review-2",
    name: "David Chen",
    role: "Lead Developer",
    company: "InnovateX",
    audience: "tech-lead",
    content:
      "Working with Fahreza gave our team immense confidence in our releases. His automated testing frameworks saved us countless hours.",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  },
  {
    id: "review-3",
    name: "Emma Williams",
    role: "CTO",
    company: "BuildRight",
    audience: "manager",
    content:
      "Fahreza brings a rare combination of technical depth and strategic thinking to quality engineering. Highly recommended.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
  },
];
