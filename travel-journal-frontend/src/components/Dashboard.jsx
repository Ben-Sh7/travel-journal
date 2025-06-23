import { useState,useEffect } from 'react';
import EntryForm from './EntryForm';

export default function Dashboard({ token, onLogout }) {
  const [entries,setEntries]=useState([]);
  const [loading,setLoading]=useState(true);

  const load = async()=>{
    try{
      const res = await fetch('http://localhost:5000/entries',{
        headers:{ Authorization:`Bearer ${token}` }
      });
      if(!res.ok){
        const txt = await res.text();
        throw new Error(`HTTP ${res.status}: ${txt}`);
      }
      setEntries(await res.json());
    }catch(e){ alert(e.message); }
    finally{ setLoading(false); }
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */},[]);

  const add = e => setEntries(p=>[e,...p]);
  const del = async id=>{
    if(!window.confirm('Delete?')) return;
    await fetch(`http://localhost:5000/entries/${id}`,{
      method:'DELETE', headers:{Authorization:`Bearer ${token}`}
    });
    setEntries(p=>p.filter(x=>x._id!==id));
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Travel Journal</h2>
        <button onClick={onLogout} className="bg-red-600 text-white px-3 py-1 rounded">Logout</button>
      </div>

      <EntryForm token={token} onSuccess={add}/>

      {loading? 'Loading…' :
        entries.map(ent=>(
          <div key={ent._id} className="border p-4 my-4 rounded relative">
            <button onClick={()=>del(ent._id)} className="absolute top-1 right-2 text-red-500">✕</button>
            <h3 className="font-bold">{ent.title}</h3>
            <p>{ent.content}</p>
            <p className="text-sm text-gray-600">{new Date(ent.date).toLocaleDateString()}</p>
            {ent.location && <p className="text-sm">📍 {ent.location}</p>}
            {ent.imageUrl && <img src={ent.imageUrl} alt="" className="mt-2 max-h-60 object-cover"/>}
          </div>
        ))
      }
    </div>
  );
}
