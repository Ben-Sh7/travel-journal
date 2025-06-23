import './App.css';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';

function App() {
  const [token, setTokenState] = useState(null);
  const [mode, setMode] = useState('login');

  const setToken = newToken => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  };

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) setTokenState(saved);
  }, []);

  const handleLogout = () => setToken(null);

  if (!token) {
    return (
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setMode('login')} className={mode === 'login' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>Login</button>
          <button onClick={() => setMode('signup')} className={mode === 'signup' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>Signup</button>
        </div>
        {mode === 'login' ? <Login onLogin={setToken} /> : <Signup />}
      </div>
    );
  }

  return <Dashboard token={token} onLogout={handleLogout} />;
}

export default App;
