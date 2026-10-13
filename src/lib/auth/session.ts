import { randomBytes } from "node:crypto";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "../db";
import { sessions, type User, users } from "../db/schema";

export const SESSION_COOKIE = "swasthyokor_session";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function generateToken(): string {
  return randomBytes(48).toString("hex");
}

export async function createSession(
  userId: string,
  requestMeta?: { ip?: string; userAgent?: string; oldToken?: string },
): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Clean up expired sessions for this user
  await db
    .delete(sessions)
    .where(
      and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())),
    );

  // Clean up previous session token if present
  if (requestMeta?.oldToken) {
    await db.delete(sessions).where(eq(sessions.token, requestMeta.oldToken));
  }

  // Insert new active session
  await db.insert(sessions).values({
    userId,
    token,
    ipAddress: requestMeta?.ip,
    userAgent: requestMeta?.userAgent,
    expiresAt,
  });

  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === "production";

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    expires: expiresAt,
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });

  return token;
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
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
});

export async function deleteCurrentSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
  }
  cookieStore.delete(SESSION_COOKIE);
}
