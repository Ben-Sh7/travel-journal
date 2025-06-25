import { useState } from 'react';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [err, setErr] = useState('');

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.message || 'Login failed');
      onLogin(data.token);
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 max-w-md mx-auto p-4 border rounded mt-8 w-full">
      {err && <p className="text-red-500">{err}</p>}
      <input name="username" value={form.username} onChange={change} placeholder="Username" required className="border p-2 rounded w-full"/>
      <input name="password" value={form.password} onChange={change} placeholder="Password" type="password" required className="border p-2 rounded w-full"/>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded w-full sm:w-auto">Login</button>
    </form>
  );
}
