import { Routes, Route, useNavigate, Navigate, Link, useLocation, useParams } from 'react-router-dom';
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
      <Route path="/trips/:tripId" element={
        token ? <TripLoader token={token} trip={trip} setTrip={setTrip} onLogout={handleLogout} /> : <Navigate to="/login" />
      } />
      <Route path="*" element={<Navigate to={token ? '/trips' : '/login'} />} />
    </Routes>
  );

}

// קומפוננטה חדשה: טוענת trip לפי tripId מה-URL אם צריך
function TripLoader({ token, trip, setTrip, onLogout }) {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip && trip._id === tripId) return;
    if (!tripId) return;
    setLoading(true);
    fetch(`http://localhost:5000/trips`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find(t => t._id === tripId) : null;
        if (found) setTrip(found);
        else setError('Trip not found');
      })
      .catch(() => setError('Failed to load trip'))
      .finally(() => setLoading(false));
  }, [tripId, trip, setTrip, token]);

  if (loading) return <div className="text-center mt-10">Loading trip…</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;
  if (!trip || trip._id !== tripId) return null;
  return <Dashboard token={token} trip={trip} onLogout={onLogout} onBack={() => { setTrip(null); navigate('/trips'); }} />;
}

export default App;
