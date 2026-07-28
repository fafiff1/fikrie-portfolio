import About from "@/components/About";
import PageLayout from "@/components/PageLayout";

export const metadata = {
  title: "About | Fahreza Portfolio",
  description: "Learn about Fahreza, a Quality Engineer based in Melbourne.",
};

export default function AboutPage() {
  return (
    <PageLayout>
      <About />
    </PageLayout>
  );
}
