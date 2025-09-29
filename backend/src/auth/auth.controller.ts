import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService, GitHubUser } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('github')
  getGitHubAuth() {
    return this.authService.getGitHubAuthUrl();
  }

  @Get('github/callback')
  async handleGitHubCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    try {
      const user: GitHubUser = await this.authService.handleGitHubCallback(code);
      
      // Redirect to frontend with user data
      const redirectUrl = `http://localhost:3000?user=${encodeURIComponent(JSON.stringify(user))}`;
      res.redirect(redirectUrl);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}