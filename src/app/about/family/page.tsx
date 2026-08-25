import { isAuthenticated } from "@/lib/auth-session";
import { readFamilyMedia } from "@/lib/family-media";
import { readFamilyBlogs } from "@/lib/family-blogs";
import FamilyPageContent from "@/components/FamilyPageContent";

export const metadata = {
  title: "Family | Fahreza Portfolio",
  description: "Meet Fahreza's family — Mira, Rafael, and Mikhail.",
};

export default async function FamilyPage() {
  const [initialMedia, initialBlogs, isLoggedIn] = await Promise.all([
    readFamilyMedia(),
    readFamilyBlogs(),
    isAuthenticated(),
  ]);

  return (
    <FamilyPageContent
      initialMedia={initialMedia}
      initialBlogs={initialBlogs}
      isLoggedIn={isLoggedIn}
    />
  );
}
