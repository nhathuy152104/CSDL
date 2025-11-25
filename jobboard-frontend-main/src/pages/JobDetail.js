import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Star,
  Heart,
  ExternalLink,
  Loader2,
} from "lucide-react";
import jobApi from "../api/jobApi";          // getAll({ page, limit, q, location }), getById(id), apply(id)
import profileApi from "../api/profileApi";  // getMyCV()
import ApplicationApi from "../api/ApplicationApi";

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [favorite, setFavorite] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);

  const [cv, setCv] = useState(null);
  const [cvLoading, setCvLoading] = useState(false);

  const listRef = useRef(null);

  // ---------- helpers ----------
  const formatSalary = (job) => {
    const min = job.salary_min;
    const max = job.salary_max;
    if (min && max) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `From ${min.toLocaleString()}`;
    if (max) return `Up to ${max.toLocaleString()}`;
    return "Negotiable";
  };

  const formatType = (t) => {
    if (!t) return "—";
    return String(t)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()); // full_time -> Full Time
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  // ---------- Load initial jobs & on search ----------
  useEffect(() => {
    let ignore = false;

    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await jobApi.getAll({ page: 1, limit: 30, q, location });
        const arr = Array.isArray(res?.data)
          ? res.data
          : res?.data?.jobs ?? [];

        if (!ignore) {
          setJobs(arr);
          setPage(1);
          const total = res?.data?.total ?? arr.length;
          setHasMore(total > arr.length);

          // preselect first job
          if (arr.length) {
            const firstId = arr[0].id ?? arr[0].job_id;
            setSelectedJobId(firstId);
          } else {
            setSelectedJobId(null);
            setSelectedJob(null);
          }
        }
      } catch (e) {
        if (!ignore) {
          console.error("Jobs load error", e);
          setJobs([]);
          setHasMore(false);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchPage();
    return () => {
      ignore = true;
    };
  }, [q, location]);

  // ---------- Infinite scroll ----------
  const loadMore = async () => {
    if (!hasMore || loading) return;
    try {
      const next = page + 1;
      setLoading(true);
      const res = await jobApi.getAll({ page: next, limit: 30, q, location });
      const arr = Array.isArray(res?.data)
        ? res.data
        : res?.data?.jobs ?? [];

      setJobs((prev) => [...prev, ...arr]);
      setPage(next);

      const total = res?.data?.total;
      if (typeof total === "number") {
        setHasMore((prevJobs) => prevJobs + arr.length < total);
      } else {
        setHasMore(arr.length > 0);
      }
    } catch (e) {
      console.error("Load more error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    el.appendChild(sentinel);

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore();
          }
        });
      },
      { root: el, threshold: 1 }
    );

    io.observe(sentinel);

    return () => {
      io.disconnect();
      sentinel.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, page]);

  // ---------- Load selected job detail ----------
  useEffect(() => {
    if (!selectedJobId) return;
    let ignore = false;

    const run = async () => {
      setJobLoading(true);
      try {
        const res = await jobApi.getById(selectedJobId);
        const job = res?.data ?? null;
        if (!ignore) setSelectedJob(job);
      } catch (e) {
        if (!ignore) {
          console.error("Job detail error", e);
          setSelectedJob(null);
        }
      } finally {
        if (!ignore) setJobLoading(false);
      }
    };

    run();
    return () => {
      ignore = true;
    };
  }, [selectedJobId]);

  // ---------- Load my CV once ----------
  useEffect(() => {
    let ignore = false;
    (async () => {
      setCvLoading(true);
      try {
        const res = await profileApi.getMyCV();
        if (!ignore) setCv(res?.data ?? null);
      } catch (e) {
        if (!ignore) console.error("CV load error", e);
      } finally {
        if (!ignore) setCvLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ---------- Quick match logic ----------
  const matchHints = useMemo(() => {
    if (!selectedJob || !cv) return [];
    const text = `${selectedJob?.title ?? ""} ${
      selectedJob?.description ?? ""
    }`.toLowerCase();
    const skills = (cv.skills ?? [])
      .map((s) => (typeof s === "string" ? s : s.name))
      .filter(Boolean);
    const hits = skills
      .filter((s) => text.includes(String(s).toLowerCase()))
      .slice(0, 8);
    return hits;
  }, [selectedJob, cv]);

  const toggleFav = (id) => {
    setFavorite((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApply = async (jobId) => {
    if (!jobId) return;
    // prevent double submit
    if (appliedJobs.has(jobId)) {
      alert("You already applied to this job.");
      return;
    }

    try {
      await ApplicationApi.apply(jobId);
      setAppliedJobs((prev) => new Set(prev).add(jobId));
      alert("✅ Applied!");
    } catch (e) {
      console.error(e);
      alert("❌ Apply failed");
    }
  };

  const isApplied = (jobId) => appliedJobs.has(jobId);

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70 bg-slate-900/60 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-2xl">
            <Briefcase className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold">Jobs for You</h1>
          <Star className="w-5 h-5 text-yellow-400 ml-auto" />
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search jobs, companies..."
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            />
          </div>
          <div className="md:col-span-4 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content: left list / right detail */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 py-6">
        {/* LEFT: list */}
        <div className="lg:col-span-5 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div
            ref={listRef}
            className="max-h-[80vh] overflow-auto divide-y divide-white/10"
          >
            {jobs.map((j) => {
              const id = j.id ?? j.job_id;
              const active = id === selectedJobId;

              return (
                <button
                  key={id}
                  onClick={() => setSelectedJobId(id)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition grid grid-cols-12 gap-2 ${
                    active ? "bg-blue-500/10" : ""
                  }`}
                >
                  <div className="col-span-10">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">
                          {j.title}
                        </h3>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {formatType(j.type)}
                        </div>
                      </div>
                      <Heart
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFav(id);
                        }}
                        className={`w-4 h-4 ${
                          favorite.has(id)
                            ? "text-red-500 fill-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-2">
                      {j.description}
                    </p>
                    <div className="text-xs text-gray-400 flex flex-wrap items-center gap-3 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {j.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {j.postedAt ? `Posted ${formatDate(j.postedAt)}` : "Posted"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        💰 {formatSalary(j)}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-end">
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </div>
                </button>
              );
            })}
            {loading && (
              <div className="p-4 flex items-center gap-2 text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading...
              </div>
            )}
            {!hasMore && jobs.length > 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No more jobs
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: detail + CV */}
        <div className="lg:col-span-7 grid gap-4">
          {/* Job detail card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 min-h-[240px]">
            {jobLoading && (
              <div className="flex items-center gap-2 text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading job...
              </div>
            )}
            {!jobLoading && selectedJob && (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">{selectedJob.title}</h2>
                    <div className="text-sm text-gray-300 flex flex-wrap gap-3 mt-1">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {selectedJob.location}
                      </span>
                      <span>
                        Company:{" "}
                        {selectedJob.company?.name ??
                          selectedJob.company ??
                          "—"}
                      </span>
                      <span>Type: {formatType(selectedJob.type)}</span>
                      <span>Salary: {formatSalary(selectedJob)}</span>
                      {selectedJob.postedAt && (
                        <span>
                          Posted: {formatDate(selectedJob.postedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleApply(selectedJob.id ?? selectedJob.job_id)
                    }
                    disabled={isApplied(selectedJob.id ?? selectedJob.job_id)}
                    className={`px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {isApplied(selectedJob.id ?? selectedJob.job_id)
                      ? "Applied"
                      : "Apply"}
                  </button>
                </div>
                <div className="prose prose-invert mt-4 max-w-none">
                  <h4>Job Description</h4>
                  <p className="whitespace-pre-wrap">
                    {selectedJob.description}
                  </p>
                </div>
              </div>
            )}
            {!jobLoading && !selectedJob && (
              <p className="text-gray-400">
                Select a job from the list to view details.
              </p>
            )}
          </div>

          {/* CV + quick match */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your CV</h3>
              {cv && (
                <a
                  href={cv?.links?.[0]?.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-300 inline-flex items-center gap-1"
                >
                  View public profile <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            {cvLoading && (
              <div className="flex items-center gap-2 text-gray-300">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading CV...
              </div>
            )}
            {!cvLoading && cv && (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-2">
                    <div className="text-xl font-semibold">{cv.name}</div>
                    <div className="text-gray-300 text-sm">
                      {cv.headline}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {cv.email} · {cv.phone}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-1">
                      Top Skills
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(cv.skills ?? [])
                        .slice(0, 8)
                        .map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-lg bg-white/10 text-xs"
                          >
                            {typeof s === "string" ? s : s.name}
                          </span>
                        ))}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold mb-1">
                      Summary
                    </div>
                    <p className="text-sm text-gray-300 line-clamp-5">
                      {cv.summary}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2">
                    Quick Match with this Job
                  </div>
                  {selectedJob ? (
                    <div className="space-y-2">
                      {matchHints.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-emerald-300">
                          {matchHints.map((m, i) => (
                            <li key={i}>
                              Matches skill:{" "}
                              <span className="font-semibold">
                                {String(m)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-300">
                          No obvious skill matches found. Consider tailoring
                          skills/keywords.
                        </p>
                      )}
                      <div className="mt-4">
                        <button
                          onClick={() =>
                            handleApply(
                              selectedJob.id ?? selectedJob.job_id
                            )
                          }
                          disabled={isApplied(
                            selectedJob.id ?? selectedJob.job_id
                          )}
                          className="px-3 py-2 rounded-xl bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isApplied(selectedJob.id ?? selectedJob.job_id)
                            ? "Applied"
                            : "One-click Apply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      Select a job to see match hints.
                    </p>
                  )}

                  <div className="mt-4">
                    <div className="text-sm font-semibold mb-1">
                      Recent Experience
                    </div>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {(cv.experience ?? [])
                        .slice(0, 3)
                        .map((e, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2"
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-white/40" />
                            <span>
                              <span className="font-medium">
                                {e.role}
                              </span>{" "}
                              · {e.company}
                              <span className="block text-xs text-gray-400">
                                {e.start} — {e.end ?? "Present"}
                              </span>
                            </span>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
            {!cvLoading && !cv && (
              <div className="text-gray-400 text-sm">
                No CV found. Build your profile to get better matches.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
