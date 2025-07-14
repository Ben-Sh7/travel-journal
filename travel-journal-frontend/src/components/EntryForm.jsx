import { useState, useRef } from 'react';

// קומפוננטה EntryForm - טופס להוספת רשומה חדשה ליומן הטיול
// מאפשרת למשתמש למלא כותרת, תוכן, תאריך, מיקום, תמונה (קובץ או כתובת)
export default function EntryForm({ token, tripId, onSuccess }) {
  // state - ערכי הטופס
  const [form, setForm] = useState({
    title: '', content: '', date: '', location: '', imageUrl: ''
  });
  const [file, setFile] = useState(null); // קובץ תמונה (אם נבחר)
  const [err, setErr] = useState(''); // הודעת שגיאה
  const [loading, setLoading] = useState(false); // האם הטופס בתהליך שליחה
  const fileInputRef = useRef(); // מאפשר איפוס שדה קובץ

  // שינוי ערך של שדה טקסט בטופס
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // בחירת קובץ תמונה - שומר את הקובץ ומאפס את שדה כתובת התמונה
  const pick = e => {
    setFile(e.target.files[0]);
    setForm(f => ({ ...f, imageUrl: '' }));
  };

  // שליחת הטופס לשרת (הוספת רשומה חדשה)
  const submit = async e => {
    e.preventDefault(); // מונע רענון דף
    // בדיקה שכל השדות החובה מולאו
    if (!form.title || !form.content || !form.date) {
      setErr('Fill required fields');
      return;
    }
    setErr('');
    setLoading(true);

    // FormData - מאפשר שליחת טקסט וקבצים יחד
    const fd = new FormData();
    // מוסיף את כל השדות ל-FormData
    Object.entries({ ...form, tripId }).forEach(([k, v]) => v && fd.append(k, v));
    if (file) fd.append('image', file); // מוסיף קובץ אם נבחר

    try {
      // שליחת בקשת POST לשרת להוספת רשומה
      const res = await fetch('http://localhost:5000/entries', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}` // מזהה את המשתמש
        },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Upload failed');

      // קריאה לפונקציה חיצונית (מההורה) לעדכון הרשומות
      onSuccess?.(data);
      // איפוס הטופס
      setForm({ title: '', content: '', date: '', location: '', imageUrl: '' });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setErr(e.message); // הצגת שגיאה
    } finally {
      setLoading(false); // מסמן שהשליחה הסתיימה
    }
  };

  // JSX - טופס ההוספה בפועל
  return (
    <form onSubmit={submit} className="space-y-2 w-full max-w-2xl mx-auto p-2 sm:p-4 md:p-6" encType="multipart/form-data">
      {/* הודעת שגיאה */}
      {err && <p className="text-red-500">{err}</p>}
      {/* שדות הטופס */}
      <input name="title" value={form.title} onChange={change} placeholder="Title" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg" />
      <textarea name="content" value={form.content} onChange={change} placeholder="Content" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg" />
      <input type="date" name="date" value={form.date} onChange={change} required className="border p-2 md:p-3 rounded w-full text-base md:text-lg" />
      <input name="location" value={form.location} onChange={change} placeholder="Location" className="border p-2 md:p-3 rounded w-full text-base md:text-lg" />
      {/* שדה כתובת תמונה (אם לא נבחר קובץ) */}
      <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="Image URL" disabled={!!file} className="border p-2 md:p-3 rounded w-full text-base md:text-lg" />
      {/* שדה העלאת קובץ */}
      <input type="file" accept="image/*" onChange={pick} className="border p-2 md:p-3 rounded w-full text-base md:text-lg" ref={fileInputRef} />
      {/* כפתור שליחה */}
      <button disabled={loading} className="bg-green-600 text-white px-3 py-1 md:px-5 md:py-2 rounded w-full sm:w-auto text-base md:text-lg">
        {loading ? 'Saving…' : 'Add Entry'}
      </button>
    </form>
  );
}
