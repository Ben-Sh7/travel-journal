import './App.css';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setTokenState] = useState(null);
  const [mode, setMode] = useState('login');

  // עטיפה של setToken ששומרת ל-localStorage
  const setToken = (newToken) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('token', newToken);
    } else {
      localStorage.removeItem('token');
    }
  };

  // בטעינת העמוד – ננסה לשלוף טוקן מה־localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setTokenState(savedToken);
    }
  }, []);

  const handleLogout = () => {
    setToken(null);
    setMode('login');
  };

  if (!token) {
    return (
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`px-4 py-2 rounded ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Login
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`px-4 py-2 rounded ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Signup
          </button>
        </div>
        {mode === 'login' ? <Login onLogin={setToken} /> : <Signup />}
      </div>
    );
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;
