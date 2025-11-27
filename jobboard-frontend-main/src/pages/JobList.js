  import React, { useEffect, useState } from 'react';
  import { Briefcase, MapPin, Clock, Search, Filter, Star, Heart, X } from 'lucide-react';
  import jobApi from '../api/jobApi';
  import skillApi from '../api/skillApi';
  import ApplicationApi from '../api/ApplicationApi';
  import { useNavigate } from "react-router-dom";
  import LocationApi from '../api/LocationApi';

  const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [appliedJobs, setAppliedJobs] = useState(new Set());
    const [favoriteJobs, setFavoriteJobs] = useState(new Set());
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Skill filter
    const [skillModalOpen, setSkillModalOpen] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState([]); // [{skill_id, name}, ...]
    const [skillFiltering, setSkillFiltering] = useState(false);

    // Modal / CV upload
    const [applyModalOpen, setApplyModalOpen] = useState(false);
    const [applyJobId, setApplyJobId] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [cvError, setCvError] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
      const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
      window.addEventListener('mousemove', onMove);
      return () => window.removeEventListener('mousemove', onMove);
    }, []);

    useEffect(() => {
      (async () => {
        try {
          const res = await jobApi.getAll();           
          const data = res.data;
          const list = Array.isArray(data) ? data : (data?.jobs ?? []);
          setJobs(list);
        } catch (err) {
          console.error('Fetch jobs error:', err?.message || err);
          setJobs([]);
        } finally {
          setLoading(false);
        }
      })();
    }, []);

    // Apply skill filter by calling backend /by-skill
    const applySkillFilter = async (skills = selectedSkills) => {
      const ids = (skills || []).map(s => s.skill_id);
      if (!ids.length) {
        setLoading(true);
        try {
          const res = await jobApi.getAll();
          const data = res.data;
          setJobs(Array.isArray(data) ? data : (data?.jobs ?? []));
        } catch (err) {
          console.error(err);
          setJobs([]);
        } finally {
          setLoading(false);
        }
        return;
      }

      setSkillFiltering(true);
      try {
        // jobApi.getBySkill(ids) must exist and accept array
        const res = await jobApi.getBySkill(ids);
        const data = res.data;
        setJobs(Array.isArray(data) ? data : (data?.jobs ?? []));
      } catch (err) {
        console.error('getBySkill error:', err?.response?.data || err?.message || err);
        setJobs([]);
      } finally {
        setSkillFiltering(false);
        setSkillModalOpen(false);
      }
    };

    const clearSkillFilter = async () => {
      setSelectedSkills([]);
      await applySkillFilter([]);
    };

    // Apply CV modal
    const onApplyClick = (id) => {
      setApplyJobId(id);
      setCvFile(null);
      setCvError("");
      setApplyModalOpen(true);
    };

    const handleFileChange = (e) => {
      const file = e.target.files?.[0] ?? null;
      if (!file) { setCvFile(null); setCvError(""); return; }
      const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxMB = 5;
      if (!allowed.includes(file.type)) { setCvError('Only PDF/DOC/DOCX are allowed.'); setCvFile(null); return; }
      if (file.size > maxMB * 1024 * 1024) { setCvError(`File must be smaller than ${maxMB} MB.`); setCvFile(null); return; }
      setCvError(''); setCvFile(file);
    };

    const submitCvAndApply = async (e) => {
      e.preventDefault();
      if (!applyJobId) return;
      if (!cvFile) { setCvError('Please choose a CV file.'); return; }

      setUploading(true);
      setCvError("");
      try {
        await ApplicationApi.applyWithCV(applyJobId, cvFile);
        setAppliedJobs(prev => new Set([...prev, applyJobId]));
        setApplyModalOpen(false);
        setApplyJobId(null);
        setCvFile(null);
        alert('✅ Successfully applied with your CV!');
      } catch (err) {
        console.error('Apply with CV error:', err);
        const detail = err?.response?.data?.detail || err?.message || 'Apply failed';
        setCvError(String(detail));
      } finally { setUploading(false); }
    };

    const toggleFavorite = (id) => {
      setFavoriteJobs(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
    };

    const filteredJobs = jobs.filter((job) => {
      const title = (job.title || '').toString();
      const company = (job.company?.name ?? job.company ?? '').toString();
      const location = (job.location || '').toString();

      const matchesSearch =
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLocation =
        !locationFilter || location.toLowerCase().includes(locationFilter.toLowerCase());

      return matchesSearch && matchesLocation;
    });

    const backgroundStyle = {
      background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.3) 0%, rgba(16,185,129,0.2) 25%, rgba(139,92,246,0.1) 50%, transparent 70%)`,
    };

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading jobs...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0" style={backgroundStyle}></div>

        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-500/20 rounded-2xl">
                <Briefcase className="w-8 h-8 text-blue-400" />
              </div>
              <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                Job Listings
              </h2>
              <Star className="w-8 h-8 text-yellow-400 animate-pulse" />
            </div>
            <p className="text-gray-300/80 text-lg">Discover your next career opportunity</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full md:w-64 pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSkillModalOpen(true)}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:scale-105"
              >
                Filter{selectedSkills.length > 0 ? `(${selectedSkills.length})` : ''}
              </button>
              <button
                onClick={clearSkillFilter}
                className="px-4 py-3 bg-white/5 text-white rounded-xl hover:scale-105"
              >
                Clear Skills
              </button>
            </div>
          </div>

          {/* Job Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredJobs.length === 0 && (
              <p className="text-white text-center col-span-full">No jobs found</p>
            )}
            {filteredJobs.map((job) => {
              const id = job.id ?? job.job_id; // support both shapes
              const companyName = job.company?.name ?? job.company ?? '—';
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/jobs/${id}`)}
                  onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/jobs/${id}`) : null)}
                  className="p-6 rounded-3xl bg-white/10 border border-white/20 shadow-2xl flex flex-col justify-between cursor-pointer hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white line-clamp-1">{job.title}</h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(id); }}
                        aria-label="Toggle favorite"
                      >
                        <Heart className={`w-5 h-5 ${favoriteJobs.has(id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{job.description}</p>
                    <div className="flex gap-4 text-gray-300 text-sm">
                      <span><MapPin className="inline w-4 h-4 mr-1" /> {job.location}</span>
                      <span><Clock className="inline w-4 h-4 mr-1" /> Posted recently</span>
                      <span>Company: {companyName}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); onApplyClick(id); }}
                    disabled={appliedJobs.has(id)}
                    className={`mt-4 py-3 rounded-xl font-semibold text-white w-full ${
                      appliedJobs.has(id)
                        ? 'bg-emerald-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105'
                    }`}
                  >
                    {appliedJobs.has(id) ? '✅ Applied' : '📤 One-Click Apply'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal for uploading CV */}
        {applyModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => { if (!uploading) { setApplyModalOpen(false); setCvFile(null); setCvError(''); } }}
            />

            <div className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-2">Attach your CV</h3>
              <p className="text-sm text-gray-600 mb-4">Upload a PDF, DOC or DOCX file (max 5 MB).</p>

              <form onSubmit={submitCvAndApply} className="space-y-4">
                <div>
                  <input
                    id="cv-file"
                    type="file"
                    accept=".pdf,.doc,.docx,application/msword,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="block w-full"
                  />
                  {cvFile && <div className="text-sm text-gray-700 mt-2">Selected: {cvFile.name} ({Math.round(cvFile.size / 1024)} KB)</div>}
                  {cvError && <div className="text-sm text-red-600 mt-2">{cvError}</div>}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { if (!uploading) { setApplyModalOpen(false); setCvFile(null); setCvError(''); } }}
                    className="px-4 py-2 rounded-md border"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${uploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : 'Submit & Apply'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Skill filter modal */}
        {skillModalOpen && (
          <SkillFilterModal
            initial={selectedSkills}
            onClose={() => setSkillModalOpen(false)}
            onApply={(picked) => {
              setSelectedSkills(picked);
              applySkillFilter(picked);
            }}
          />
        )}
      </div>
    );
  };

  export default JobList;

  /* ---------------- SkillFilterModal ---------------- */
  function SkillFilterModal({ initial = [], onClose, onApply }) {
    const [q, setQ] = useState('');
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [picked, setPicked] = useState(initial);

    useEffect(() => setPicked(initial), [initial]);

    useEffect(() => {
      const t = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await skillApi.searchCatalog(q);
          setOptions(res.data || []);
        } catch (err) {
          console.error('skill search', err);
          setOptions([]);
        } finally { setLoading(false); }
      }, 200);
      return () => clearTimeout(t);
    }, [q]);
    useEffect(() => {
      const t = setTimeout(async () => {
        setLoading(true);
        try {
          const res = await LocationApi.searchCatalog(q);
          setOptions(res.data || []);
        } catch (err) {
          console.error('location search', err);
          setOptions([]);
        } finally { setLoading(false); }
      }, 200);
      return () => clearTimeout(t);
    }, [q]);

    const togglePick = (opt) => {
      setPicked(prev => {
        const exists = prev.find(x => x.skill_id === opt.skill_id);
        return exists ? prev.filter(x => x.skill_id !== opt.skill_id) : [opt, ...prev];
      });
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-[92vw] max-w-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">Filter by Skills</h3>
            <button className="px-2 py-1 rounded" onClick={onClose}>Close</button>
          </div>

          <input
            className="w-full p-2 border rounded mb-3"
            placeholder="Search skills…"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />

          <div className="mb-3">
            <div className="text-sm font-medium mb-2">Selected</div>
            {picked.length === 0 ? (
              <div className="text-sm text-gray-500">No skills selected</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {picked.map(s => (
                  <div key={s.skill_id} className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center gap-2">
                    <span>{s.name}</span>
                    <button onClick={() => togglePick(s)}><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="max-h-64 overflow-auto divide-y">
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : options.length === 0 ? (
              <div className="text-sm text-gray-500">No results</div>
            ) : (
              options.map(opt => {
                const pickedAlready = picked.find(x => x.skill_id === opt.skill_id);
                return (
                  <div key={opt.skill_id} className="flex items-center justify-between py-2">
                    <div>{opt.name}</div>
                    <button
                      className={`px-3 py-1 rounded text-sm ${pickedAlready ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}
                      onClick={() => togglePick(opt)}
                    >
                      {pickedAlready ? 'Selected' : 'Select'}
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="flex justify-end gap-3 mt-3">
            <button onClick={() => setPicked([])} className="px-3 py-1 rounded border">Clear</button>
            <button
              onClick={() => onApply(picked)}
              className="px-4 py-2 rounded bg-indigo-600 text-white"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  }
