import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
}

// Temporary in-memory storage
const users: GitHubUser[] = [];

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
        avatar_url: userData.avatar_url,
      };

      // Save user to memory
      await this.saveUser(user);

      console.log('User connected:', user);

      return user;

    } catch (error) {
      console.error('OAuth error:', error);
      throw new InternalServerErrorException('Authentication error');
    }
  }

  private async saveUser(user: GitHubUser): Promise<void> {
    try {
      // Check if user already exists
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      
      if (existingUserIndex !== -1) {
        // Update existing user
        users[existingUserIndex] = user;
        console.log('User updated in memory:', user.login);
      } else {
        // Create new user
        users.push(user);
        console.log('New user saved to memory:', user.login);
      }
    } catch (error) {
      console.error('Error saving user to memory:', error);
      throw new InternalServerErrorException('Failed to save user');
    }
  }

  async getAllUsers(): Promise<GitHubUser[]> {
    try {
      return users;
    } catch (error) {
      console.error('Error fetching users from memory:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  getHealthStatus(): { status: string; message: string } {
    return { status: 'OK', message: 'OAuth server running (memory storage)' };
  }
}
