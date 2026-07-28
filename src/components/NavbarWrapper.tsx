import { cookies } from "next/headers";
import Navbar from "@/components/Navbar";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export default async function NavbarWrapper() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;

  return <Navbar isLoggedIn={isLoggedIn} />;
}
