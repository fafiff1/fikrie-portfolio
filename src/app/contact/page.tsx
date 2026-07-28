import Contact from "@/components/Contact";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "Contact | Fahreza Portfolio",
  description: "Get in touch with Fahreza, Quality Engineer in Melbourne.",
};

export default function ContactPage() {
  return (
    <PageLayout>
      <Contact />
    </PageLayout>
  );
}
