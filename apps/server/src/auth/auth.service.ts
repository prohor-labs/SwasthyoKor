import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import { and, eq, gt } from 'drizzle-orm';
import type { Request, Response } from 'express';
import { DrizzleService } from '../drizzle/drizzle.service.js';
import { accounts, magicLinkTokens, users, type User } from '../drizzle/schema.js';
import { MailService } from '../mail/mail.service.js';
import { SessionService, SESSION_COOKIE } from './session.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly sessionService: SessionService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private getRequestMeta(req: Request) {
    const rawIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress;
    return {
      ip: rawIp ? rawIp.replace(/^::ffff:/, '') : undefined,
      userAgent: req.headers['user-agent'],
      oldToken: req.cookies?.[SESSION_COOKIE],
    };
  }

  async requestMagicLink(emailInput: string): Promise<{ success: boolean; message: string }> {
    const email = emailInput?.toLowerCase().trim();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('একটি বৈধ ইমেইল ঠিকানা দিন।');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.drizzle.db.delete(magicLinkTokens).where(eq(magicLinkTokens.email, email));
    await this.drizzle.db.insert(magicLinkTokens).values({ email, token, expiresAt });

    const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const result = await this.mailService.sendMagicLinkEmail({ to: email, token, appUrl });

    if (!result.success) {
      await this.drizzle.db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));
      throw new BadRequestException(result.error || 'ইমেইল পাঠাতে সমস্যা হয়েছে।');
    }

    return {
      success: true,
      message: 'ম্যাজিক লিংক পাঠানো হয়েছে! আপনার ইমেইল ইনবক্স চেক করুন।',
    };
  }

  async verifyMagicLink(token: string, req: Request, res: Response): Promise<{ success: boolean; user: User }> {
    if (!token) {
      throw new BadRequestException('টোকেন প্রয়োজন।');
    }

    const record = await this.drizzle.db.query.magicLinkTokens.findFirst({
      where: and(eq(magicLinkTokens.token, token), gt(magicLinkTokens.expiresAt, new Date())),
    });

    if (!record) {
      throw new BadRequestException('মেয়াদোত্তীর্ণ বা অবৈধ ম্যাজিক লিংক।');
    }

    let user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, record.email),
    });

    if (!user) {
      const [newUser] = await this.drizzle.db
        .insert(users)
        .values({
          name: record.email.split('@')[0],
          email: record.email,
          emailVerified: true,
        })
        .returning();
      user = newUser;
    }

    if (user.isBanned) {
      throw new UnauthorizedException('আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।');
    }

    await this.drizzle.db.delete(magicLinkTokens).where(eq(magicLinkTokens.token, token));

    const meta = this.getRequestMeta(req);
    await this.sessionService.createSession(user.id, res, meta);

    return { success: true, user };
  }

  async loginWithPassword(
    emailInput: string,
    password: string,
    req: Request,
    res: Response,
  ): Promise<{ success: boolean; user: User }> {
    const email = emailInput?.toLowerCase().trim();
    if (!email || !password) {
      throw new BadRequestException('ইমেইল এবং পাসওয়ার্ড আবশ্যক।');
    }

    const user = await this.drizzle.db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new UnauthorizedException('ভুল ইমেইল অথবা পাসওয়ার্ড।');
    }

    if (user.isBanned) {
      throw new UnauthorizedException('আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।');
    }

    const account = await this.drizzle.db.query.accounts.findFirst({
      where: and(eq(accounts.userId, user.id), eq(accounts.provider, 'email')),
    });

    if (!account?.passwordHash) {
      throw new BadRequestException(
        'এই অ্যাকাউন্টের জন্য কোনো পাসওয়ার্ড সেট করা নেই। ম্যাজিক লিংক ব্যবহার করুন।',
      );
    }

    const isValid = await verify(account.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!isValid) {
      throw new UnauthorizedException('ভুল ইমেইল অথবা পাসওয়ার্ড।');
    }

    const meta = this.getRequestMeta(req);
    await this.sessionService.createSession(user.id, res, meta);

    return { success: true, user };
  }

  async logout(req: Request, res: Response): Promise<{ success: boolean }> {
    const token = req.cookies?.[SESSION_COOKIE];
    await this.sessionService.deleteSession(token, res);
    return { success: true };
  }
}
