import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(
      new URL("/login?error=google_not_configured", req.url),
    );
  }

  const searchParams = req.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Compute base URL for redirect URI
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/callback/google`;

  const state = Buffer.from(JSON.stringify({ callbackUrl })).toString("base64");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
