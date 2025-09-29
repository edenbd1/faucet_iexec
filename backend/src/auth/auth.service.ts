import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  timestamp: string;
}

@Injectable()
export class AuthService {
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;

  constructor(private configService: ConfigService) {
    this.githubClientId = this.configService.get<string>('GITHUB_CLIENT_ID') || '';
    this.githubClientSecret = this.configService.get<string>('GITHUB_CLIENT_SECRET') || '';

    if (!this.githubClientId || !this.githubClientSecret) {
      throw new Error('Environment variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
    }
  }

  getGitHubAuthUrl(): { authUrl: string } {
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${this.githubClientId}&scope=user:email`;
    return { authUrl };
  }

  async handleGitHubCallback(code: string): Promise<GitHubUser> {
    if (!code) {
      throw new BadRequestException('Missing code');
    }

    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: this.githubClientId,
        client_secret: this.githubClientSecret,
        code: code,
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const tokenData = tokenResponse.data;
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }

      const accessToken = tokenData.access_token;

      // Get user information
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'faucet-app',
        },
      });

      const userData = userResponse.data;

      // Get email (may be private)
      const emailResponse = await axios.get('https://api.github.com/user/emails', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'User-Agent': 'faucet-app',
        },
      });

      const emailData = emailResponse.data;
      const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;

      const user: GitHubUser = {
        id: userData.id,
        login: userData.login,
        email: primaryEmail,
        timestamp: new Date().toISOString(),
      };

      // Save user to users.txt
      await this.saveUser(user);

      console.log('User connected:', user);

      return user;

    } catch (error) {
      console.error('OAuth error:', error);
      throw new InternalServerErrorException('Authentication error');
    }
  }

  private async saveUser(user: GitHubUser): Promise<void> {
    const usersFilePath = path.join(process.cwd(), 'users.txt');
    const userLine = JSON.stringify(user) + '\n';
    
    fs.appendFileSync(usersFilePath, userLine);
  }

  getHealthStatus(): { status: string; message: string } {
    return { status: 'OK', message: 'OAuth server running' };
  }
}