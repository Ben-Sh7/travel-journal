import React, { useState, useEffect } from 'react';
import EntryForm from './EntryForm';

export default function Dashboard({ token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/entries', {
        headers: {
          Authorization: 'Bearer ' + token,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch entries');
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // כשנוספת רשומה חדשה - מוסיפים אותה למערך
  const handleNewEntry = (newEntry) => {
    setEntries((prevEntries) => [newEntry, ...prevEntries]);
  };

  // כשלוחצים Logout
  const handleLogout = () => {
    if (onLogout) onLogout();
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {/* קומפוננטת הטופס */}
      <EntryForm token={token} onSuccess={handleNewEntry} />

      {loading && <p>Loading entries...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {entries.map((entry) => (
          <li key={entry._id} style={{ marginBottom: 20 }}>
            <h3>{entry.title}</h3>
            <p>{entry.content}</p>
            <p><em>{new Date(entry.date).toLocaleDateString()}</em></p>
            {entry.location && <p>Location: {entry.location}</p>}
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt={entry.title}
                style={{ maxWidth: 300, maxHeight: 200, objectFit: 'cover' }}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
