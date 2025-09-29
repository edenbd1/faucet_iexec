import React, { useState, useEffect } from 'react';
import './styles.css';

interface User {
  id: number;
  login: string;
  email: string;
  timestamp: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user is returning from OAuth with data
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setUser(userData);
        
        // Clean up the URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleGitHubLogin = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/auth/github');
      const data = await response.json();
      
      if (data.authUrl) {
        // Rediriger vers GitHub pour l'authentification
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="app">
      <div className="container">
        <h1>Faucet App</h1>
        
        {!user ? (
          <div className="login-section">
            <p>Connect with your GitHub account to continue</p>
            <button 
              className="github-button" 
              onClick={handleGitHubLogin}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect with GitHub'}
              <svg className="github-icon" viewBox="0 0 16 16" width="20" height="20">
                <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="user-section">
            <h2>Bienvenue, {user.login}!</h2>
            <div className="user-info">
              <div className="user-detail">
                <strong>ID:</strong> {user.id}
              </div>
              <div className="user-detail">
                <strong>Nom d'utilisateur:</strong> {user.login}
              </div>
              <div className="user-detail">
                <strong>Email:</strong> {user.email || 'Not available'}
              </div>
              <div className="user-detail">
                <strong>Connecté le:</strong> {new Date(user.timestamp).toLocaleString('fr-FR')}
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
