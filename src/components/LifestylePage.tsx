import { isAuthenticated } from "@/lib/auth-session";
import { readLifestyleSection, type LifestyleCategory } from "@/lib/lifestyle";
import LifestylePageContent from "@/components/LifestylePageContent";

type Props = {
  category: LifestyleCategory;
};

export async function LifestylePage({ category }: Props) {
  const [section, isLoggedIn] = await Promise.all([
    readLifestyleSection(category),
    isAuthenticated(),
  ]);

  return (
    <LifestylePageContent
      category={category}
      initialBlogs={section.blogs}
      initialMedia={section.media}
      isLoggedIn={isLoggedIn}
    />
  );
}
