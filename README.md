# Faucet - GitHub OAuth Application

A complete application with GitHub OAuth authentication, including a React frontend and Node.js/Express backend.

## 🎯 Features

- **React Frontend**: Modern interface with GitHub login button
- **Node.js/Express Backend**: Complete GitHub OAuth flow management
- **User Storage**: User data is saved in `users.txt`
- **Responsive Interface**: Modern and adaptive design

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A configured GitHub OAuth application

## 🔧 GitHub OAuth Configuration

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "New OAuth App"
3. Configure your application:
   - **Application name**: Faucet App (or your preferred name)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:4000/auth/github/callback`
4. Note your `Client ID` and `Client Secret`

## 🚀 Installation and Startup

### 1. Install dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm run install-frontend
```

### 2. Environment variables configuration

```bash
# Copy the example file
cp env.example .env

# Edit the .env file with your real GitHub values
# GITHUB_CLIENT_ID=your_github_client_id
# GITHUB_CLIENT_SECRET=your_github_client_secret
```

**⚠️ IMPORTANT**: The server will not start without these environment variables configured.

### 3. Start the application

#### Option 1: Automatic startup (recommended)
```bash
npm run dev
```
This command automatically starts both backend and frontend.

#### Option 2: Manual startup
```bash
# Terminal 1 - Backend (port 4000)
npm run server

# Terminal 2 - Frontend (port 3000)  
cd frontend
npm start
```

### 4. Access the application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000

## 📁 Project Structure

```
faucet/
├── server.ts              # Express backend server
├── package.json           # Backend dependencies
├── tsconfig.json          # Backend TypeScript configuration
├── env.example            # Environment variables template
├── users.txt              # User backup file (created automatically)
├── README.md              # This file
└── frontend/              # React application
    ├── package.json       # Frontend dependencies
    ├── tsconfig.json      # Frontend TypeScript configuration
    ├── public/
    │   └── index.html     # HTML template
    └── src/
        ├── index.tsx      # React entry point
        ├── App.tsx        # Main component
        └── styles.css     # Application styles
```

## 🔄 Authentication Flow

1. User clicks "Connect with GitHub"
2. Redirect to GitHub for authorization
3. GitHub redirects to `/auth/github/callback` with a code
4. Backend exchanges the code for an access token
5. Retrieve user information (id, login, email)
6. Save to `users.txt` (JSON format, one line per user)
7. Redirect to frontend with user data
8. Display user information

## 📊 User Data Format

Data is saved in `users.txt` in JSON format, one line per user:

```json
{"id":12345678,"login":"username","email":"user@example.com","timestamp":"2025-09-23T10:30:00.000Z"}
```

## 🛠 Available Scripts

### Backend
- `npm run server`: Start the backend server
- `npm run server:watch`: Start the server with automatic reload
- `npm run build`: Compile TypeScript to JavaScript

### Frontend  
- `cd frontend && npm start`: Start the React development server
- `cd frontend && npm run build`: Production build
- `cd frontend && npm test`: Run tests

### Combined
- `npm run dev`: Start backend and frontend simultaneously

## 🔍 API Endpoints

- `GET /auth/github`: Get GitHub authorization URL
- `GET /auth/github/callback`: GitHub OAuth callback
- `GET /health`: Server status check

## 🎨 User Interface

- **Login page**: Clean interface with styled GitHub button
- **User page**: Display information (ID, login, email, timestamp)
- **Responsive design**: Mobile and desktop compatible
- **Animations**: Smooth transitions and visual feedback

## 🐛 Troubleshooting

### Error "Environment variables GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are required"
```bash
# 1. Check that the .env file exists
ls -la .env

# 2. If the file doesn't exist, create it
cp env.example .env

# 3. Edit .env with your real GitHub values
```

### Server won't start
- Check that environment variables are correctly configured
- Make sure ports 3000 and 4000 are free
- Try restarting with `npm run dev`

### GitHub authentication error
- Check your `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in the .env file
- Make sure the callback URL is exactly: `http://localhost:4000/auth/github/callback`
- Verify that your GitHub app is properly configured

### CORS issue
- The backend is configured to accept requests from `http://localhost:3000`
- Check that the frontend is running on this port

### Error "create-react-app is deprecated"
- This is normal, the project uses a custom structure
- Ignore deprecation warnings during installation

## 📝 Logs

- User connections are logged in the server console
- User data is automatically added to `users.txt`

## 🔒 Security

- GitHub secrets are never exposed on the client side
- Use of environment variables for sensitive data
- OAuth parameter validation on the server side

---

Created with ❤️ for GitHub OAuth authentication