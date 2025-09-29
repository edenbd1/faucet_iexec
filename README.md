# Faucet - GitHub OAuth Application

A complete GitHub OAuth application with separate backend and frontend for independent deployment.

## 🏗 Architecture

```
faucet/
├── backend/     # NestJS API (deployable separately)
└── frontend/    # React App (deployable separately)
```

## 🚀 Quick Start

### Backend (NestJS API)
```bash
cd backend
npm install
cp env.example .env  # Configure your GitHub OAuth credentials
npm run start:dev
```

### Frontend (React App)
```bash
cd frontend
npm install
npm start
```

## 🔧 GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App with:
   - **Homepage URL**: `http://localhost:3000`
   - **Callback URL**: `http://localhost:4000/auth/github/callback`
3. Copy your Client ID and Secret to `backend/.env`

## 📦 Deployment

Each application can be deployed independently:

- **Backend**: Deploy to Heroku, Railway, Render, etc.
- **Frontend**: Deploy to Vercel, Netlify, GitHub Pages, etc.

See individual README files in each directory for deployment instructions.