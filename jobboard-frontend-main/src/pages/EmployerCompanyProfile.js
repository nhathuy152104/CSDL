// src/pages/EmployerCompanyProfile.jsx
import { useEffect, useState } from "react";
import companyApi from "../api/companyApi";

export default function EmployerCompanyProfile() {
  const [c, setC] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(()=>{(async()=>{
    const res = await companyApi.mine();
    setC(res.data || {});
  })();},[]);

  const onSave = async (e)=>{
    e.preventDefault();
    if (!c?.company_id) return;
    setSaving(true); setMsg("");
    try {
      await companyApi.update(c.company_id, {
        name: c.name, logo_url: c.logo_url, website: c.website,
        industry: c.industry, size: c.size, location: c.location, about: c.about,
      });
      setMsg("Saved ✅");
    } catch (e) { setMsg("Save failed"); }
    finally { setSaving(false); }
  };

  if (!c) return <div className="p-4">Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Company Profile</h1>
      {msg && <div className="text-sm p-2 bg-yellow-50 text-yellow-700 rounded">{msg}</div>}
      <form onSubmit={onSave} className="space-y-3">
        {["name","logo_url","website","industry","size","location"].map(k=>(
          <input key={k} className="w-full p-2 border rounded"
                 placeholder={k} value={c[k] || ""}
                 onChange={e=>setC({...c,[k]:e.target.value})}/>
        ))}
        <textarea className="w-full p-2 border rounded h-32"
                  placeholder="about"
                  value={c.about || ""} onChange={e=>setC({...c,about:e.target.value})}/>
        <button type="submit" disabled={saving}
                className={`px-4 py-2 rounded text-white ${saving?"bg-blue-400":"bg-blue-600 hover:bg-blue-700"}`}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
