import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { magicLinkTokens, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_token", request.url),
    );
  }

  // Find token and ensure not expired
  const magicRecord = await db.query.magicLinkTokens.findFirst({
    where: (t, { and, eq, gt }) =>
      and(eq(t.token, token), gt(t.expiresAt, new Date())),
  });

  if (!magicRecord) {
    return NextResponse.redirect(
      new URL("/login?error=expired_or_invalid_token", request.url),
    );
  }

  const email = magicRecord.email.toLowerCase();

  // Find or create user
  let user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: email.split("@")[0],
        emailVerified: true,
      })
      .returning();
    user = newUser;
  } else if (!user.emailVerified) {
    await db
      .update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, user.id));
  }

  // Delete used magic link token
  await db
    .delete(magicLinkTokens)
    .where(eq(magicLinkTokens.id, magicRecord.id));

  // Check if banned
  if (user.isBanned) {
    return NextResponse.redirect(
      new URL("/login?error=account_banned", request.url),
    );
  }

  // Create session
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    undefined;
  const userAgent = request.headers.get("user-agent") || undefined;

  await createSession(user.id, { ip, userAgent });

  // Redirect to dashboard or returnUrl
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
