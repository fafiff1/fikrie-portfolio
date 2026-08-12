import About from "@/components/About";
import PageLayout from "@/components/PageLayout";
import { readSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "About | Fahreza Portfolio",
  description: "Learn about Fahreza, a Quality Engineer based in Melbourne.",
};

export default async function AboutPage() {
  const siteContent = await readSiteContent();

  return (
    <PageLayout>
      <About content={siteContent.about} />
    </PageLayout>
  );
}
