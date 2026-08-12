import { isAuthenticated } from "@/lib/auth-session";
import { readPortfolioSections } from "@/lib/portfolio";
import PortfolioContent from "@/components/PortfolioContent";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Portfolio | Fahreza Portfolio",
  description: "Professional quality engineering experience across Syncsoft, Telstra, Enett, DWS, and Kmart Group.",
};

export default async function PortfolioPage() {
  const [initialSections, isLoggedIn] = await Promise.all([
    readPortfolioSections(),
    isAuthenticated(),
  ]);

  return (
    <PageLayout>
      <PortfolioContent initialSections={initialSections} isLoggedIn={isLoggedIn} />
    </PageLayout>
  );
}
