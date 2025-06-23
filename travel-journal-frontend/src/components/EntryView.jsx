import { useState } from 'react';

export default function EntryView({ entry, onEdit, onBack }) {
  const [showImg, setShowImg] = useState(true);
  return (
    <div className="p-4 border rounded bg-white max-w-xl mx-auto mt-6">
      <button onClick={onBack} className="mb-4 bg-gray-300 px-3 py-1 rounded">← Back to list</button>
      <h2 className="text-2xl font-bold mb-2">{entry.title}</h2>
      <p className="mb-2">{entry.content}</p>
      <p className="text-sm text-gray-600 mb-1">{new Date(entry.date).toLocaleDateString()}</p>
      {entry.location && <p className="text-sm text-blue-600 mb-2">📍 {entry.location}</p>}
      {entry.imageUrl && showImg && (
        <img
          src={entry.imageUrl}
          alt=""
          className="mb-3 max-h-64 object-cover rounded"
          onError={() => setShowImg(false)}
        />
      )}
      <button onClick={onEdit} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
    </div>
  );
}
