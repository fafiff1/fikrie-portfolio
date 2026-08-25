import Hero from "@/components/Hero";
import Technology from "@/components/Technology";
import { readSiteContent } from "@/lib/site-content";

export default async function Home() {
  const siteContent = await readSiteContent();

  return (
    <main>
      <Hero content={siteContent.hero} />
      <Technology content={siteContent.technology} />
    </main>
  );
}
