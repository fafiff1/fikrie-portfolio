import { LifestylePage } from "@/components/LifestylePage";
import { LIFESTYLE_META } from "@/lib/lifestyle-shared";

export const metadata = {
  title: `${LIFESTYLE_META.travel.title} | Fahreza Portfolio`,
  description: LIFESTYLE_META.travel.description,
};

export default function TravelPage() {
  return <LifestylePage category="travel" />;
}
