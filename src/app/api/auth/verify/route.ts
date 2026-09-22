import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { accounts, magicLinkTokens, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=Invalid+token", origin));
  }

  const record = await db.query.magicLinkTokens.findFirst({
    where: eq(magicLinkTokens.token, token),
  });

  if (!record || record.expiresAt < new Date()) {
    return NextResponse.redirect(
      new URL("/login?error=লিংকটির+মেয়াদ+শেষ+হয়ে+গেছে।", origin),
    );
  }

  // Delete used token
  await db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));

  // Find or create user
  let user = await db.query.users.findFirst({
    where: eq(users.email, record.email),
  });

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        name: record.email.split("@")[0],
        email: record.email,
        emailVerified: true,
      })
      .returning();

    if (!newUser) {
      return NextResponse.redirect(
        new URL("/login?error=অ্যাকাউন্ট+তৈরি+ব্যর্থ+হয়েছে", origin),
      );
    }

    user = newUser;

    await db.insert(accounts).values({
      userId: user.id,
      provider: "email",
      providerUsername: record.email,
    });
  }

  if (user.isBanned) {
    return NextResponse.redirect(
      new URL("/login?error=Account+is+banned", origin),
    );
  }

  const headersList = await headers();
  const rawIp =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headersList.get("x-real-ip") ??
    undefined;
  const ip = rawIp ? rawIp.replace(/^::ffff:/, "") : undefined;
  const userAgent = headersList.get("user-agent") ?? undefined;
  const meta = { ip, userAgent };

  await createSession(user.id, meta);

  return NextResponse.redirect(new URL("/dashboard", origin));
}
