import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 4000;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  console.error('Environment variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required');
  process.exit(1);
}

// Route to initiate GitHub OAuth
app.get('/auth/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user:email`;
  res.json({ authUrl: githubAuthUrl });
});

// GitHub OAuth callback route
app.get('/auth/github/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Missing code' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json() as any;
    
    if (tokenData.error) {
      throw new Error(tokenData.error_description);
    }

    const accessToken = tokenData.access_token;

    // Get user information
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'faucet-app',
      },
    });

    const userData = await userResponse.json() as any;

    // Get email (may be private)
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `token ${accessToken}`,
        'User-Agent': 'faucet-app',
      },
    });

    const emailData = await emailResponse.json() as any;
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || userData.email;

    const user = {
      id: userData.id,
      login: userData.login,
      email: primaryEmail,
      timestamp: new Date().toISOString(),
    };

    // Save user to users.txt
    const usersFilePath = path.join(__dirname, 'users.txt');
    const userLine = JSON.stringify(user) + '\n';
    
    fs.appendFileSync(usersFilePath, userLine);

    console.log('User connected:', user);

    // Redirect to frontend with user data
    const redirectUrl = `http://localhost:3000?user=${encodeURIComponent(JSON.stringify(user))}`;
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
});

// Route to check server status
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'OAuth server running' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});