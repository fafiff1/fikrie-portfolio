import { VALID_USERNAME, VALID_PASSWORD } from "@/lib/auth";

export type RecoveryType = "username" | "password" | "both";

export function buildRecoveryEmailBody(type: RecoveryType): string {
  const lines = [
    "Portfolio login recovery",
    "",
    "You requested your login details for the Fahreza portfolio.",
    "",
  ];

  if (type === "username" || type === "both") {
    lines.push(`Username: ${VALID_USERNAME}`);
  }

  if (type === "password" || type === "both") {
    lines.push(`Password: ${VALID_PASSWORD}`);
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
  if (type === "password") return "Your portfolio password";
  return "Your portfolio login details";
}

export function isRecoveryType(value: string): value is RecoveryType {
  return value === "username" || value === "password" || value === "both";
}
