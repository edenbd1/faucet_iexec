import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { User, UserDocument } from '../schemas/user.schema';

export interface GitHubUser {
  id: number;
  login: string;
  email: string;
  avatar_url: string;
}

@Injectable()
export class AuthService {
  private readonly githubClientId: string;
  private readonly githubClientSecret: string;

  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
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
      const existingUser = await this.userModel.findOne({ githubId: user.id });

      if (existingUser) {
        // Update existing user
        await this.userModel.updateOne(
          { githubId: user.id },
          {
            login: user.login,
            email: user.email,
            avatar_url: user.avatar_url,
          }
        );
        console.log('User updated in MongoDB:', user.login);
      } else {
        // Create new user
        const newUser = new this.userModel({
          githubId: user.id,
          login: user.login,
          email: user.email,
          avatar_url: user.avatar_url,
        });
        await newUser.save();
        console.log('New user saved to MongoDB:', user.login);
      }
    } catch (error) {
      console.error('Error saving user to MongoDB:', error);
      throw new InternalServerErrorException('Failed to save user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await this.userModel.find().exec();
    } catch (error) {
      console.error('Error fetching users from MongoDB:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async claimTokens(ethAddress: string, userId?: number): Promise<{ success: boolean; message: string }> {
    if (!ethAddress.trim()) {
      throw new BadRequestException('Ethereum address is required');
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(ethAddress.trim())) {
      throw new BadRequestException('Invalid Ethereum address format');
    }

    try {
      const cleanAddress = ethAddress.trim();

      if (userId) {
        // Update user's Ethereum address and last claimed timestamp
        await this.userModel.updateOne(
          { githubId: userId },
          {
            eth_address: cleanAddress,
            last_claimed: new Date(),
          }
        );
      }

      // Here you would implement the actual token claiming logic
      // For now, just simulate success
      console.log(`Tokens claimed for address: ${cleanAddress}`);

      return {
        success: true,
        message: 'Tokens claimed successfully'
      };
    } catch (error) {
      console.error('Error claiming tokens:', error);
      throw new InternalServerErrorException('Failed to claim tokens');
    }
  }

  getHealthStatus(): { status: string; message: string } {
    return { status: 'OK', message: 'OAuth server running with MongoDB' };
  }
}
