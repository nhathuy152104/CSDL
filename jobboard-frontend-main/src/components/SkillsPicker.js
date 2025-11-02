// src/components/SkillsPicker.jsx
import { useEffect, useMemo, useState } from "react";
import skillApi from "../api/skillApi";

export default function SkillsPicker({
  value = [],            // [{ skill_id, name, level, years_exp }]
  onChange = () => {},
}) {
  const [options, setOptions] = useState([]); // [{skill_id, name}]
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedMap = useMemo(() => {
    const m = new Map();
    value.forEach(s => m.set(s.skill_id, { level: s.level ?? 1, years_exp: s.years_exp ?? 0 }));
    return m;
  }, [value]);

  const fetchSkills = async (q) => {
    setLoading(true);
    try {
      const res = await skillApi.searchCatalog(q);
      setOptions(res.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSkills(""); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchSkills(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Local helpers
  const addLocal = (skill, level = 1, years_exp = 0) =>
    onChange([...value, { ...skill, level, years_exp }]);
  const removeLocal = (skillId) =>
    onChange(value.filter(s => s.skill_id !== skillId));
  const setLocal = (skillId, patch) =>
    onChange(value.map(s => s.skill_id === skillId ? { ...s, ...patch } : s));

  const toggle = async (skill) => {
    const checked = selectedMap.has(skill.skill_id);
    if (!checked) {
      // add with defaults
      addLocal(skill, 1, 0);
      try {
        await skillApi.upsertMine(skill.skill_id, { level: 1, years_exp: 0 });
      } catch {
        removeLocal(skill.skill_id);
        alert("Failed to add skill.");
      }
    } else {
      const prev = value.find(s => s.skill_id === skill.skill_id);
      removeLocal(skill.skill_id);
      try {
        await skillApi.removeMine(skill.skill_id);
      } catch {
        addLocal(skill, prev?.level ?? 1, prev?.years_exp ?? 0);
        alert("Failed to remove skill.");
      }
    }
  };

  const changeLevel = async (skillId, lvl) => {
    const newLevel = Number(lvl) || 1;
    const prev = value.find(s => s.skill_id === skillId);
    const years = prev?.years_exp ?? 0;
    setLocal(skillId, { level: newLevel });
    try {
      await skillApi.upsertMine(skillId, { level: newLevel, years_exp: years });
    } catch {
      setLocal(skillId, { level: prev?.level ?? 1 });
      alert("Failed to update level.");
    }
  };

  const changeYears = async (skillId, yrs) => {
    // cho phép số thực, tối thiểu 0
    const newYears = Math.max(0, Number(yrs) || 0);
    const prev = value.find(s => s.skill_id === skillId);
    const lvl = prev?.level ?? 1;
    setLocal(skillId, { years_exp: newYears });
    try {
      await skillApi.upsertMine(skillId, { level: lvl, years_exp: newYears });
    } catch {
      setLocal(skillId, { years_exp: prev?.years_exp ?? 0 });
      alert("Failed to update years of experience.");
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {value.map(s => (
            <div key={s.skill_id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
              <span className="text-sm font-medium text-blue-800 min-w-[120px]">{s.name}</span>

              <label className="text-xs text-gray-600">Level</label>
              <select
                value={s.level ?? 1}
                onChange={(e) => changeLevel(s.skill_id, e.target.value)}
                className="text-sm p-1.5 border rounded"
                title="Level"
              >
                {[1,2,3,4,5].map(n => <option key={n} value={n}>Lv {n}</option>)}
              </select>

              <label className="text-xs text-gray-600">Years</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={s.years_exp ?? 0}
                onChange={(e) => changeYears(s.skill_id, e.target.value)}
                className="w-24 text-sm p-1.5 border rounded"
                title="Years of experience"
              />

              <button
                type="button"
                onClick={() => toggle({ skill_id: s.skill_id, name: s.name })}
                className="ml-auto text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input
        className="w-full p-2 border rounded"
        placeholder="Search skills..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Options */}
      <div className="border rounded p-2 max-h-72 overflow-auto">
        {loading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : options.length === 0 ? (
          <div className="text-sm text-gray-500">No skills</div>
        ) : (
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-1">
            {options.map(skill => {
              const checked = selectedMap.has(skill.skill_id);
              return (
                <li key={skill.skill_id}>
                  <label
                    className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer ${
                      checked ? "bg-blue-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="accent-blue-600"
                      checked={checked}
                      onChange={() => toggle(skill)}
                    />
                    <span className="text-sm">{skill.name}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
