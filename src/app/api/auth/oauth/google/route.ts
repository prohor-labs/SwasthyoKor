import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { getGoogleAuthUrl, getOAuthRedirectUri } from "@/lib/auth/oauth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const state = randomBytes(32).toString("hex");
  const origin = request.nextUrl.origin;
  const redirectUri = getOAuthRedirectUri(origin);

  let authUrl = "";
  try {
    authUrl = getGoogleAuthUrl(state, redirectUri);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "OAuth configuration error";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(message)}`, origin),
    );
  }

  const cookieStore = await cookies();
  const isHttps = origin.startsWith("https://");

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && isHttps,
    sameSite: "lax" as const,
    maxAge: 600, // 10 minutes
    path: "/",
  };

  cookieStore.set("oauth_state", state, cookieOptions);
  cookieStore.set("oauth_callback_url", callbackUrl, cookieOptions);

  return NextResponse.redirect(authUrl);
}
