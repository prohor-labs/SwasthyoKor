import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { OAuthService } from './oauth.service.js';
import { SessionService } from './session.service.js';
import { SessionGuard } from './guards/session.guard.js';
import { AdminGuard } from './guards/admin.guard.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, OAuthService, SessionService, SessionGuard, AdminGuard],
  exports: [SessionService, SessionGuard, AdminGuard],
})
export class AuthModule {}
