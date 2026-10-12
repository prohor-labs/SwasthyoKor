import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { accounts, users } from '../drizzle/schema.js';
import { SessionService, SESSION_COOKIE } from './session.service.js';

interface OAuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {}

  getRedirectUri(): string {
    const serverUrl = this.configService.get<string>('SERVER_URL') || 'http://localhost:3001';
    return `${serverUrl.replace(/\/$/, '')}/api/auth/callback/google`;
  }

  getGoogleAuthUrl(state: string): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new InternalServerErrorException('GOOGLE_CLIENT_ID is not configured');
    }

    const redirectUri = this.getRedirectUri();
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async exchangeGoogleCode(code: string): Promise<OAuthUserProfile> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException('Google OAuth credentials are not configured');
    }

    const redirectUri = this.getRedirectUri();
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      throw new BadRequestException(`Google token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenRes.json()) as { access_token: string };
    const userRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userRes.ok) {
      throw new BadRequestException('Failed to fetch Google user info');
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
      name: userData.name || userData.email.split('@')[0],
      avatarUrl: userData.picture,
    };
  }

  async handleGoogleCallback(code: string, req: Request, res: Response): Promise<void> {
    const profile = await this.exchangeGoogleCode(code);

    let user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, profile.email),
    });

    if (!user) {
      const [newUser] = await this.drizzle.db
        .insert(users)
        .values({
          name: profile.name,
          email: profile.email,
          emailVerified: true,
          avatarUrl: profile.avatarUrl,
        })
        .returning();
      user = newUser;
    }

    const existingAccount = await this.drizzle.db.query.accounts.findFirst({
      where: and(eq(accounts.userId, user.id), eq(accounts.provider, 'google')),
    });

    if (!existingAccount) {
      await this.drizzle.db.insert(accounts).values({
        userId: user.id,
        provider: 'google',
        providerAccountId: profile.id,
      });
    }

    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    const meta = {
      ip: rawIp ? rawIp.replace(/^::ffff:/, '') : undefined,
      userAgent: req.headers['user-agent'],
      oldToken: req.cookies?.[SESSION_COOKIE],
    };

    await this.sessionService.createSession(user.id, res, meta);

    const clientUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    res.redirect(`${clientUrl}/dashboard`);
  }
}
