import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, FileText, Send, Sparkles, Plus, CheckCircle, Calendar, DollarSign, Pencil, X } from 'lucide-react';
import jobApi from '../api/jobApi';
import skillApi from '../api/skillApi';
import LocationApi from '../api/LocationApi';

const PostJob = () => {
  const [job, setJob] = useState({
    title: '',
    location: '',
    description: '',
    employment: 'full_time',
    salary_min: '',
    salary_max: '',
    expires_at: '',
  });

  const [reqSkills, setReqSkills] = useState([]); // [{skill_id, name, level, years_exp}]
  const [region, setRegion] = useState(null); // { region_id, name }

  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);

  const [editingId, setEditingId] = useState(null); // edit skill inline
  const [editLevel, setEditLevel] = useState(1);
  const [editYears, setEditYears] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const isFormValid =
    job.title &&
    job.location &&
    job.description &&
    job.employment &&
    Number(job.salary_min) !== NaN &&
    Number(job.salary_max) !== NaN &&
    Number(job.salary_max) >= Number(job.salary_min) &&
    job.expires_at &&
    region !== null;
    // reqSkills.length > 0 if required

  const handlePost = async () => {
    if (!isFormValid) {
      alert('Please fill all required fields and ensure salary range is valid');
      return;
    }

    const formData = new FormData();
    Object.entries(job).forEach(([key, value]) => formData.append(key, value));
    if (pdfFile) formData.append('pdf', pdfFile);
    if (region) formData.append('region', JSON.stringify(region));
    formData.append('skills', JSON.stringify(reqSkills));

    try {
      setLoading(true);
      await jobApi.create(formData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);

      // Reset form
      setJob({
        title: '',
        location: '',
        description: '',
        employment: 'full_time',
        salary_min: '',
        salary_max: '',
        expires_at: '',
      });
      setReqSkills([]);
      setRegion(null);
      setPdfFile(null);
    } catch (err) {
      alert(`Error: ${err?.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const backgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
      rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.2) 25%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)`,
  };

  const startEditSkill = (row) => {
    setEditingId(row.skill_id);
    setEditLevel(row.level ?? 1);
    setEditYears(row.years_exp ?? 0);
  };

  const saveEditSkill = () => {
    if (!editingId) return;
    setReqSkills(prev =>
      prev.map(x => x.skill_id === editingId ? { ...x, level: editLevel, years_exp: editYears } : x)
    );
    setEditingId(null);
  };

  const removeSkill = (id) => {
    setReqSkills(prev => prev.filter(x => x.skill_id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 transition-all duration-300 ease-out pointer-events-none" style={backgroundStyle} />

      {showSuccess && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Job Posted Successfully! 🎉</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl backdrop-blur-sm">
              <Plus className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Post a Job
            </h2>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-gray-300/80 text-lg">Share your opportunity with talented professionals</p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Title */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g. Backend Developer"
                    value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g. Remote or New York, USA"
                    value={job.location}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Region */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Region</label>
                <div className="flex items-center gap-3">
                  <input
                    placeholder="Select region"
                    value={region?.name || ''}
                    readOnly
                    className="flex-1 pl-4 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={() => setShowRegionModal(true)}
                    className="px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Choose
                  </button>
                </div>
              </div>

              {/* Employment Type */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Employment Type</label>
                <select
                  value={job.employment}
                  onChange={(e) => setJob({ ...job, employment: e.target.value })}
                  className="w-full pl-4 pr-4 py-4 bg-white/5 border rounded-xl text-white focus:outline-none focus:border-emerald-400"
                >
                  <option value="full_time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="temporary">Temporary</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Job Description</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={job.description}
                    onChange={(e) => setJob({ ...job, description: e.target.value })}
                    rows={10}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>
              </div>

              {/* Salary Min / Max */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-3">Salary Min</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={job.salary_min}
                      onChange={(e) => setJob({ ...job, salary_min: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium text-gray-200 mb-3">Salary Max</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={job.salary_max}
                      onChange={(e) => setJob({ ...job, salary_max: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Expires At */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">Expires At</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={job.expires_at}
                    onChange={(e) => setJob({ ...job, expires_at: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-200">Required Skills</label>
              <button
                onClick={() => setShowSkillModal(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Add Skill
              </button>
            </div>

            {reqSkills.length === 0 ? (
              <div className="text-sm text-gray-300/80 border border-white/10 rounded-xl p-4">
                No skill added yet.
              </div>
            ) : (
              <ul className="divide-y divide-white/10 border border-white/10 rounded-xl">
                {reqSkills.map((s) => (
                  <li key={s.skill_id} className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-white font-medium">{s.name}</div>
                        {editingId === s.skill_id ? (
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                            <label className="text-gray-300/80">Level</label>
                            <select
                              value={editLevel}
                              onChange={(e) => setEditLevel(Number(e.target.value))}
                              className="bg-white/5 border border-white/20 rounded px-2 py-1 text-white"
                            >
                              {[1,2,3,4,5].map(n => <option key={n} value={n}>Lv {n}</option>)}
                            </select>
                            <label className="text-gray-300/80">Years</label>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              value={editYears}
                              onChange={(e)=>setEditYears(Math.max(0, Number(e.target.value)||0))}
                              className="bg-white/5 border border-white/20 rounded px-2 py-1 w-24 text-white"
                            />
                            <button
                              onClick={saveEditSkill}
                              className="px-3 py-1 rounded bg-emerald-600 text-white"
                            >
                              Save
                            </button>
                            <button
                              onClick={()=>setEditingId(null)}
                              className="px-3 py-1 rounded border border-white/20 text-white/80"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-300/80 mt-1">
                            Lv {s.level ?? 1} • {s.years_exp ?? 0} yrs
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {editingId !== s.skill_id && (
                          <button
                            className="p-2 rounded hover:bg-white/10"
                            title="Edit"
                            onClick={()=>startEditSkill(s)}
                          >
                            <Pencil className="w-4 h-4 text-white/80" />
                          </button>
                        )}
                        <button
                          className="p-2 rounded hover:bg-white/10"
                          title="Remove"
                          onClick={()=>removeSkill(s.skill_id)}
                        >
                          <X className="w-4 h-4 text-white/80" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* PDF Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-200 mb-3">Upload PDF (Optional)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 text-center">
            <button
              onClick={handlePost}
              disabled={!isFormValid || loading}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold transition-all duration-300 ${
                !isFormValid || loading
                  ? 'bg-emerald-700/50 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {loading ? 'Posting...' : (<><Send className="w-5 h-5" /> Post Job</>)}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSkillModal && (
        <AddSkillRequirementModal
          onClose={() => setShowSkillModal(false)}
          onAdded={(row) => {
            setReqSkills(prev => {
              const has = prev.find(x => x.skill_id === row.skill_id);
              return has ? prev.map(x => x.skill_id === row.skill_id ? row : x) : [row, ...prev];
            });
            setShowSkillModal(false);
          }}
        />
      )}

      {showRegionModal && (
        <AddRegionModal
          onClose={() => setShowRegionModal(false)}
          onAdded={(r) => {
            setRegion(r);
            setShowRegionModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PostJob;

/** ------------ Skill Modal ------------ */
function AddSkillRequirementModal({ onClose, onAdded }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]); // [{skill_id,name}]
  const [pickingId, setPickingId] = useState(null);
  const [level, setLevel] = useState(1);
  const [years, setYears] = useState(0);

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

  const addOne = (opt) => {
    setPickingId(opt.skill_id);
    try {
      onAdded({ ...opt, level, years_exp: years });
    } finally {
      setPickingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[92vw] max-w-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Add Required Skill</h3>
          <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}>Close</button>
        </div>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Search skills…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />

        <div className="flex items-center gap-3 mb-3">
          <label className="text-sm text-gray-700">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="p-2 border rounded"
          >
            {[1,2,3,4,5].map(n => <option key={n} value={n}>Lv {n}</option>)}
          </select>

          <label className="text-sm text-gray-700">Years</label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={years}
            onChange={(e)=>setYears(Math.max(0, Number(e.target.value)||0))}
            className="p-2 border rounded w-24"
          />
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : options.length === 0 ? (
          <div className="text-sm text-gray-500">No results</div>
        ) : (
          <ul className="max-h-72 overflow-auto divide-y">
            {options.map(opt => (
              <li key={opt.skill_id} className="flex items-center justify-between py-2">
                <span className="text-sm">{opt.name}</span>
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
                  disabled={pickingId === opt.skill_id}
                  onClick={() => addOne(opt)}
                >
                  {pickingId === opt.skill_id ? "Adding..." : "Add"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** ------------ Region Modal ------------ */
function AddRegionModal({ onClose, onAdded }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [pickingId, setPickingId] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await LocationApi.searchCatalog(q);
        setOptions(res.data || []);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const addOne = (opt) => {
    setPickingId(opt.region_id);
    try {
      onAdded(opt);
    } finally {
      setPickingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-[92vw] max-w-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Select Region</h3>
          <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={onClose}>Close</button>
        </div>

        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Search regions…"
          value={q}
          onChange={(e)=>setQ(e.target.value)}
        />

        {loading ? (
          <div className="text-sm text-gray-500">Loading…</div>
        ) : options.length === 0 ? (
          <div className="text-sm text-gray-500">No results</div>
        ) : (
          <ul className="max-h-72 overflow-auto divide-y">
            {options.map(opt => (
              <li key={opt.region_id} className="flex items-center justify-between py-2">
                <span className="text-sm">{opt.name}</span>
                <button
                  className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-60"
                  disabled={pickingId === opt.region_id}
                  onClick={() => addOne(opt)}
                >
                  {pickingId === opt.region_id ? "Selecting..." : "Select"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
