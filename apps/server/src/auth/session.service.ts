import { Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { and, eq, gt, lt } from 'drizzle-orm';
import type { Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { sessions, type Session, users, type User } from '../drizzle/schema.js';

export const SESSION_COOKIE = 'swasthyokor_session';
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

@Injectable()
export class SessionService {
  constructor(private readonly drizzle: DrizzleService) {}

  generateToken(): string {
    return randomBytes(48).toString('hex');
  }

  async createSession(
    userId: string,
    res: Response,
    requestMeta?: { ip?: string; userAgent?: string; oldToken?: string },
  ): Promise<string> {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // Clean up expired sessions for this user
    await this.drizzle.db
      .delete(sessions)
      .where(and(eq(sessions.userId, userId), lt(sessions.expiresAt, new Date())));

    // Clean up previous session token if present
    if (requestMeta?.oldToken) {
      await this.drizzle.db.delete(sessions).where(eq(sessions.token, requestMeta.oldToken));
    }

    // Insert new active session
    await this.drizzle.db.insert(sessions).values({
      userId,
      token,
      ipAddress: requestMeta?.ip,
      userAgent: requestMeta?.userAgent,
      expiresAt,
    });

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: expiresAt,
      maxAge: SESSION_DURATION_MS,
      path: '/',
    });

    return token;
  }

  async getUserByToken(token?: string): Promise<User | null> {
    if (!token) return null;

    const result = await this.drizzle.db
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

  async deleteSession(token?: string, res?: Response): Promise<void> {
    if (token) {
      await this.drizzle.db.delete(sessions).where(eq(sessions.token, token));
    }
    if (res) {
      res.clearCookie(SESSION_COOKIE, { path: '/' });
    }
  }
}
