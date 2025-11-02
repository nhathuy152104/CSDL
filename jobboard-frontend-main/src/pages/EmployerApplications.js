import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  User, 
  Mail, 
  ChevronDown, 
  Check, 
  X, 
  Clock as PendingIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EmployerApplications = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [statusUpdates, setStatusUpdates] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'employer') {
      setError('Only employers can view applications');
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication required');

        const res = await axios.get('http://localhost:5000/api/applications/my-applications', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        });

        if (!res.data || !Array.isArray(res.data)) {
          throw new Error('Invalid data format received');
        }

        setJobs(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch applications:', err);

        let errorMessage = 'Failed to load applications';
        if (err.response) {
          switch (err.response.status) {
            case 401:
              errorMessage = 'Session expired, please login again';
              localStorage.removeItem('token');
              navigate('/login');
              break;
            case 403:
              errorMessage = 'Only employers can view applications';
              break;
            case 404:
              errorMessage = 'No applications found';
              break;
            default:
              errorMessage = `Server error: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = 'Network error - please check your connection';
        } else {
          errorMessage = err.message || 'Application error';
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [navigate]);

  const handleStatusUpdate = async (jobId, applicantId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');

      setStatusUpdates(prev => ({ ...prev, [`${jobId}-${applicantId}`]: true }));

      await axios.put(
        `http://localhost:5000/api/applications/${jobId}/update-status/${applicantId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      setJobs(prevJobs =>
        prevJobs.map(job =>
          job._id === jobId
            ? {
                ...job,
                applicants: job.applicants.map(applicant =>
                  applicant._id === applicantId
                    ? { ...applicant, status }
                    : applicant
                ),
              }
            : job
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);

      let errorMessage = 'Failed to update status';
      if (err.response?.status === 401) {
        errorMessage = 'Session expired, please login again';
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 404) {
        errorMessage = 'Application not found';
      }

      alert(errorMessage);
    } finally {
      setStatusUpdates(prev => ({ ...prev, [`${jobId}-${applicantId}`]: false }));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <PendingIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        <p className="text-gray-600">Loading applications...</p>
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
          {error.includes('login') && (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Go to Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Applications Management</h1>
        <p className="text-gray-600 mt-2">Review and manage job applications</p>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications yet</h3>
          <p className="mt-1 text-gray-500">Applications for your jobs will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map(job => (
            <div key={job._id} className="bg-white shadow rounded-lg overflow-hidden transition-all hover:shadow-md">
              <div
                className="px-6 py-4 border-b cursor-pointer flex justify-between items-center hover:bg-gray-50"
                onClick={() => setSelectedJob(selectedJob === job._id ? null : job._id)}
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                  <a
                    href={`http://localhost:5000/api/jobs/${job._id}/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 underline mt-1 inline-block"
                  >
                    Download Job PDF
                  </a>
                  <div className="flex items-center mt-1 text-gray-600">
                    <span>{job.applicants.length} applicant{job.applicants.length !== 1 ? 's' : ''}</span>
                    {job.company && (
                      <span className="ml-4 before:content-['•'] before:mr-2">
                        {job.company}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronDown className={`transition-transform ${selectedJob === job._id ? 'rotate-180' : ''}`} />
              </div>

              {selectedJob === job._id && (
                <div className="divide-y">
                  {job.applicants.map(applicant => (
                    <div key={applicant._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                          <p className="text-gray-500 flex items-center mt-1">
                            <Mail className="w-4 h-4 mr-2" />
                            {applicant.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center min-w-[120px]">
                          {getStatusIcon(applicant.status)}
                          <span className="ml-2 text-sm capitalize">
                            {applicant.status || 'pending'}
                          </span>
                        </div>

                        {statusUpdates[`${job._id}-${applicant._id}`] ? (
                          <div className="text-sm text-gray-500 flex items-center">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Updating...
                          </div>
                        ) : (
                          <div className="relative min-w-[180px]">
                            <select
                              value={applicant.status || ''}
                              onChange={(e) => {
                                if (e.target.value) {
                                  setStatusUpdates(prev => ({
                                    ...prev,
                                    [`${job._id}-${applicant._id}`]: true
                                  }));
                                  handleStatusUpdate(job._id, applicant._id, e.target.value);
                                }
                              }}
                              className="appearance-none bg-gray-100 border border-gray-300 rounded-md py-2 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                            >
                              <option value="">Change Status</option>
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployerApplications;
