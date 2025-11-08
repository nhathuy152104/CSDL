// src/pages/CompanyDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import companyApi from "../api/companyApi";
import jobApi from "../api/jobApi";

export default function CompanyDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{(async()=>{
    setLoading(true);
    const res = await companyApi.detail(id);
    setC(res.data || null);
    setLoading(false);
  })();},[id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!c) return <div className="p-4">Not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="flex items-center gap-4">
        {c.logo_url && <img src={c.logo_url} alt="" className="w-16 h-16 rounded" />}
        <div>
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <div className="text-sm text-gray-500">{c.industry} • {c.size} • {c.location}</div>
          {c.website && <a href={c.website} target="_blank" rel="noreferrer"
                           className="text-sm text-blue-600">Website</a>}
        </div>
      </div>

      {c.about && <p className="mt-4 whitespace-pre-line">{c.about}</p>}

      <h2 className="text-lg font-semibold mt-6">Open Jobs</h2>
      {(!c.jobs || c.jobs.length === 0) ? (
        <div className="text-sm text-gray-500">No openings.</div>
      ) : (
        <ul className="divide-y">
          {c.jobs.map(j => (
            <li key={j.id} className="py-3">
              <div className="font-medium">{j.title}</div>
              <div className="text-sm text-gray-500">{j.location} • {j.employment_type}</div>
              <Link to={`/jobs/${j.id}`} className="text-sm text-blue-600 hover:underline">View job</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
