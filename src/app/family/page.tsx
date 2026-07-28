import { isAuthenticated } from "@/lib/auth-session";
import { readFamilyMedia } from "@/lib/family-media";
import FamilyPageContent from "@/components/FamilyPageContent";

export default async function FamilyPage() {
  const [initialMedia, isLoggedIn] = await Promise.all([
    readFamilyMedia(),
    isAuthenticated(),
  ]);

  return <FamilyPageContent initialMedia={initialMedia} isLoggedIn={isLoggedIn} />;
}
