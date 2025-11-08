import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../api/userApi";
import skillApi from "../api/skillApi";

const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

export default function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const [curPwd, setCurPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [skills, setSkills] = useState([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await userApi.getprofile();
        const u = res.data || {};
        setEmail(u.email || ""); setFullName(u.full_name || ""); setPhone(u.phone || "");
        const sk = await skillApi.listMine();
        const list = Array.isArray(sk.data) ? sk.data : [];
        setSkills(list.map(s => ({ skill_id: s.skill_id, name: s.name, level: s.level ?? 1, years_exp: s.years_exp ?? 0 })));
      } finally { setLoading(false); }
    })();
  }, []);

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (phone && !phoneRegex.test(phone)) return "Invalid phone number.";
    if (newPwd && newPwd.length < 6) return "New password must be at least 6 characters.";
    if (newPwd && newPwd !== confirmPwd) return "New passwords do not match.";
    return "";
  };

  const onSave = async (e) => {
    e.preventDefault();
    const v = validate(); if (v) { setMsg(v); return; }
    setSaving(true); setMsg("");
    try {
      const res = await userApi.updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        password_change: newPwd ? { current_password: curPwd, new_password: newPwd } : undefined,
      });
      const u = res.data || {};
      setMsg("Saved ✅");
      setFullName(u.full_name || ""); setPhone(u.phone || "");
      localStorage.setItem("userName", u.full_name || ""); window.dispatchEvent(new Event("auth-changed"));
      setCurPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setMsg(typeof detail === "string" ? detail : "Update failed.");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">My Profile</h1>
      {msg && <div className="text-sm p-2 rounded bg-yellow-50 text-yellow-700">{msg}</div>}

      <form onSubmit={onSave} className="space-y-8">
        {/* Personal Info */}
        <section className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-700">
          <h2 className="font-medium mb-4">Personal information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Email (read-only)</label>
              <input value={email} readOnly className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800 dark:border-gray-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">Full name</label>
              <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full p-2 border rounded" />
            </div>
          </div>
        </section>

        {/* Password */}
        <section className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-700">
          <h2 className="font-medium mb-4">Change password</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <input type="password" placeholder="Current" value={curPwd} onChange={e=>setCurPwd(e.target.value)} className="p-2 border rounded" />
            <input type="password" placeholder="New"     value={newPwd} onChange={e=>setNewPwd(e.target.value)} className="p-2 border rounded" />
            <input type="password" placeholder="Confirm" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} className="p-2 border rounded" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Để trống nếu không đổi mật khẩu.</p>
        </section>

        {/* Skills */}
        <section className="p-4 rounded border bg-white dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Skills</h2>
            <button type="button" onClick={() => navigate("/skills")}
                    className="text-sm px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">
              Manage Skills
            </button>
          </div>

          {/* Preview ngắn gọn */}
          <ul className="text-sm text-gray-700">
            {skills.length === 0 ? (
              <li className="text-gray-400">No skills yet</li>
            ) : (
              skills.slice(0, 5).map(s => (
                <li key={s.skill_id}>• {s.name} (Lv {s.level}, {s.years_exp} yrs)</li>
              ))
            )}
          </ul>
        </section>

        <button type="submit" disabled={saving || loading}
                className={`px-4 py-2 rounded text-white ${saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
