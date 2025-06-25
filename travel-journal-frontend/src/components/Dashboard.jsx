import { useState, useEffect } from 'react';
import EntryForm from './EntryForm';

// Dashboard: מציג את כל הרשומות (Entries) של טיול מסוים, כולל הוספה, עריכה ומחיקה
export default function Dashboard({ token, trip, onLogout, onBack }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', date: '', location: '', imageUrl: '' });
  const [editFile, setEditFile] = useState(null);

  // טוען את כל הרשומות של הטיול מהשרת
  const load = async () => {
    try {
      const res = await fetch(`http://localhost:5000/entries?tripId=${trip._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to load entries');
      setEntries(data);
    } catch (err) {
      console.error('Load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // נטען מחדש בכל החלפת טיול
  }, [trip]);

  // הוספת רשומה חדשה ל-state
  const add = (entry) => setEntries((prev) => [entry, ...prev]);

  // מחיקת רשומה מהשרת ומה-state
  const del = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await fetch(`http://localhost:5000/entries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries((prev) => prev.filter((e) => e._id !== id));
  };

  // מעבר למצב עריכה של רשומה
  const startEdit = (entry) => {
    setEditId(entry._id);
    setEditForm({
      title: entry.title,
      content: entry.content,
      date: entry.date ? entry.date.slice(0, 10) : '',
      location: entry.location || '',
      imageUrl: entry.imageUrl || ''
    });
    setEditFile(null);
  };

  // שמירת עריכה של רשומה (כולל העלאת קובץ תמונה אם נבחר)
  const saveEdit = async (id) => {
    try {
      const fd = new FormData();
      Object.entries({ ...editForm, tripId: trip._id }).forEach(([k, v]) => v && fd.append(k, v));
      if (editFile) fd.append('image', editFile);
      const res = await fetch(`http://localhost:5000/entries/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to update entry');
      setEntries(prev => prev.map(e => e._id === id ? data : e));
      setEditId(null);
      setEditFile(null);
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-3xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <button onClick={onBack} className="bg-blue-600 text-white px-2 py-1 rounded">Back</button>
          <h2 className="text-xl font-bold break-words text-red-600">
            {trip.name} ({trip.date ? new Date(trip.date).toLocaleDateString() : ''})
          </h2>
        </div>
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded w-full sm:w-auto mt-2 sm:mt-0">
          Logout
        </button>
      </div>
      {trip.imageUrl && <img src={trip.imageUrl} alt="" className="mb-4 max-h-48 object-cover rounded w-full" />}
      {/* טופס הוספת רשומה חדשה */}
      <EntryForm token={token} tripId={trip._id} onSuccess={add} />
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {entries
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((entry) => (
              <div key={entry._id} className="border p-4 rounded relative bg-white shadow w-full overflow-x-auto">
                {editId === entry._id ? (
                  // מצב עריכה של רשומה
                  <>
                    <input className="border rounded px-2 py-1 mb-2 w-full" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    <textarea className="border rounded px-2 py-1 mb-2 w-full" value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                    <input className="border rounded px-2 py-1 mb-2 w-full" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                    <input className="border rounded px-2 py-1 mb-2 w-full" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
                    <input className="border rounded px-2 py-1 mb-2 w-full" value={editForm.imageUrl} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} disabled={!!editFile} />
                    <input className="border rounded px-2 py-1 mb-2 w-full" type="file" accept="image/*" onChange={e => { setEditFile(e.target.files[0]); setEditForm(f => ({ ...f, imageUrl: '' })); }} />
                    <div className="flex gap-2 w-full">
                      <button className="bg-green-600 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => saveEdit(entry._id)}>Save</button>
                      <button className="bg-gray-400 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => { setEditId(null); setEditFile(null); }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  // תצוגה רגילה של רשומה
                  <>
                    <h3 className="font-bold text-lg mb-1 break-words text-red-600">{entry.title}</h3>
                    <p className="mb-2 break-words text-red-600">{entry.content}</p>
                    <p className="text-sm text-red-600">{new Date(entry.date).toLocaleDateString()}</p>
                    {entry.location && <p className="text-sm text-red-600 mt-1 break-words">📍 {entry.location}</p>}
                    {entry.imageUrl && (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="mt-3 max-h-64 object-cover rounded w-full"
                      />
                    )}
                    <div className="flex gap-2 mt-2 w-full">
                      <button className="bg-orange-500 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => startEdit(entry)}>Edit</button>
                      <button className="bg-red-600 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => del(entry._id)}>Delete</button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
