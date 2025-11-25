// src/pages/CandidateDashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ApplicationApi from "../api/ApplicationApi";
import axiosClient from "../api/axiosClient"; // make sure this exists and attaches auth if needed
import { Loader2, User, AlertTriangle } from "lucide-react";

const CandidateDashboard = () => {
  const { id: jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // all | waiting | accepted | rejected

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await ApplicationApi.getCandidateList(jobId);
        // normalize shape: res.data.result or res.data.candidates or res.data (defensive)
        const rawList =
          Array.isArray(res.data?.result)
            ? res.data.result
            : Array.isArray(res.data?.candidates)
            ? res.data.candidates
            : Array.isArray(res.data)
            ? res.data
            : [];

        const list = rawList.map((a) => ({
          id: a.application_id ?? a.id ?? a.applicationId ?? null,
          user_id: a.user_id ?? a.userId ?? a.uid ?? null,
          full_name: a.full_name ?? a.name ?? a.fullName ?? a.username ?? "",
          email: a.email ?? "",
          phone: a.phone ?? "",
          status: a.status ?? "submitted",
          skills: a.skills ?? a.skill_list ?? null,
          cv_path: a.cv_path ?? a.cv ?? a.resume ?? null,
        }));

        setApplications(list);
      } catch (e) {
        console.error(e);
        setErr("Could not load candidates for this job.");
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchApplications();
    } else {
      setLoading(false);
      setApplications([]);
    }
  }, [jobId]);

  const handleUpdateStatus = async (applicationId, action) => {
    try {
      setActionLoadingId(applicationId);
      setErr("");

      await ApplicationApi.updateStatus(applicationId, action);

      const newStatus =
        action === "accept"
          ? "interview"
          : action === "reject"
          ? "rejected"
          : "submitted";

      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
    } catch (e) {
      console.error(e);
      setErr("Failed to update status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // open CV in new tab (simple). If your CV endpoint requires auth via header
  // the direct link might return 401; in that case openCvWithAuth will fetch blob with axios.
  const openCv = (cvPath) => {
    if (!cvPath) return;
    const url = `/application/cv/${cvPath}`;
    // Try to open directly first (fast, browser preview)
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (!win) {
      // popup blocked — fallback to programmatic fetch + blob open
      openCvWithAuth(cvPath);
    }
  };

  // Fetch via axios and open blob — useful when endpoint needs Authorization header
  const openCvWithAuth = async (cvPath, suggestedName = "cv.pdf") => {
    try {
      const res = await axiosClient.get(`/application/cv/${cvPath}`, {
        responseType: "blob",
      });
      const blob = res.data;
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) {
        // If popup blocked, download instead
        const a = document.createElement("a");
        a.href = url;
        a.download = suggestedName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      console.error("Failed to fetch CV with auth:", e);
      setErr("Unable to open CV (permission or server error).");
    }
  };

  const renderCard = (app) => (
    <div
      key={app.id}
      className="p-5 border border-gray-200 rounded-xl bg-white shadow-md"
    >
      {/* Header: icon + name */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
          <User className="w-4 h-4 text-blue-500" />
        </div>
        <span className="font-semibold text-lg text-gray-900">
          {app.full_name || "Unnamed candidate"}
        </span>
      </div>

      {/* Info */}
      <div className="space-y-1 text-sm">
        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Email:</span>{" "}
          {app.email || "No email"}
        </p>

        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Phone:</span>{" "}
          {app.phone || "No phone"}
        </p>

        <p className="text-gray-700">
          <span className="font-medium text-gray-900">Status:</span>{" "}
          <span
            className={
              app.status === "interview"
                ? "text-green-600 font-semibold"
                : app.status === "rejected"
                ? "text-red-600 font-semibold"
                : "text-gray-700"
            }
          >
            {app.status || "submitted"}
          </span>
        </p>

        {/* ✅ Skills block (optional, only if exists) */}
        {app.skills && (
          <p className="text-gray-700">
            <span className="font-medium text-gray-900">Skills:</span>{" "}
            {Array.isArray(app.skills) ? app.skills.join(", ") : app.skills}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4 items-center">
        <button
          onClick={() => handleUpdateStatus(app.id, "accept")}
          disabled={actionLoadingId === app.id}
          className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed
                     px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition"
        >
          {actionLoadingId === app.id ? "Processing…" : "Accept"}
        </button>

        <button
          onClick={() => handleUpdateStatus(app.id, "reject")}
          disabled={actionLoadingId === app.id}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed
                     px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition"
        >
          {actionLoadingId === app.id ? "Processing…" : "Reject"}
        </button>

        {/* View CV */}
        {app.cv_path ? (
          <button
            onClick={() => openCv(app.cv_path)}
            className="ml-auto px-3 py-2 rounded-lg border text-sm text-gray-700 hover:bg-gray-50"
          >
            View CV
          </button>
        ) : (
          <span className="ml-auto text-sm text-gray-400">No CV</span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-700 mt-8 justify-center">
        <Loader2 className="w-5 h-5 animate-spin" /> Loading candidates…
      </div>
    );
  }

  if (err) {
    return (
      <div className="flex items-center gap-2 text-red-600 mt-8 justify-center">
        <AlertTriangle className="w-5 h-5" /> {err}
      </div>
    );
  }

  if (!jobId) {
    return (
      <div className="max-w-3xl mx-auto mt-8 border border-gray-200 bg-white p-6 rounded-xl shadow-sm text-gray-800">
        No job selected. Open this page from a job card’s <b>Candidates</b> button.
      </div>
    );
  }

  // Split data
  const all = applications;
  const waiting = applications.filter((a) => a.status === "submitted" || !a.status);
  const accepted = applications.filter((a) => a.status === "interview");
  const rejected = applications.filter((a) => a.status === "rejected");

  let listToShow = all;
  if (activeTab === "waiting") listToShow = waiting;
  if (activeTab === "accepted") listToShow = accepted;
  if (activeTab === "rejected") listToShow = rejected;

  const emptyMessages = {
    all: "No candidates.",
    waiting: "No waiting (submitted) candidates.",
    accepted: "No accepted (interview) candidates.",
    rejected: "No rejected candidates.",
  };

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Candidates for job #{jobId}
      </h2>

      {/* Navbar / Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition
            ${
              activeTab === "all"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          All ({all.length})
        </button>

        <button
          onClick={() => setActiveTab("waiting")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition
            ${
              activeTab === "waiting"
                ? "bg-yellow-500 text-white border-yellow-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          Waiting ({waiting.length})
        </button>

        <button
          onClick={() => setActiveTab("accepted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition
            ${
              activeTab === "accepted"
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          Accepted ({accepted.length})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition
            ${
              activeTab === "rejected"
                ? "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          Rejected ({rejected.length})
        </button>
      </div>

      {/* List for current tab */}
      <div className="space-y-4">
        {listToShow.length > 0 ? (
          listToShow.map(renderCard)
        ) : (
          <p className="text-gray-600">{emptyMessages[activeTab]}</p>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;
