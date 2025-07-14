import { useState, useEffect } from 'react';
import EntryForm from './EntryForm';
import Stickman from './Stickman';
// ...existing code...

// קומפוננטת Dashboard - מציגה את כל הרשומות (Entries) של טיול מסוים
// מאפשרת הוספה, עריכה ומחיקה של רשומות, כולל העלאת תמונה
export default function Dashboard({ token, trip, onLogout, onBack }) {
  // state - משתנים פנימיים של הקומפוננטה
  const [entries, setEntries] = useState([]); // כל הרשומות של הטיול
  const [loading, setLoading] = useState(true); // האם בטעינה
  const [editId, setEditId] = useState(null); // מזהה הרשומה שנמצאת בעריכה כרגע
  const [editForm, setEditForm] = useState({ title: '', content: '', date: '', location: '', imageUrl: '' }); // ערכי הטופס בעריכה
  const [editFile, setEditFile] = useState(null); // קובץ תמונה חדש בעריכה

  // פונקציה לטעינת כל הרשומות של הטיול מהשרת
  // מתבצעת בכל פעם שמתחלף טיול (trip)
  const load = async () => {
    try {
      // שליחת בקשת GET לשרת לקבלת כל הרשומות של הטיול הנוכחי
      const res = await fetch(`http://localhost:5000/entries?tripId=${trip._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to load entries');
      setEntries(data); // שמירת הרשומות ב-state
    } catch (err) {
      console.error('Load error:', err.message);
    } finally {
      setLoading(false); // מסמן שהטעינה הסתיימה
    }
  };

  // useEffect - מריץ את load בכל פעם שמתחלף טיול
  useEffect(() => {
    load();
    // נטען מחדש בכל החלפת טיול
  }, [trip]);

  // הוספת רשומה חדשה ל-state (מתבצע אחרי הוספה מוצלחת לשרת)
  const add = (entry) => setEntries((prev) => [entry, ...prev]);

  // מחיקת רשומה מהשרת ומה-state
  const del = async (id) => {
    if (!window.confirm('Delete this entry?')) return; // בקשת אישור מהמשתמש
    await fetch(`http://localhost:5000/entries/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    setEntries((prev) => prev.filter((e) => e._id !== id)); // מסנן את הרשומה שנמחקה
  };

  // מעבר למצב עריכה של רשומה מסוימת
  // ממלא את הטופס בערכים של הרשומה
  const startEdit = (entry) => {
    setEditId(entry._id); // מזהה איזו רשומה בעריכה
    setEditForm({
      title: entry.title,
      content: entry.content,
      date: entry.date ? entry.date.slice(0, 10) : '', // חותך תאריך לפורמט yyyy-mm-dd
      location: entry.location || '',
      imageUrl: entry.imageUrl || ''
    });
    setEditFile(null); // איפוס קובץ תמונה
  };

  // שמירת עריכה של רשומה (כולל העלאת קובץ תמונה אם נבחר)
  // שולח לשרת את כל הערכים החדשים
  const saveEdit = async (id) => {
    try {
      // FormData מאפשר שליחת טקסט וקבצים יחד
      const fd = new FormData();
      // מוסיף את כל השדות של הרשומה ל-FormData
      Object.entries({ ...editForm, tripId: trip._id }).forEach(([k, v]) => v && fd.append(k, v));
      // אם נבחר קובץ תמונה חדש, מוסיפים אותו
      if (editFile) fd.append('image', editFile);
      // שליחת בקשת PUT לשרת לעדכון הרשומה
      const res = await fetch(`http://localhost:5000/entries/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }, // לא להוסיף Content-Type כשמשתמשים ב-FormData
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Failed to update entry');
      // עדכון הרשומה ב-state
      setEntries(prev => prev.map(e => e._id === id ? data : e));
      setEditId(null); // יציאה ממצב עריכה
      setEditFile(null); // איפוס קובץ
    } catch (e) {
      alert(e.message); // הצגת שגיאה
    }
  };

// ...existing code...

  // JSX - מה שמוצג בפועל למשתמש
  return (
    <div className="p-2 sm:p-4 max-w-3xl mx-auto w-full">
      {/* כותרת הדף, Stickman, וכפתור Logout בשורה אחת */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2 sm:gap-0">
        <div className="flex gap-2 items-center w-full sm:w-auto">
          <button onClick={onBack} className="bg-blue-600 text-white px-2 py-1 rounded">Back</button>
          <h2 className="text-xl font-bold break-words text-red-600">
            {trip.name} ({trip.date ? new Date(trip.date).toLocaleDateString() : ''})
          </h2>
        </div>
        {/* Stickman between title and Logout */}
        <div className="flex items-center justify-center mx-2">
          <Stickman />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded w-full sm:w-auto mt-2 sm:mt-0">
            Logout
          </button>
        </div>
      </div>
      {/* ...existing code... */}
      {/* תצוגת תמונת הטיול (אם קיימת) */}
      {trip.imageUrl && <img src={trip.imageUrl} alt="" className="mb-4 max-h-48 object-cover rounded w-full" />}
      {/* טופס הוספת רשומה חדשה */}
      <EntryForm token={token} tripId={trip._id} onSuccess={add} />
      {/* הודעת טעינה */}
      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {/* מעבר על כל הרשומות והצגתן */}
          {entries
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // מיון מהחדשה לישנה
            .map((entry) => (
              <div key={entry._id} className="border p-4 md:p-6 rounded relative bg-white shadow w-full overflow-x-auto">
                {/* אם הרשומה בעריכה - מציג טופס עריכה */}
                {editId === entry._id ? (
                  // מצב עריכה של רשומה
                  <>
                    {/* שדות עריכה */}
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} />
                    <textarea className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} />
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" type="date" value={editForm.date} onChange={e => setEditForm(f => ({ ...f, date: e.target.value }))} />
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} />
                    {/* שדה כתובת תמונה (אם לא נבחר קובץ) */}
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" value={editForm.imageUrl} onChange={e => setEditForm(f => ({ ...f, imageUrl: e.target.value }))} disabled={!!editFile} />
                    {/* שדה העלאת קובץ תמונה */}
                    <input className="border rounded px-2 py-1 md:px-3 md:py-2 mb-2 w-full text-base md:text-lg" type="file" accept="image/*" onChange={e => { setEditFile(e.target.files[0]); setEditForm(f => ({ ...f, imageUrl: '' })); }} />
                    {/* כפתורי שמירה וביטול */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                      <button className="bg-green-600 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => saveEdit(entry._id)}>Save</button>
                      <button className="bg-gray-400 text-white px-2 py-1 md:px-4 md:py-2 rounded w-full sm:w-auto text-base md:text-lg" onClick={() => { setEditId(null); setEditFile(null); }}>Cancel</button>
                    </div>
                  </>
                ) : (
                  // תצוגה רגילה של רשומה
                  <>
                    {/* כותרת הרשומה */}
                    <h3 className="font-bold text-lg md:text-xl mb-1 break-words text-red-600">{entry.title}</h3>
                    {/* תוכן הרשומה */}
                    <p className="mb-2 break-words text-red-600 text-sm md:text-base">{entry.content}</p>
                    {/* תאריך הרשומה */}
                    <p className="text-sm text-red-600">{new Date(entry.date).toLocaleDateString()}</p>
                    {/* מיקום (אם קיים) */}
                    {entry.location && <p className="text-sm text-red-600 mt-1 break-words">📍 {entry.location}</p>}
                    {/* תמונה (אם קיימת) */}
                    {entry.imageUrl && (
                      <img
                        src={entry.imageUrl}
                        alt=""
                        className="mt-3 max-h-64 object-cover rounded w-full"
                      />
                    )}
                    {/* כפתורי עריכה ומחיקה */}
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
