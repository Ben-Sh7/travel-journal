import React, { useState } from 'react';
// קומפוננטת Signup - דף הרשמה למערכת
// מאפשרת למשתמש להירשם עם שם משתמש וסיסמה
export default function Signup() {
  const [form, setForm] = useState({ username: '', password: '' }); // ערכי הטופס
  const [msg, setMsg] = useState(''); // הודעת הצלחה/שגיאה
  const [showTitle, setShowTitle] = useState(false);

  // שינוי ערך של שדה בטופס
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // שליחת טופס הרשמה לשרת
  const submit = async e => {
    e.preventDefault(); // מונע רענון דף
    setShowTitle(true);
    try {
      // שליחת בקשת POST לשרת עם שם משתמש וסיסמה
      const res = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMsg(res.ok ? 'Registered! You can login' : data.msg || data.message); // הודעה מתאימה
      setForm({ username: '', password: '' }); // איפוס הטופס
    } catch {
      setMsg('Error!'); // הודעת שגיאה כללית
    }
  };

  // JSX - טופס הרשמה בפועל
  return (
    <div>
      {/* כותרת מונפשת בוטלה */}
      <form onSubmit={submit} className="flex flex-col gap-2 max-w-md mx-auto p-2 sm:p-4 md:p-6 border rounded mt-8 w-full">
        {/* הודעת הצלחה/שגיאה */}
        {msg && <p className={msg.startsWith('Registered') ? 'text-green-500' : 'text-red-500'}>{msg}</p>}
        {/* שדות הטופס */}
        <input name="username" value={form.username} onChange={change} placeholder="Username" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg"/>
        <input name="password" value={form.password} onChange={change} placeholder="Password" type="password" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg"/>
        {/* כפתור שליחה */}
        <button type="submit" className="bg-blue-600 text-white py-2 md:px-5 md:py-2 rounded w-full sm:w-auto text-base md:text-lg">Sign Up</button>
      </form>
    </div>
  );
}
