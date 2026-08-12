import { promises as fs } from "fs";
import path from "path";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { DEFAULT_PASSWORD, DEFAULT_USERNAME } from "@/lib/auth-shared";

const scryptAsync = promisify(scrypt);

export type StoredUser = {
  id: string;
  username: string;
  passwordHash: string;
  recoveryEmail?: string;
  createdAt: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "users.json");

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,32}$/.test(username);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;

  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, "hex");

  if (derived.length !== keyBuffer.length) return false;
  return timingSafeEqual(derived, keyBuffer);
}

async function seedDefaultUser(): Promise<StoredUser[]> {
  const recoveryEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim();
  const defaultUser: StoredUser = {
    id: "user-default",
    username: DEFAULT_USERNAME,
    passwordHash: await hashPassword(DEFAULT_PASSWORD),
    recoveryEmail: recoveryEmail || undefined,
    createdAt: new Date().toISOString(),
  };

  await writeUsers([defaultUser]);
  return [defaultUser];
}

export async function readUsers(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const users = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(users) || users.length === 0) {
      return seedDefaultUser();
    }
    return users;
  } catch {
    return seedDefaultUser();
  }
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function findUserByUsername(username: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const normalized = username.trim().toLowerCase();
  return users.find((user) => user.username.toLowerCase() === normalized) ?? null;
}

export async function findUserByRecoveryEmail(email: string): Promise<StoredUser | null> {
  const users = await readUsers();
  const normalized = email.trim().toLowerCase();
  const recoveryEmail = process.env.CONTACT_RECEIVER_EMAIL?.trim().toLowerCase();

  const matched = users.find(
    (user) => user.recoveryEmail?.trim().toLowerCase() === normalized
  );
  if (matched) return matched;

  if (recoveryEmail && normalized === recoveryEmail) {
    return users.find((user) => user.username.toLowerCase() === DEFAULT_USERNAME) ?? null;
  }

  return null;
}

export async function verifyUserCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const user = await findUserByUsername(username);
  if (!user) return false;
  return verifyPassword(password, user.passwordHash);
}

export async function getPrimaryUser(): Promise<StoredUser | null> {
  const users = await readUsers();
  return users.find((user) => user.username.toLowerCase() === DEFAULT_USERNAME) ?? users[0] ?? null;
}

export async function updatePrimaryUserAccount(updates: {
  username?: string;
  recoveryEmail?: string;
}): Promise<StoredUser> {
  const users = await readUsers();
  const index = users.findIndex((user) => user.username.toLowerCase() === DEFAULT_USERNAME);
  const targetIndex = index === -1 ? 0 : index;

  if (targetIndex === -1 || !users[targetIndex]) {
    throw new Error("No user account found.");
  }

  if (updates.username) {
    const trimmedUsername = updates.username.trim();
    if (!isValidUsername(trimmedUsername)) {
      throw new Error("Username must be 3–32 characters and use letters, numbers, or underscores.");
    }

    const exists = users.some(
      (user, userIndex) =>
        userIndex !== targetIndex &&
        user.username.toLowerCase() === trimmedUsername.toLowerCase()
    );

    if (exists) {
      throw new Error("That username is already taken.");
    }

    users[targetIndex].username = trimmedUsername;
  }

  if (typeof updates.recoveryEmail === "string") {
    users[targetIndex].recoveryEmail = updates.recoveryEmail.trim() || undefined;
  }

  await writeUsers(users);
  return users[targetIndex];
}

export async function updatePrimaryUserPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await getPrimaryUser();
  if (!user) {
    throw new Error("No user account found.");
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new Error("Current password is incorrect.");
  }

  if (!isValidPassword(newPassword)) {
    throw new Error("New password must be at least 6 characters.");
  }

  const users = await readUsers();
  const index = users.findIndex((entry) => entry.id === user.id);
  if (index === -1) {
    throw new Error("No user account found.");
  }

  users[index].passwordHash = await hashPassword(newPassword);
  await writeUsers(users);
}

export async function createUser(username: string, password: string): Promise<StoredUser> {
  const trimmedUsername = username.trim();

  if (!isValidUsername(trimmedUsername)) {
    throw new Error("Username must be 3–32 characters and use letters, numbers, or underscores.");
  }

  if (!isValidPassword(password)) {
    throw new Error("Password must be at least 6 characters.");
  }

  const users = await readUsers();
  const exists = users.some(
    (user) => user.username.toLowerCase() === trimmedUsername.toLowerCase()
  );

  if (exists) {
    throw new Error("That username is already taken. Please choose another.");
  }

  const user: StoredUser = {
    id: `user-${Date.now()}`,
    username: trimmedUsername,
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);
  return user;
}
