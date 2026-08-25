import PageLayout from "@/components/PageLayout";
import ReviewsPageContent from "@/components/ReviewsPageContent";
import { readReviews } from "@/lib/reviews";

export const metadata = {
  title: "Testimonials | Fahreza Portfolio",
  description: "Testimonials from managers, tech leads, developers, project managers, and clients.",
};

export default async function ReviewsPage() {
  const reviews = await readReviews();

  return (
    <PageLayout>
      <ReviewsPageContent initialReviews={reviews} />
    </PageLayout>
  );
}
