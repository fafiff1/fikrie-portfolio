import { LifestylePage } from "@/components/LifestylePage";
import { LIFESTYLE_META } from "@/lib/lifestyle-shared";

export const metadata = {
  title: `${LIFESTYLE_META.hobbies.title} | Fahreza Portfolio`,
  description: LIFESTYLE_META.hobbies.description,
};

export default function HobbiesPage() {
  return <LifestylePage category="hobbies" />;
}
