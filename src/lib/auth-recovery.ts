import type { StoredUser } from "@/lib/users";

export type RecoveryType = "username" | "password" | "both";

export function isRecoveryType(value: string): value is RecoveryType {
  return value === "username" || value === "password" || value === "both";
}

export function buildRecoveryEmailBody(user: StoredUser, type: RecoveryType): string {
  const lines = [
    "Portfolio login recovery",
    "",
    "You requested your login details for the Fahreza portfolio.",
    "",
  ];

  if (type === "username" || type === "both") {
    lines.push(`Username: ${user.username}`);
  }

  if (type === "password" || type === "both") {
    lines.push(
      "",
      "For security, your password cannot be sent by email.",
      "If you forgot it, please contact the site owner or create a new account from the login page."
    );
  }

  lines.push(
    "",
    "If you did not request this email, you can ignore it.",
    "",
    "— Fahreza Portfolio"
  );

  return lines.join("\n");
}

export function buildRecoveryEmailSubject(type: RecoveryType): string {
  if (type === "username") return "Your portfolio username";
  if (type === "password") return "Portfolio password help";
  return "Your portfolio login details";
}
