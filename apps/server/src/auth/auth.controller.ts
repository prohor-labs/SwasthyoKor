import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { OAuthService } from './oauth.service.js';
import { SessionService, SESSION_COOKIE } from './session.service.js';
import { SessionGuard, type AuthenticatedRequest } from './guards/session.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly oauthService: OAuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Get('me')
  async getMe(@Req() req: Request) {
    const token = req.cookies?.[SESSION_COOKIE];
    const user = await this.sessionService.getUserByToken(token);
    if (!user) {
      return { user: null };
    }
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        isAdmin: user.isAdmin,
        phone: user.phone,
      },
    };
  }

  @Post('magic-link')
  async requestMagicLink(@Body('email') email: string) {
    return this.authService.requestMagicLink(email);
  }

  @Get('verify')
  async verifyMagicLink(
    @Query('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.verifyMagicLink(token, req, res);
    const clientUrl = process.env.APP_URL || 'http://localhost:3000';
    return res.redirect(`${clientUrl}/dashboard`);
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') pass: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginWithPassword(email, pass, req, res);
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout(req, res);
  }

  @Get('oauth/google')
  async googleAuth(@Res() res: Response) {
    const state = randomBytes(16).toString('hex');
    const url = this.oauthService.getGoogleAuthUrl(state);
    return res.redirect(url);
  }

  @Get('callback/google')
  async googleCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.oauthService.handleGoogleCallback(code, req, res);
  }
}
