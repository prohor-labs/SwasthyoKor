import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { AuthenticatedRequest } from './session.guard.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!req.user || !req.user.isAdmin) {
      throw new ForbiddenException('অ্যাক্সেস প্রত্যাখ্যান করা হয়েছে। অ্যাডমিন অনুমতি প্রয়োজন।');
    }
    return true;
  }
}
