import { useState } from 'react';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setMsg(res.ok ? 'Registered! You can login' : data.msg || data.message);
      setForm({ username: '', email: '', password: '' });
    } catch {
      setMsg('Error!');
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 max-w-md mx-auto p-4 border rounded mt-4">
      {msg && <p className={msg.startsWith('Registered') ? 'text-green-500' : 'text-red-500'}>{msg}</p>}
      <input name="username" value={form.username} onChange={change} placeholder="Username" required className="border p-2 rounded"/>
      <input name="email" value={form.email} onChange={change} placeholder="Email" type="email" required className="border p-2 rounded"/>
      <input name="password" value={form.password} onChange={change} placeholder="Password" type="password" required className="border p-2 rounded"/>
      <button type="submit" className="bg-blue-600 text-white py-2 rounded">Sign Up</button>
    </form>
  );
}
