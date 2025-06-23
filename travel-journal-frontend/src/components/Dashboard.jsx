import { useState, useEffect } from 'react';
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
        headers: { Authorization: `Bearer ${token}` },
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

  const handleNewEntry = (newEntry) => {
    setEntries(prev => [newEntry, ...prev]);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`http://localhost:5000/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEntries(entries.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Travel Journal</h2>
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>

      <EntryForm token={token} onSuccess={handleNewEntry} />

      {loading && <p>Loading…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {entries.map((entry) => (
        <div key={entry._id} className="border p-4 my-4 rounded relative">
          <button
            onClick={() => handleDelete(entry._id)}
            className="absolute top-1 right-2 text-red-500"
            title="Delete entry"
          >
            ✕
          </button>
          <h3 className="font-bold">{entry.title}</h3>
          <p>{entry.content}</p>
          <p className="text-sm text-gray-600">{new Date(entry.date).toLocaleDateString()}</p>
          {entry.location && <p className="text-sm">📍 {entry.location}</p>}
          {entry.imageUrl && (
            <img
              src={entry.imageUrl}
              alt=""
              className="mt-2 max-h-60 object-cover"
              loading="lazy"
            />
          )}
        </div>
      ))}
    </div>
  );
}
