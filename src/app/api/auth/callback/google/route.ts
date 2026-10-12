import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { createSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { accounts, users } from "@/lib/db/schema";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  let callbackUrl = "/dashboard";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf-8"));
      if (decoded.callbackUrl) callbackUrl = decoded.callbackUrl;
    } catch {
      // Ignore malformed state
    }
  }

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error || "google_cancelled")}`, req.url),
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", req.url),
    );
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/callback/google`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(
        new URL("/login?error=google_token_error", req.url),
      );
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const userRes = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );

    if (!userRes.ok) {
      return NextResponse.redirect(
        new URL("/login?error=google_profile_error", req.url),
      );
    }

    const userData = (await userRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
      email_verified?: boolean;
    };

    const email = userData.email.toLowerCase();

    let user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      const [newUser] = await db
        .insert(users)
        .values({
          name: userData.name || email.split("@")[0],
          email,
          emailVerified: Boolean(userData.email_verified),
          avatarUrl: userData.picture,
        })
        .returning();
      user = newUser;
    }

    if (user.isBanned) {
      return NextResponse.redirect(
        new URL("/login?error=account_suspended", req.url),
      );
    }

    const existingAccount = await db.query.accounts.findFirst({
      where: and(eq(accounts.userId, user.id), eq(accounts.provider, "google")),
    });

    if (!existingAccount) {
      await db.insert(accounts).values({
        userId: user.id,
        provider: "google",
        providerAccountId: userData.sub,
      });
    }

    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;

    await createSession(user.id, {
      ip: rawIp,
      userAgent,
    });

    const destination = callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    return NextResponse.redirect(new URL(destination, req.url));
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/login?error=google_server_error", req.url),
    );
  }
}
