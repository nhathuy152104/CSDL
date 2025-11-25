import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import companyApi from "../api/companyApi";

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams(); // optional: /companies/:id for edit

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setMsg("");
      try {
        const res = await companyApi.get(id);
        // Try multiple shapes: { company: {...} } or just {...}
        const c = res?.data?.company ?? res?.data ?? {};
        setName(c.name || "");
        setWebsite(c.website || "");
        setDescription(c.description || "");
        setAddress(c.address || "");
      } catch (err) {
        console.error(err);
        setMsg("Failed to load company.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const validate = () => {
    if (!name.trim()) return "Company name is required.";
    if (website && !/^https?:\/\//.test(website)) return "Website should start with http:// or https://";
    return "";
  };

  const onSave = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setMsg(v);
      return;
    }
    setSaving(true);
    setMsg("");
    try {
      const payload = {
        name: name.trim(),
        website: website.trim() || null,
        description: description.trim() || null,
        address: address.trim() || null,
      };

      const res = id ? await companyApi.update(id, payload) : await companyApi.create(payload);
      // Accept several possible response shapes:
      // res.data.company, res.data, res.data.result, etc.
      const saved = res?.data?.company ?? res?.data ?? {};
      setMsg("Saved ✅");

      // Redirect after create: try common id keys
      if (!id) {
        const newId =
          saved.company_id ?? saved.id ?? (saved.company && (saved.company.id || saved.company.company_id));
        if (newId) {
          navigate(`/companies/${newId}`);
        } else {
          // no id — optionally navigate to list or show saved data
          // keep user on form with success message
          console.warn("No company id returned from API after create:", saved);
        }
      }
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail ?? err?.response?.data ?? err?.message;
      setMsg(typeof detail === "string" ? detail : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{id ? "Edit" : "Create"} Company Profile</h1>

      {msg && <div className="text-sm p-2 rounded bg-yellow-50 text-yellow-700">{msg}</div>}

      <form onSubmit={onSave} className="space-y-6">
        <section className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-700">
          <label className="block text-sm mb-1">Company name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={loading || saving}
          />

          <label className="block text-sm mt-4 mb-1">Website</label>
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-2 border rounded"
            disabled={loading || saving}
          />

          <label className="block text-sm mt-4 mb-1">Address</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={loading || saving}
          />

          <label className="block text-sm mt-4 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full p-2 border rounded"
            disabled={loading || saving}
          />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || loading}
            className={`px-4 py-2 rounded text-white ${
              saving ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {saving ? "Saving..." : id ? "Update company" : "Create company"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded border"
            disabled={saving}
          >
            Cancel
          </button>

          {loading && <div className="text-sm text-gray-500">Loading…</div>}
        </div>
      </form>
    </div>
  );
}
