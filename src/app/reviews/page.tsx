import Testimonials from "@/components/Testimonials";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Reviews | Fahreza Portfolio",
  description: "Client reviews and testimonials for Fahreza.",
};

export default function ReviewsPage() {
  return (
    <PageLayout>
      <Testimonials />
    </PageLayout>
  );
}
