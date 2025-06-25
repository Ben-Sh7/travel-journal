import { Routes, Route, useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Trips from './components/Trips';
import './App.css';

function App() {
  const [token, setTokenState] = useState(null);
  const [trip, setTrip] = useState(null);
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
    setTrip(null);
    navigate('/login');
  };

  // כפתורי מעבר בין התחברות/הרשמה בראש הדף
  const AuthNav = () => (
    <div className="flex gap-4 mb-6 justify-center mt-8">
      <Link to="/login" className={location.pathname === '/login' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>Login</Link>
      <Link to="/signup" className={location.pathname === '/signup' ? 'bg-blue-600 text-white px-4 py-2 rounded' : 'bg-gray-200 px-4 py-2 rounded'}>Signup</Link>
    </div>
  );

  return (
    <Routes>
      <Route path="/login" element={
        <>
          <AuthNav />
          <Login onLogin={token => { setToken(token); navigate('/trips'); }} />
        </>
      } />
      <Route path="/signup" element={
        <>
          <AuthNav />
          <Signup />
        </>
      } />
      <Route path="/trips" element={token ? <Trips token={token} onSelectTrip={trip => { setTrip(trip); navigate(`/trips/${trip._id}`); }} onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/trips/:tripId" element={token && trip ? <Dashboard token={token} trip={trip} onLogout={handleLogout} onBack={() => { setTrip(null); navigate('/trips'); }} /> : <Navigate to="/trips" />} />
      <Route path="*" element={<Navigate to={token ? '/trips' : '/login'} />} />
    </Routes>
  );
}

export default App;
