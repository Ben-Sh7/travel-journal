import { useState } from 'react';

// קומפוננטת Login - דף התחברות למערכת
// מאפשרת למשתמש להכניס שם משתמש וסיסמה ולקבל טוקן התחברות
export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' }); // ערכי הטופס
  const [err, setErr] = useState(''); // הודעת שגיאה

  // שינוי ערך של שדה בטופס
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // שליחת טופס התחברות לשרת
  const submit = async e => {
    e.preventDefault(); // מונע רענון דף
    try {
      // שליחת בקשת POST לשרת עם שם משתמש וסיסמה
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || 'Login failed');
      onLogin(data.token); // קריאה לפונקציה חיצונית (מההורה) עם הטוקן
    } catch (e) {
      setErr(e.message); // הצגת שגיאה
    }
  };

  // JSX - טופס התחברות בפועל
  return (
    <form onSubmit={submit} className="flex flex-col gap-2 max-w-md mx-auto p-2 sm:p-4 md:p-6 border rounded mt-8 w-full">
      {/* הודעת שגיאה */}
      {err && <p className="text-red-500">{err}</p>}
      {/* שדות הטופס */}
      <input name="username" value={form.username} onChange={change} placeholder="Username" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg"/>
      <input name="password" value={form.password} onChange={change} placeholder="Password" type="password" required className="border p-2 md:p-3 rounded w-full text-base md:text-lg"/>
      {/* כפתור שליחה */}
      <button type="submit" className="bg-blue-600 text-white py-2 md:px-5 md:py-2 rounded w-full sm:w-auto text-base md:text-lg">Login</button>
    </form>
  );
}
