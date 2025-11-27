import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  MapPin,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ApplicationApi from '../api/ApplicationApi';

const SeekerApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    const fetchApplications = async () => {
      try {
        const res = await ApplicationApi.getApplicationList();
        const raw = res?.data ?? res;

        console.log('Raw /application_list:', raw);

        let jobsData = [];

        if (raw && Array.isArray(raw.result)) {
          jobsData = raw.result;
        } else if (Array.isArray(raw)) {
          jobsData = raw;
        } else {
          console.error('Unexpected data format:', raw);
          throw new Error('Invalid data format received');
        }

        setJobs(jobsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch jobs:', err);

        let msg = 'Failed to load jobs';

        if (err.response) {
          msg = `Server Error: ${err.response.status}`;
        } else if (err.request) {
          msg = 'Network error - backend not reachable';
        } else {
          msg = err.message || 'Unknown error';
        }

        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);
const handleDelete = async (applicationId, e) => {
  e.stopPropagation();

  if (!applicationId) {
    console.error("Missing application_id:", applicationId);
    return alert("Missing application id");
  }

  const confirmDelete = window.confirm("Are you sure?");
  if (!confirmDelete) return;

  try {
    await ApplicationApi.deleteapply(applicationId);

    // remove from frontend
    setJobs(prev => prev.filter(j => j.application_id !== applicationId));

  } catch (err) {
    console.error("Failed to delete application:", err);
    alert("Delete failed");
  }
};


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="text-gray-600">Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">Error</h3>
          </div>
          <p className="mt-2 text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  const handleJobClick = (job) => {
    const id = job.id ?? job.job_id;
    if (!id) {
      console.warn('Job has no id, cannot navigate:', job);
      return;
    }
    navigate(`/jobs/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Jobs You Applied To</h1>
        <p className="text-gray-600 mt-2">
          Click a job to view its details (when id is available).
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No jobs found
          </h3>
          <p className="mt-1 text-gray-500">
            Apply for a job to see it listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div
              key={job.id ?? job.job_id ?? index}
              onClick={() => handleJobClick(job)}
              className={`bg-white shadow rounded-lg p-5 hover:shadow-md transition ${
                job.id || job.job_id ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-cen.mapter gap-2">
                <Briefcase className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-800">
                  {job.title || 'No title'}
                </h2>
              </div>

              <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-3">
                {job.location && (
                  <span className="inline-flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                  </span>
                )}
              </div>

              {job.description && (
                <p className="mt-3 text-sm text-gray-700">
                  {job.description}
                </p>
              )}
              {job.name && (
                <p className="mt-3 text-sm text-gray-700">
                  {job.name}
                </p>
              )}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={(e) => handleDelete(job.application_id ?? job.id ?? job.job_id, e)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete Application
                </button>
              </div>


              {!job.id && !job.job_id && (
                <p className="mt-2 text-xs text-gray-400">
                  (No job id in API, cannot open details page)
                </p>
              )}
            </div>
              
          ))}
        </div>
        
      )}
    </div>
  );
};

export default SeekerApplications;
