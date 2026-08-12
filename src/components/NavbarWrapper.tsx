import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { readSiteContent } from "@/lib/site-content";

export default async function NavbarWrapper() {
  const [cookieStore, siteContent] = await Promise.all([cookies(), readSiteContent()]);
  const isLoggedIn = cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;

  return <Navbar isLoggedIn={isLoggedIn} brandName={siteContent.seo.brandName} />;
}
