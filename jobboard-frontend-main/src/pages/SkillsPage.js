import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MoreHorizontal, Plus, Pencil } from "lucide-react";
import skillApi from "../api/skillApi";
import profileApi from "../api/profileApi";

const TAGS = [
  { key: "all", label: "Tất cả" },
  { key: "domain", label: "Kiến thức trong ngành" },
  { key: "soft", label: "Kỹ năng giao tiếp" },
  { key: "lang", label: "Ngôn ngữ" },
];

const inferTag = (name = "") => {
  const s = name.toLowerCase();
  if (/(english|vietnamese|japanese|korean|chinese|french|german)/.test(s)) return "lang";
  if (/(communication|presentation|team|lead|writing|speaking|negotiat)/.test(s)) return "soft";
  return "domain";
};

export default function SkillsPage() {
  const nav = useNavigate();
  const [items, setItems] = useState([]); // [{skill_id,name,level,years_exp}]
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editLevel, setEditLevel] = useState(1);
  const [editYears, setEditYears] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await profileApi.listMine();
        setItems(Array.isArray(res.data) ? res.data : []);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((it) => inferTag(it.name) === filter);
  }, [items, filter]);

  const startEdit = (it) => {
    setEditingId(it.skill_id);
    setEditLevel(it.level ?? 1);
    setEditYears(it.years_exp ?? 0);
  };

  const saveEdit = async () => {
    const id = editingId; if (!id) return;
    const prev = items;
    const next = prev.map((x) =>
      x.skill_id === id ? { ...x, level: editLevel, years_exp: editYears } : x
    );
    setItems(next); setEditingId(null);
    try { await profileApi.upsertMine(id, { level: editLevel, years_exp: editYears }); }
    catch { setItems(prev); alert("Cập nhật thất bại"); }
  };

  const removeOne = async (id) => {
    if (!window.confirm("Xoá kỹ năng này?")) return;
    const prev = items; setItems(prev.filter((x) => x.skill_id !== id));
    try { await profileApi.removeMine(id); }
    catch { setItems(prev); alert("Xoá thất bại"); }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button onClick={() => nav(-1)} className="p-2 rounded hover:bg-gray-100">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold">Kỹ năng</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded hover:bg-gray-100" title="Thêm" onClick={() => setShowAdd(true)}>
            <Plus size={18} />
          </button>
          <button className="p-2 rounded hover:bg-gray-100" title="Tuỳ chọn">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {TAGS.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1 rounded-full text-sm border ${
              filter === t.key ? "bg-green-700 text-white border-transparent"
                               : "bg-white text-gray-700 hover:bg-gray-50"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Đang tải…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-gray-500">Chưa có kỹ năng.</div>
        ) : (
          <ul>
            {filtered.map((it, idx) => (
              <li key={it.skill_id}>
                {idx !== 0 && <hr className="border-gray-200" />}
                <div className="flex items-start gap-2 p-3">
                  <div className="flex-1">
                    <div className="font-medium">{it.name}</div>
                    {editingId === it.skill_id ? (
                      <div className="flex gap-3 mt-2 items-center">
                        <label className="text-xs text-gray-600">Level</label>
                        <select value={editLevel} onChange={(e) => setEditLevel(Number(e.target.value))}
                                className="text-sm p-1 border rounded">
                          {[1,2,3,4,5].map(n => <option key={n} value={n}>Lv {n}</option>)}
                        </select>
                        <label className="text-xs text-gray-600">Years</label>
                        <input type="number" step="0.5" min="0" value={editYears}
                               onChange={(e)=>setEditYears(Math.max(0, Number(e.target.value)||0))}
                               className="w-24 text-sm p-1 border rounded"/>
                        <button className="px-3 py-1 text-sm rounded bg-blue-600 text-white" onClick={saveEdit}>
                          Lưu
                        </button>
                        <button className="px-3 py-1 text-sm rounded border" onClick={() => setEditingId(null)}>
                          Huỷ
                        </button>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mt-1">
                        Lv {it.level ?? 1} • {it.years_exp ?? 0} yrs
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId !== it.skill_id && (
                      <button className="p-2 rounded hover:bg-gray-100" title="Sửa" onClick={() => startEdit(it)}>
                        <Pencil size={16} />
                      </button>
                    )}
                    <button className="p-2 rounded hover:bg-gray-100" title="Xoá" onClick={() => removeOne(it.skill_id)}>
                      ×
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showAdd && (
        <AddSkillModal
          onClose={() => setShowAdd(false)}
          onAdded={(row) => {
            setItems(prev => {
              const has = prev.find(x => x.skill_id === row.skill_id);
              return has ? prev.map(x => x.skill_id === row.skill_id ? row : x) : [row, ...prev];
            });
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function AddSkillModal({ onClose, onAdded }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]); // [{skill_id,name}]
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await skillApi.searchCatalog(q);
        setOptions(res.data || []);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const addOne = async (opt) => {
    setAddingId(opt.skill_id);
    try {
      await profileApi.upsertMine(opt.skill_id, { level: 1, years_exp: 0 });
      onAdded({ ...opt, level: 1, years_exp: 0 });
    } catch { alert("Thêm kỹ năng thất bại"); }
    finally { setAddingId(null); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[92vw] max-w-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Thêm kỹ năng</h3>
          <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}>Đóng</button>
        </div>
        <input className="w-full p-2 border rounded mb-3" placeholder="Tìm kỹ năng…" value={q} onChange={(e)=>setQ(e.target.value)} />
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải…</div>
        ) : options.length === 0 ? (
          <div className="text-sm text-gray-500">Không có kết quả</div>
        ) : (
          <ul className="max-h-72 overflow-auto divide-y">
            {options.map(opt => (
              <li key={opt.skill_id} className="flex items-center justify-between py-2">
                <span className="text-sm">{opt.name}</span>
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
                  disabled={addingId === opt.skill_id}
                  onClick={() => addOne(opt)}
                >
                  {addingId === opt.skill_id ? "Đang thêm..." : "Thêm"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
