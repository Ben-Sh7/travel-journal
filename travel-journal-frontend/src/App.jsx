import './App.css';
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const [token, setTokenState] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const setToken = newToken => {
    setTokenState(newToken);
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  };

  useEffect(() => {
    const saved = localStorage.getItem('token');
    if (saved) setTokenState(saved);
  }, []);

  const handleLogout = () => {
    setToken(null);
    navigate('/login');
  };

  // ניווט אוטומטי לפי סטטוס התחברות
  useEffect(() => {
    if (!token && location.pathname !== '/signup') navigate('/login');
    if (token && location.pathname !== '/dashboard') navigate('/dashboard');
  }, [token, location.pathname, navigate]);

  return <Outlet context={{ token, setToken, handleLogout }} />;
}

export default App;
