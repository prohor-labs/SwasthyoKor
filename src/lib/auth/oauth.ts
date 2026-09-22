import "server-only";

export interface OAuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export function getOAuthRedirectUri(origin?: string): string {
  const base =
    origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/api/auth/callback/google`;
}

export function getGoogleAuthUrl(state: string, redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not configured");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<OAuthUserProfile> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials are not configured");
  }

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
    const errText = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${errText}`);
  }

  const tokenData = (await tokenRes.json()) as { access_token: string };

  const userRes = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    },
  );

  if (!userRes.ok) {
    throw new Error("Failed to fetch Google user info");
  }

  const userData = (await userRes.json()) as {
    sub: string;
    email: string;
    name?: string;
    picture?: string;
  };

  return {
    id: userData.sub,
    email: userData.email.toLowerCase(),
    name: userData.name || userData.email.split("@")[0],
    avatarUrl: userData.picture,
  };
}
