import { useState, useEffect } from 'react';

// קומפוננטת Trips - מציגה את כל הטיולים של המשתמש
// מאפשרת הוספה, עריכה, מחיקה ובחירה של טיול, כולל העלאת תמונה
export default function Trips({ onSelectTrip, onLogout, token }) {
  // state - משתנים פנימיים
  const [trips, setTrips] = useState([]); // כל הטיולים
  const [form, setForm] = useState({ name: '', date: '', imageUrl: '' }); // טופס הוספה
  const [file, setFile] = useState(null); // קובץ תמונה חדש
  const [loading, setLoading] = useState(true); // האם בטעינה
  const [err, setErr] = useState(''); // הודעת שגיאה
  // עריכה
  const [editId, setEditId] = useState(null); // מזהה טיול בעריכה
  const [editForm, setEditForm] = useState({ name: '', date: '', imageUrl: '' }); // ערכי טופס עריכה
  const [editFile, setEditFile] = useState(null); // קובץ תמונה בעריכה

  // useEffect - טוען את כל הטיולים מהשרת בעת טעינת הקומפוננטה
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // שליחת בקשת GET לשרת לקבלת כל הטיולים
        const res = await fetch('http://localhost:5000/trips', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to load trips');
        setTrips(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // הוספת טיול חדש
  const addTrip = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    let imageUrl = form.imageUrl;
    if (file) {
      // כאן אפשר להעלות קובץ אמיתי לשרת (כרגע רק תצוגה מקומית)
      imageUrl = URL.createObjectURL(file);
    }
    try {
      // שליחת POST לשרת
      const res = await fetch('http://localhost:5000/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, imageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to add trip');
      setTrips(prev => [data, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
      setForm({ name: '', date: '', imageUrl: '' });
      setFile(null);
      setErr('');
    } catch (e) {
      setErr(e.message);
    }
  };

  // מעבר למצב עריכה של טיול
  const startEdit = (trip) => {
    setEditId(trip._id);
    setEditForm({ name: trip.name, date: trip.date.slice(0, 10), imageUrl: trip.imageUrl || '' });
  };

  // שמירת עריכה של טיול
  const saveEdit = async (id) => {
    try {
      let imageUrl = editForm.imageUrl;
      if (editFile) {
        // כאן אפשר להעלות קובץ אמיתי לשרת (כרגע רק תצוגה מקומית)
        imageUrl = URL.createObjectURL(editFile);
      }
      // שליחת PUT לשרת
      const res = await fetch(`http://localhost:5000/trips/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, imageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to update trip');
      setTrips(prev => prev.map(t => t._id === id ? data : t));
      setEditId(null);
      setEditFile(null);
    } catch (e) {
      setErr(e.message);
    }
  };

  // מחיקת טיול
  const deleteTrip = async (id) => {
    if (!window.confirm('Delete this trip?')) return;
    try {
      await fetch(`http://localhost:5000/trips/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(prev => prev.filter(t => t._id !== id));
    } catch (e) {
      setErr(e.message);
    }
  };

  // JSX - תצוגת הטיולים, טפסים, כפתורים
  return (
    <div className="p-2 sm:p-4 max-w-2xl mx-auto w-full">
      {/* כותרת הדף וכפתור יציאה */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0 w-full">
        <h2 className="text-2xl font-bold text-red-600 break-words w-full sm:w-auto">My Trips</h2>
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded w-full sm:w-auto mt-2 sm:mt-0">Logout</button>
      </div>
      {/* טופס הוספת טיול */}
      <form onSubmit={addTrip} className="mb-6 flex flex-col gap-2 w-full" encType="multipart/form-data">
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Trip Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="border rounded px-2 py-1 w-full"
          type="date"
          value={form.date}
          onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
          required
        />
        <input
          className="border rounded px-2 py-1 w-full"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
          disabled={!!file}
        />
        <input
          className="border rounded px-2 py-1 w-full"
          type="file"
          accept="image/*"
          onChange={e => {
            setFile(e.target.files[0]);
            setForm(f => ({ ...f, imageUrl: '' }));
          }}
        />
        <button className="bg-green-600 text-white px-3 py-1 rounded self-start sm:self-auto">Add Trip</button>
      </form>
      {/* הודעת שגיאה */}
      {err && <p className="text-red-500 mb-2">{err}</p>}
      {/* הודעת טעינה */}
      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="flex flex-col gap-4 w-full">
          {/* מעבר על כל הטיולים */}
          {trips.map(trip => (
            <div key={trip._id} className="border rounded shadow p-4 bg-white flex flex-col items-center w-full">
              {editId === trip._id ? (
                // מצב עריכה של טיול
                <>
                  <input className="border rounded px-2 py-1 mb-2 w-full" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                  <input className="border rounded px-2 py-1 mb-2 w-full" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                  <input className="border rounded px-2 py-1 mb-2 w-full" value={editForm.imageUrl} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} disabled={!!editFile} />
                  <input className="border rounded px-2 py-1 mb-2 w-full" type="file" accept="image/*" onChange={e => { setEditFile(e.target.files[0]); }} />
                  <div className="flex gap-2 w-full">
                    <button className="bg-green-600 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => saveEdit(trip._id)}>Save</button>
                    <button className="bg-gray-400 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => { setEditId(null); setEditFile(null); }}>Cancel</button>
                  </div>
                </>
              ) : (
                // תצוגה רגילה של טיול
                <>
                  <div className="cursor-pointer w-full" onClick={() => onSelectTrip(trip)}>
                    <h3 className="font-bold text-lg mb-1 text-red-600 underline break-words w-full">{trip.name}</h3>
                  </div>
                  <p className="text-sm text-red-600 w-full">{trip.date ? new Date(trip.date).toLocaleDateString() : ''}</p>
                  {trip.imageUrl && (
                    <img src={trip.imageUrl} alt="" className="mt-2 max-h-40 object-cover rounded border-2 border-red-600 w-full" />
                  )}
                  <div className="flex gap-2 mt-2 w-full">
                    <button className="bg-yellow-500 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => startEdit(trip)}>Edit</button>
                    <button className="bg-red-600 text-white px-2 py-1 rounded w-full sm:w-auto" onClick={() => deleteTrip(trip._id)}>Delete</button>
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
