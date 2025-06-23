import React, { useState, useEffect } from 'react';
import EntryForm from './EntryForm';

export default function Dashboard({ token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/entries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEntries(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) load(); }, [token]);

  const add = newEntry => setEntries(prev => [newEntry, ...prev]);
  const del = async id => {
    if (!window.confirm('Delete this entry?')) return;
    await fetch(`http://localhost:5000/entries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries(prev => prev.filter(x => x._id !== id));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Travel Journal</h2>
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
      </div>

      <EntryForm token={token} onSuccess={add} />

      {loading ? 'Loading…' :
        entries.map(ent => (
          <div key={ent._id} className="border p-4 my-4 rounded relative shadow">
            <button onClick={() => del(ent._id)} className="absolute top-2 right-2 text-red-500">✕</button>
            <h3 className="font-bold text-lg">{ent.title}</h3>
            <p>{ent.content}</p>
            <p className="text-sm text-gray-600">{new Date(ent.date).toLocaleDateString()}</p>
            {ent.location && <p className="text-sm">📍 {ent.location}</p>}
            {ent.imageUrl && <img src={ent.imageUrl} alt="" className="mt-2 max-h-60 object-cover rounded" />}
          </div>
        ))
      }
    </div>
  );
}
