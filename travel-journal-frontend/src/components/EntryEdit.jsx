import { useState } from 'react';

export default function EntryEdit({ entry, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: entry.title || '',
    content: entry.content || '',
    date: entry.date ? new Date(entry.date).toISOString().slice(0, 10) : '',
    location: entry.location || '',
    imageUrl: entry.imageUrl || ''
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await onSave(form);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2 p-4 border rounded bg-gray-50">
      {err && <p className="text-red-500">{err}</p>}
      <input name="title" value={form.title} onChange={change} placeholder="Title" required className="border p-2 rounded w-full" />
      <textarea name="content" value={form.content} onChange={change} placeholder="Content" required className="border p-2 rounded w-full" />
      <input type="date" name="date" value={form.date} onChange={change} required className="border p-2 rounded w-full" />
      <input name="location" value={form.location} onChange={change} placeholder="Location" className="border p-2 rounded w-full" />
      <input name="imageUrl" value={form.imageUrl} onChange={change} placeholder="Image URL" className="border p-2 rounded w-full" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded">{loading ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
      </div>
    </form>
  );
}
