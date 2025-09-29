# Faucet Backend - NestJS API

GitHub OAuth authentication API built with NestJS.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp env.example .env
# Edit .env with your GitHub OAuth credentials

# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

## 📡 API Endpoints

- `GET /auth/github` - Get GitHub authorization URL
- `GET /auth/github/callback` - GitHub OAuth callback
- `GET /health` - Server health check

## 🔧 Environment Variables

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## 📦 Deployment

This backend can be deployed independently to any Node.js hosting service (Heroku, Railway, Render, etc.).

The server runs on port 4000 by default.
