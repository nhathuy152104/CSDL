// src/pages/CompanyJobs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Building2,
  Loader2,
  AlertTriangle,
  CalendarDays,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import jobApi from "../api/jobApi";

function formatDate(d) {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString();
}

// Safe string helper
const toStr = (v) => (typeof v === "string" ? v : v == null ? "" : String(v));

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "closed", label: "Closed" },
  { key: "draft", label: "Draft" },
];

export default function CompanyJobs() {
  const nav = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState("");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [tab, setTab] = useState("all");
  const [busyIds, setBusyIds] = useState(new Set()); // per-card spinners

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setFetchErr("");
        const res = await jobApi.getByCompany?.();
        const raw = res?.data;
        const list = Array.isArray(raw) ? raw : raw?.jobs ?? [];
        setJobs(list);
      } catch (e) {
        console.error(e);
        setFetchErr("Could not load your jobs.");
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      const title = toStr(j.title).toLowerCase();

      // company can be string or object; prefer name if present
      const companyRaw =
        j.company?.name ?? (typeof j.company === "string" ? j.company : "");
      const company = toStr(companyRaw).toLowerCase();

      const loc = toStr(j.location).toLowerCase();

      const statusRaw =
        (toStr(j.status) || toStr(j.state)) ||
        (j.is_open === false ? "closed" : "open");
      const status = toStr(statusRaw).toLowerCase();

      const okSearch =
        !search ||
        title.includes(search.toLowerCase()) ||
        company.includes(search.toLowerCase());

      const okLoc =
        !locationFilter ||
        loc.includes(locationFilter.toLowerCase());

      const okTab =
        tab === "all"
          ? true
          : tab === "open"
          ? status === "open"
          : tab === "closed"
          ? status === "closed"
          : tab === "draft"
          ? toStr(j.status).toLowerCase() === "draft"
          : true;

      return okSearch && okLoc && okTab;
    });
  }, [jobs, search, locationFilter, tab]);

  const removeJob = async (id) => {
    if (!window.confirm("Delete this job? This cannot be undone.")) return;
    setBusyIds((s) => new Set(s).add(id));
    const prev = jobs;
    setJobs((arr) => arr.filter((x) => (x.id ?? x.job_id) !== id));
    try {
      await jobApi.delete(id);
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
      setJobs(prev); // rollback
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  const togglePublish = async (job) => {
    const id = job.id ?? job.job_id;
    const isOpen =
      toStr(job.status).toLowerCase() === "open" ||
      job.is_open === true;

    setBusyIds((s) => new Set(s).add(id));
    const prev = jobs;
    setJobs((arr) =>
      arr.map((x) =>
        (x.id ?? x.job_id) === id
          ? {
              ...x,
              status: isOpen ? "closed" : "open",
              is_open: !isOpen,
            }
          : x
      )
    );
    try {
      if (isOpen) {
        if (jobApi.unpublish) await jobApi.unpublish(id);
      } else {
        if (jobApi.publish) await jobApi.publish(id);
      }
    } catch (e) {
      console.error(e);
      alert("Update status failed.");
      setJobs(prev);
    } finally {
      setBusyIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-2xl">
              <Briefcase className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Your Posted Jobs
              </h1>
              <p className="text-slate-500 text-sm">
                Only visible to your company account
              </p>
            </div>
          </div>

          {/* New Job → /post-job */}
          <button
            onClick={() => nav("/post-job")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            <Plus className="w-4 h-4" /> New Job
          </button>
        </div>

        {/* Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or company…"
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder="Filter by location…"
                className="w-56 pl-10 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUS_TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1 rounded-full text-sm border ${
                  tab === t.key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / Error / Empty */}
        {loading && (
          <div className="text-slate-700 flex items-center gap-2 mb-4">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading…
          </div>
        )}
        {!!fetchErr && !loading && (
          <div className="text-red-600 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5" /> {fetchErr}
          </div>
        )}
        {!loading && !fetchErr && filtered.length === 0 && (
          <div className="text-slate-700 border border-slate-200 rounded-2xl p-8 text-center bg-white shadow-sm">
            No jobs found. Click <b>New Job</b> to create your first posting.
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((job) => {
            const id = job.id ?? job.job_id;
            const companyName =
              job.company?.name ??
              (typeof job.company === "string" ? job.company : "Your company");
            const status =
              (job.status || job.state) ??
              (job.is_open === false ? "closed" : "open");
            const busy = busyIds.has(id);

            return (
              <div
                key={id}
                className="p-5 rounded-2xl bg-white border border-slate-200 text-slate-900 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="mt-1 text-sm text-slate-600 flex flex-wrap gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-4 h-4" /> {companyName}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {job.location || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" /> Expires:{" "}
                        {formatDate(job.expires_at)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      toStr(status).toLowerCase() === "open"
                        ? "bg-emerald-100 text-emerald-700"
                        : toStr(status).toLowerCase() === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {toStr(status).toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-slate-700 line-clamp-3">
                  {job.description}
                </p>

                <div className="mt-auto grid grid-cols-4 gap-2">
                  <button
                    onClick={() => nav(`/jobs/${id}`)}
                    className="col-span-1 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 text-sm text-slate-800"
                  >
                    <Eye className="w-4 h-4" /> View
                  </button>
                  <button
                    onClick={() => togglePublish(job)}
                    disabled={busy || !(jobApi.publish && jobApi.unpublish)}
                    title={
                      !(jobApi.publish && jobApi.unpublish)
                        ? "Publish API not implemented"
                        : ""
                    }
                    className="col-span-1 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 text-sm text-slate-800 disabled:opacity-50"
                  >
                    {(
                      toStr(job.status).toLowerCase() === "open" ||
                      job.is_open === true
                    ) ? (
                      <>
                        <ToggleLeft className="w-4 h-4" /> Close
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4" /> Open
                      </>
                    )}
                  </button>
                  {/* ✅ View Candidates */}
                  <button
                    onClick={() => nav(`/company/jobs/${id}/candidates`)}
                    className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1 text-sm text-slate-800"
                  >
                    <Users className="w-4 h-4" /> Cands
                  </button>
                  <button
                    onClick={() => removeJob(id)}
                    disabled={busy}
                    className="col-span-1 px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-1 text-sm disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}{" "}
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
  