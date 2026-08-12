import Contact from "@/components/Contact";
import PageLayout from "@/components/PageLayout";
import { readSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "Contact | Fahreza Portfolio",
  description: "Get in touch with Fahreza, Quality Engineer in Melbourne.",
};

export default async function ContactPage() {
  const siteContent = await readSiteContent();

  return (
    <PageLayout>
      <Contact content={siteContent.contact} />
    </PageLayout>
  );
}
