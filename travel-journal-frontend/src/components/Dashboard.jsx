import { useState, useEffect } from 'react';
import EntryForm from './EntryForm';
import { useOutletContext } from 'react-router-dom';

export default function Dashboard() {
  const { token, handleLogout } = useOutletContext();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null); // מזהה הרשומה בעריכה
  const [editForm, setEditForm] = useState(null); // ערכי הטופס בעריכה
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await fetch('http://localhost:5000/entries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to load entries');
      setEntries(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error('Load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = (entry) => setEntries((prev) => [entry, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));

  const del = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await fetch(`http://localhost:5000/entries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries((prev) => prev.filter((e) => e._id !== id));
  };

  const startEdit = (entry) => {
    setEditId(entry._id);
    setEditForm({
      title: entry.title,
      content: entry.content,
      date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : '',
      location: entry.location || '',
      imageUrl: entry.imageUrl || ''
    });
    setErr('');
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm(null);
    setErr('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErr('');
    try {
      const res = await fetch(`http://localhost:5000/entries/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (!res.ok) throw new Error('Failed to update');
      const updated = await res.json();
      setEntries((prev) => prev.map(e => e._id === editId ? updated : e));
      cancelEdit();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const changeEdit = e => setEditForm(f => ({ ...f, [e.target.name]: e.target.value }));

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Travel Journal</h2>
        <button onClick={handleLogout} className="bg-red-600 text-white px-3 py-1 rounded">
          Logout
        </button>
      </div>

      <EntryForm token={token} onSuccess={add} />

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        entries.map((entry) => (
          <div key={entry._id} className="border p-4 my-4 rounded relative bg-white shadow">
            <button
              onClick={() => del(entry._id)}
              className="absolute top-1 right-2 text-red-600 text-xl"
              title="Delete"
            >
              ✕
            </button>
            {editId === entry._id ? (
              <form onSubmit={saveEdit} className="space-y-2">
                {err && <p className="text-red-500">{err}</p>}
                <input name="title" value={editForm.title} onChange={changeEdit} placeholder="Title" required className="border p-2 rounded w-full text-red-600" />
                <textarea name="content" value={editForm.content} onChange={changeEdit} placeholder="Content" required className="border p-2 rounded w-full" />
                <input type="date" name="date" value={editForm.date} onChange={changeEdit} required className="border p-2 rounded w-full text-red-600" />
                <input name="location" value={editForm.location} onChange={changeEdit} placeholder="Location" className="border p-2 rounded w-full text-red-600" />
                <input name="imageUrl" value={editForm.imageUrl} onChange={changeEdit} placeholder="Image URL" className="border p-2 rounded w-full" />
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="border border-red-600 text-red-600 px-3 py-1 rounded">{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={cancelEdit} className="border border-gray-400 text-gray-600 px-3 py-1 rounded">Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <h3 className="font-bold text-lg mb-1 text-red-600">{entry.title}</h3>
                <p className="mb-2">{entry.content}</p>
                <p className="text-sm text-red-600">{new Date(entry.date).toLocaleDateString()}</p>
                {entry.location && <p className="text-sm text-red-600 mt-1">📍 {entry.location}</p>}
                {entry.imageUrl && (
                  <img
                    src={entry.imageUrl}
                    alt=""
                    className="mt-3 max-h-64 object-cover rounded"
                  />
                )}
                <button onClick={() => startEdit(entry)} className="border border-red-600 text-red-600 px-3 py-1 rounded mt-2">Edit</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
