import { promises as fs } from "fs";
import path from "path";

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "contact-messages.json");

export async function readContactMessages(): Promise<ContactMessage[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw) as ContactMessage[];
  } catch {
    return [];
  }
}

export async function saveContactMessage(
  message: Omit<ContactMessage, "id" | "createdAt">
): Promise<ContactMessage> {
  const messages = await readContactMessages();
  const entry: ContactMessage = {
    ...message,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  messages.unshift(entry);
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), "utf-8");

  return entry;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
