import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SessionService, SESSION_COOKIE } from '../session.service.js';
import type { User } from '../../drizzle/schema.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = req.cookies?.[SESSION_COOKIE];

    if (!token) {
      throw new UnauthorizedException('অননুমোদিত অনুরোধ। অনুগ্রহ করে লগইন করুন।');
    }

    const user = await this.sessionService.getUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('সেশন শেষ হয়েছে অথবা ভুল সেশন।');
    }

    req.user = user;
    return true;
  }
}
