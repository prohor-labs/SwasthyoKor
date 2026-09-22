import { and, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { exchangeGoogleCode, getOAuthRedirectUri } from "@/lib/auth/oauth";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const cookieStore = await cookies();
  const savedState = cookieStore.get("oauth_state")?.value;
  const callbackUrl =
    cookieStore.get("oauth_callback_url")?.value || "/dashboard";

  // Clean up state cookies
  cookieStore.delete("oauth_state");
  cookieStore.delete("oauth_callback_url");

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(error || "Google login cancelled")}`,
        origin,
      ),
    );
  }

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid+OAuth+state", origin),
    );
  }

  const redirectUri = getOAuthRedirectUri(origin);

  let profile: Awaited<ReturnType<typeof exchangeGoogleCode>> | null = null;
  try {
    profile = await exchangeGoogleCode(code, redirectUri);
  } catch (err: unknown) {
    console.error("Google OAuth token exchange error:", err);
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent("Google authentication failed. Please try again.")}`,
        origin,
      ),
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

  // 1. Check if an account exists for provider = 'google' and providerAccountId
  const account = await db.query.accounts.findFirst({
    where: and(
      eq(accounts.provider, "google"),
      eq(accounts.providerAccountId, profile.id),
    ),
  });

  let user = null;

  if (account) {
    user = await db.query.users.findFirst({
      where: eq(users.id, account.userId),
    });
  }

  // 2. If no account found, find user by email
  if (!user && profile.email) {
    user = await db.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    if (user) {
      // Link Google account to this user
      await db.insert(accounts).values({
        userId: user.id,
        provider: "google",
        providerAccountId: profile.id,
        providerUsername: profile.email || profile.name,
      });
    }
  }

  // 3. If user still does not exist, create new user and Google account
  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        name: profile.name,
        email: profile.email,
        avatarUrl: profile.avatarUrl,
        emailVerified: true,
      })
      .returning();

    if (!newUser) {
      return NextResponse.redirect(
        new URL("/login?error=Could+not+create+user", origin),
      );
    }

    user = newUser;

    await db.insert(accounts).values({
      userId: user.id,
      provider: "google",
      providerAccountId: profile.id,
      providerUsername: profile.email || profile.name,
    });
  }

  if (user.isBanned) {
    return NextResponse.redirect(
      new URL("/login?error=Account+is+banned", origin),
    );
  }

  // Create session
  await createSession(user.id, meta);

  const destUrl = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
  return NextResponse.redirect(new URL(destUrl, origin));
}
