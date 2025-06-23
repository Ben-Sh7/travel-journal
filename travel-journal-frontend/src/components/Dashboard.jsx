import { useEffect, useState } from 'react';

export default function Dashboard({ token, onLogout }) {
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
    imageUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const fetchEntries = async () => {
    try {
      const res = await fetch('http://localhost:5000/entries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch entries:', err);
    }
  };

  useEffect(() => {
    if (token) fetchEntries();
  }, [token]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: '', content: '', date: '', location: '', imageUrl: '' });
        fetchEntries();
      }
    } catch (err) {
      console.error('Failed to create entry:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const res = await fetch(`http://localhost:5000/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Travel Journal</h2>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 space-y-2">
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title"
          className="border p-2 w-full rounded"
          required
        />
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Content"
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="border p-2 w-full rounded"
          required
        />
        <input
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Location"
          className="border p-2 w-full rounded"
        />
        <input
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Add Entry'}
        </button>
      </form>

      <ul className="space-y-4">
        {entries.map((entry) => (
          <li key={entry._id} className="border p-4 rounded shadow relative">
            <button
              onClick={() => handleDelete(entry._id)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              title="Delete entry"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold">{entry.title}</h3>
            <p>{entry.content}</p>
            <p className="text-sm text-gray-600">
              {new Date(entry.date).toLocaleDateString()}
            </p>
            {entry.location && <p className="text-sm">📍 {entry.location}</p>}
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt="entry"
                className="mt-2 w-full max-h-64 object-cover rounded"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
