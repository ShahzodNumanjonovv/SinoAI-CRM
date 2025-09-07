import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";

const COOKIE = "session";
const DAYS = 7;

export function setSession(userId: string) {
  const token = randomBytes(24).toString("hex");
  const value = `${userId}.${token}`;
  cookies().set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * DAYS
  });
  return value;
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export function getUserId(): string | null {
  const c = cookies().get(COOKIE)?.value;
  if (!c) return null;
  return c.split(".")[0] || null;
}

export function hashPassword(pw: string) {
  return createHash("sha256").update(pw + process.env.SESSION_SECRET).digest("hex");
}