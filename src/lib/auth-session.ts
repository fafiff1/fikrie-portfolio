import { cookies } from "next/headers";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE;
}
