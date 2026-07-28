import Portfolio from "@/components/Portfolio";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Portfolio | Fahreza Portfolio",
  description: "Featured quality engineering projects by Fahreza.",
};

export default function PortfolioPage() {
  return (
    <PageLayout>
      <Portfolio />
    </PageLayout>
  );
}
