import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function EntryView({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/entries`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to load entry');
        const found = data.find(e => e._id === id);
        if (!found) throw new Error('Entry not found');
        setEntry(found);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, token]);

  if (loading) return <div className="p-4 text-gray-500">Loading…</div>;
  if (err) return <div className="p-4 text-red-500">{err}</div>;
  if (!entry) return null;

  return (
    <div className="p-4 max-w-xl mx-auto w-full">
      <button onClick={() => navigate(-1)} className="mb-4 bg-blue-600 text-white px-3 py-1 rounded">Back</button>
      <h2 className="text-2xl font-bold text-red-600 mb-2 break-words">{entry.title}</h2>
      <p className="text-gray-600 mb-2">{entry.date ? new Date(entry.date).toLocaleDateString() : ''}</p>
      {entry.location && <p className="mb-2 text-gray-700">📍 {entry.location}</p>}
      {entry.imageUrl && <img src={entry.imageUrl} alt="" className="mb-4 max-h-64 object-cover rounded w-full" />}
      <div className="text-gray-800 text-lg whitespace-pre-line">{entry.content}</div>
    </div>
  );
}
