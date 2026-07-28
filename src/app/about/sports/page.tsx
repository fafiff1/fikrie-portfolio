import { LifestylePage } from "@/components/LifestylePage";
import { LIFESTYLE_META } from "@/lib/lifestyle-shared";

export const metadata = {
  title: `${LIFESTYLE_META.sports.title} | Fahreza Portfolio`,
  description: LIFESTYLE_META.sports.description,
};

export default function SportsPage() {
  return <LifestylePage category="sports" />;
}
