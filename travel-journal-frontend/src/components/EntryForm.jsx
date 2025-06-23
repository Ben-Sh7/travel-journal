import { useState } from 'react';

export default function EntryForm({ token, onSuccess }) {
  const [form, setForm] = useState({ title:'', content:'', date:'', location:'', imageUrl:'' });
  const [file, setFile] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const pick = e => { setFile(e.target.files[0]); setForm(f => ({ ...f, imageUrl: '' })); };

  const submit = async e => {
    e.preventDefault();
    if (!form.title || !form.content || !form.date) {
      setErr('Fill required fields');
      return;
    }
    setErr(''); setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
    if (file) fd.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/entries', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || 'Upload failed');

      onSuccess?.(data);
      setForm({ title:'', content:'', date:'', location:'', imageUrl:'' });
      setFile(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2" encType="multipart/form-data">
      {err && <p className="text-red-500">{err}</p>}
      <input name="title" value={form.title} onChange={change} placeholder="Title" required className="border w-full p-2 rounded"/>
      <textarea name="content" value={form.content} onChange={change} placeholder="Content" required className="border w-full p-2 rounded"/>
      <input type="date" name="date" value={form.date} onChange={change} required className="border w-full p-2 rounded"/>
      <input name="location" value={form.location} onChange={change} placeholder="Location" className="border w-full p-2 rounded"/>
      <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="Image URL" disabled={!!file} className="border w-full p-2 rounded"/>
      <input type="file" accept="image/*" onChange={pick} className="border p-2 rounded"/>
      <button disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">
        {loading ? 'Saving…' : 'Add Entry'}
      </button>
    </form>
  );
}
