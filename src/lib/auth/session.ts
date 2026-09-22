import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { type Session, sessions, type User, users } from "@/lib/db/schema";

const SESSION_COOKIE = "swasthyokor_session";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

function getExpiresAt(): Date {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function createSession(
  userId: string,
  request?: { ip?: string; userAgent?: string },
): Promise<void> {
  const token = generateToken();
  const expiresAt = getExpiresAt();
  const cookieStore = await cookies();
  const oldToken = cookieStore.get(SESSION_COOKIE)?.value;

  // 1. Clean up expired sessions for this user
  await db
    .delete(sessions)
    .where(
      and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())),
    );

  // 2. Clean up previous session token if present
  if (oldToken) {
    await db.delete(sessions).where(eq(sessions.token, oldToken));
  }

  // 3. Insert new active session
  await db.insert(sessions).values({
    userId,
    token,
    ipAddress: request?.ip,
    userAgent: request?.userAgent,
    expiresAt,
  });

  const isHttps =
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://") ?? false;

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && isHttps,
    sameSite: "lax",
    expires: expiresAt,
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
    path: "/",
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const result = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (!result[0]) return null;

  const user = result[0].user;
  if (user.isBanned) return null;

  return user;
}

export async function getCurrentSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  const result = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, new Date())))
    .limit(1);

  return result[0] ?? null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    cookieStore.delete(SESSION_COOKIE);
  }
}
