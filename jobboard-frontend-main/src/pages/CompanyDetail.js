// src/pages/CompanyDetail.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import companyApi from "../api/companyApi";
import jobApi from "../api/jobApi";
import ApplicationApi from "../api/ApplicationApi";

export default function CompanyDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [applyingId, setApplyingId] = useState(null);      // job currently applying
  const [appliedJobs, setAppliedJobs] = useState(new Set()); // local applied state

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // load company + jobs in parallel
        const [companyRes, jobsRes] = await Promise.all([
          companyApi.detail(id),
          jobApi.getInCompany(id),
        ]);

        setC(companyRes.data || null);

        // jobsRes may be array or { jobs: [] }
        const arr = Array.isArray(jobsRes.data)
          ? jobsRes.data
          : jobsRes.data?.jobs ?? [];
        setJobs(arr);
      } catch (e) {
        console.error(e);
        setC(null);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleApply = async (jobId) => {
    if (appliedJobs.has(jobId)) return; 

    try {
      setApplyingId(jobId);
      await ApplicationApi.apply(jobId); 

      setAppliedJobs((prev) => {
        const next = new Set(prev);
        next.add(jobId);
        return next;
      });

      alert("✅ Applied to this job!");
    } catch (e) {
      console.error(e);
      alert("❌ Could not apply to this job.");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) return <div className="p-4">Loading…</div>;
  if (!c) return <div className="p-4">Not found.</div>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Company header */}
      <div className="flex items-center gap-4">
        {c.logo_url && (
          <img src={c.logo_url} alt="" className="w-16 h-16 rounded" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">{c.name}</h1>
          <div className="text-sm text-gray-500">
            {c.industry} • {c.size} • {c.location}
          </div>
          {c.website && (
            <a
              href={c.website}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600"
            >
              Website
            </a>
          )}
        </div>
      </div>

      {c.about && (
        <p className="mt-4 whitespace-pre-line">
          {c.about}
        </p>
      )}

      {/* Jobs list */}
      <h2 className="text-lg font-semibold mt-6">Open Jobs</h2>
      {jobs.length === 0 ? (
        <div className="text-sm text-gray-500">No openings.</div>
      ) : (
        <ul className="divide-y">
          {jobs.map((j) => {
            const isApplied = appliedJobs.has(j.id);
            const isLoading = applyingId === j.id;

            return (
              <li key={j.id} className="py-3 flex flex-col gap-2">
                <div>
                  <div className="font-medium">{j.title}</div>
                  <div className="text-sm text-gray-500">
                    {j.location} • {j.employment_type || j.type}
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <Link
                    to={`/jobs/${j.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View job
                  </Link>

                  <button
                    onClick={() => handleApply(j.id)}
                    disabled={isApplied || isLoading}
                    className="px-3 py-1.5 rounded-md text-sm font-medium text-white
                               bg-emerald-600 hover:bg-emerald-700
                               disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isApplied
                      ? "Applied"
                      : isLoading
                      ? "Applying..."
                      : "Apply"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
