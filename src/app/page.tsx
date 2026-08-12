import Hero from "@/components/Hero";
import { readSiteContent } from "@/lib/site-content";

export default async function Home() {
  const siteContent = await readSiteContent();

  return (
    <main>
      <Hero content={siteContent.hero} />
    </main>
  );
}
