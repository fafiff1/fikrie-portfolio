import Testimonials from "@/components/Testimonials";
import PageLayout from "@/components/PageLayout";
import { readReviews } from "@/lib/reviews";

export const metadata = {
  title: "Reviews | Fahreza Portfolio",
  description: "Client reviews and testimonials for Fahreza.",
};

export default async function ReviewsPage() {
  const reviews = await readReviews();

  return (
    <PageLayout>
      <Testimonials reviews={reviews} />
    </PageLayout>
  );
}
