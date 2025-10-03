import React, { useState, useEffect } from 'react';
import './styles.css';

interface User {
  id: number;
  login: string;
  email: string;
  avatar_url?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [ethAddress, setEthAddress] = useState('');
  const [claiming, setClaiming] = useState(false);

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
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setEthAddress('');
  };

  const handleGetTokens = async () => {
    if (!ethAddress.trim()) {
      alert('Please enter your Ethereum address');
      return;
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(ethAddress.trim())) {
      alert('Please enter a valid Ethereum address');
      return;
    }

    setClaiming(true);
    
    try {
      // Here you would call your faucet API
      // For now, just simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Tokens sent to ${ethAddress}! Check your wallet in a few minutes.`);
      setEthAddress('');
    } catch (error) {
      console.error('Error claiming tokens:', error);
      alert('Error claiming tokens. Please try again.');
    } finally {
      setClaiming(false);
    }
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
            </button>
          </div>
        ) : (
          <div className="user-section">
            <div className="user-header">
              <div className="user-profile">
                <img 
                  src={user.avatar_url || `https://github.com/${user.login}.png`} 
                  alt={user.login}
                  className="user-avatar"
                />
                <span className="username">{user.login}</span>
              </div>
              <button className="logout-button" onClick={handleLogout}>
                Sign out
              </button>
            </div>
            
            <div className="faucet-section">
              <div className="input-group">
                <label htmlFor="ethAddress">Your Ethereum Address:</label>
                <input
                  id="ethAddress"
                  type="text"
                  value={ethAddress}
                  onChange={(e) => setEthAddress(e.target.value)}
                  placeholder="0x..."
                  className="eth-input"
                  disabled={claiming}
                />
              </div>
              <button 
                className="get-tokens-button"
                onClick={handleGetTokens}
                disabled={claiming || !ethAddress.trim()}
              >
                {claiming ? 'Sending Tokens...' : 'Get Tokens'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;