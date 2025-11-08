import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, Search, Filter, Star, Heart } from 'lucide-react';
import jobApi from '../api/jobApi';
import { useNavigate } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [favoriteJobs, setFavoriteJobs] = useState(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const onMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await jobApi.getAll();            // GET /api/job/
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

  const handleApply = async (id) => {
    try {
      await jobApi.apply(id);
      setAppliedJobs((prev) => new Set([...prev, id]));
      alert('✅ Successfully applied!');
    } catch (err) {
      console.error('Apply error:', err?.message || err);
      alert('❌ Application failed');
    }
  };

  const toggleFavorite = (id) => {
    setFavoriteJobs((prev) => {
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
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:scale-105 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </button>
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
                onClick={() => navigate(`/jobs/${id}`)} // 👉 go to detail page
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
                  onClick={(e) => { e.stopPropagation(); handleApply(id); }}
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
    </div>
  );
};

export default JobList;
