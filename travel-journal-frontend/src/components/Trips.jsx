import { useState, useEffect } from 'react';
import leftImg from '../backgroundImages/2020.jpg';
import rightImg from '../backgroundImages/2021.jpg';
// ...existing code...

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
      imageUrl = URL.createObjectURL(file);
    }
    try {
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
      // מעבר אוטומטי לדשבורד של הטיול החדש
      if (typeof onSelectTrip === 'function') {
        onSelectTrip(data);
      }
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
    <div className="trips-root-row flex flex-row w-full min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Left image - always on the side */}
      <div
        className="trips-left min-w-[32px] w-[12vw] sm:w-1/5 lg:w-[24vw] min-h-screen bg-repeat-y bg-top"
        style={{
          backgroundImage: `url(${leftImg})`,
          backgroundSize: window.innerWidth < 640 ? '120px auto' : '400px auto',
          backgroundPosition: 'top',
          backgroundRepeat: 'repeat-y',
          flexShrink: 0
        }}
      />
      <div className="trips-center w-full sm:w-3/5 lg:w-[52vw] flex flex-col min-w-0 mx-auto">
        <div className="p-2 sm:p-4 md:p-6 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto w-full">
          {/* כותרת הדף וכפתור יציאה */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0 w-full">
            <h2 className="text-2xl md:text-3xl font-bold text-red-600 break-words w-full sm:w-auto text-center sm:text-left">My Journy</h2>
            <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 md:px-5 md:py-2 rounded w-full sm:w-auto mt-2 sm:mt-0 text-base md:text-lg">Logout</button>
          </div>
          {/* טופס הוספת טיול */}
          <form onSubmit={addTrip} className="mb-6 flex flex-col items-center gap-2 w-full" encType="multipart/form-data">
            <div className="flex flex-col gap-2 w-full max-w-sm mx-auto">
              <input
                className="border rounded px-2 py-1 md:px-3 md:py-2 w-full text-base md:text-lg"
                placeholder="Trip Name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
              />
              <input
                className="border rounded px-2 py-1 md:px-3 md:py-2 w-full text-base md:text-lg"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                required
              />
              <input
                className="border rounded px-2 py-1 md:px-3 md:py-2 w-full text-base md:text-lg"
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                disabled={!!file}
              />
              <input
                className="border rounded px-2 py-1 md:px-3 md:py-2 w-full text-base md:text-lg"
                type="file"
                accept="image/*"
                onChange={e => {
                  setFile(e.target.files[0]);
                  setForm(f => ({ ...f, imageUrl: '' }));
                }}
              />
            </div>
            <button className="bg-green-600 text-white px-3 py-1 md:px-5 md:py-2 rounded w-auto text-base md:text-lg mt-2">Add Trip</button>
          </form>
          {/* הודעת שגיאה */}
          {err && <p className="text-red-500 mb-2">{err}</p>}
          {/* הודעת טעינה */}
          {loading ? <p className="text-gray-500">Loading…</p> : (
            <div className="flex flex-col gap-4 w-full">
              {/* מעבר על כל הטיולים */}
              {trips.map(trip => (
                <div key={trip._id} className="border rounded shadow p-4 md:p-6 bg-white flex flex-col items-center w-full">
                  {editId === trip._id ? (
                    // מצב עריכה של טיול
                  <>
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.imageUrl} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} disabled={!!editFile} />
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" type="file" accept="image/*" onChange={e => { setEditFile(e.target.files[0]); }} />
                    <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
                      <button className="bg-green-600 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => saveEdit(trip._id)}>Save</button>
                      <button className="bg-gray-400 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => { setEditId(null); setEditFile(null); }}>Cancel</button>
                    </div>
                  </>
                  ) : (
                    // תצוגה רגילה של טיול
                    <>
                      <div className="cursor-pointer w-full" onClick={() => onSelectTrip(trip)}>
                        <h3 className="font-bold text-lg md:text-xl mb-1 text-red-600 underline break-words w-full">{trip.name}</h3>
                      </div>
                      <p className="text-sm md:text-base text-red-600 w-full">{trip.date ? new Date(trip.date).toLocaleDateString() : ''}</p>
                      {trip.imageUrl && (
                        <img src={trip.imageUrl} alt="" className="mt-2 max-h-40 md:max-h-60 object-cover rounded border-2 border-red-600 w-full" />
                      )}
                      <div className="flex flex-col sm:flex-row gap-2 mt-2 w-full">
                        <button className="bg-yellow-500 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => startEdit(trip)}>Edit</button>
                        <button className="bg-red-600 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => deleteTrip(trip._id)}>Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Right image - always on the side */}
      <div
        className="trips-right min-w-[32px] w-[12vw] sm:w-1/5 lg:w-[24vw] min-h-screen bg-repeat-y bg-top"
        style={{
          backgroundImage: `url(${rightImg})`,
          backgroundSize: window.innerWidth < 640 ? '120px auto' : '400px auto',
          backgroundPosition: 'top',
          backgroundRepeat: 'repeat-y',
          flexShrink: 0
        }}
      />
    </div>
  );
}
