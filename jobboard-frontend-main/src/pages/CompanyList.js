// src/pages/CompanyList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import companyApi from "../api/companyApi";

export default function CompanyList() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { (async () => {
    setLoading(true);
    const res = await companyApi.list(q ? { q } : undefined);
    setItems(res.data || []);
    setLoading(false);
  })(); }, [q]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-3">Companies</h1>
      <input className="w-full p-2 border rounded mb-3"
             placeholder="Search companies…" value={q} onChange={e=>setQ(e.target.value)} />
      {loading ? <div>Loading…</div> : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(c => (
            <li key={c.company_id} className="border rounded p-3 bg-white">
              <div className="flex items-center gap-3">
                {c.logo_url && <img src={c.logo_url} alt="" className="w-10 h-10 rounded" />}
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.industry} • {c.location}</div>
                </div>
              </div>
              <Link to={`/companies/${c.company_id}`}
                    className="text-sm text-blue-600 hover:underline mt-2 inline-block">
                View profile →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
