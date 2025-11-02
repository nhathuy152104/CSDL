// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const EmployerDashboard = () => {
//   const [jobsWithApplicants, setJobsWithApplicants] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchApplications = async () => {
//       try {
//         const token = localStorage.getItem('token'); // Get JWT token
//         const response = await axios.get('http://localhost:5000/api/applications/my-applications', {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         setJobsWithApplicants(response.data.data); // Save jobs + applicants
//         setLoading(false);
//       } catch (err) {
//         console.error('Error fetching employer applications:', err);
//         setLoading(false);
//       }
//     };

//     fetchApplications();
//   }, []);

//   if (loading) {
//     return <p>Loading applications...</p>;
//   }

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">My Job Applications</h2>

//       {jobsWithApplicants.length === 0 ? (
//         <p>No job applications yet.</p>
//       ) : (
//         jobsWithApplicants.map((job) => (
//           <div key={job._id} className="border rounded p-4 mb-4">
//             <h3 className="text-xl font-semibold">{job.title}</h3>
//             <p className="text-gray-600 mb-2">Posted on: {new Date(job.createdAt).toLocaleDateString()}</p>

//             <h4 className="font-medium">Applicants:</h4>
//             {job.applicants.length === 0 ? (
//               <p>No applicants yet.</p>
//             ) : (
//               job.applicants.map((applicant) => (
//                 <div key={applicant._id} className="ml-4 mt-2">
//                   <p><strong>Name:</strong> {applicant.name}</p>
//                   <p><strong>Email:</strong> {applicant.email}</p>
//                   <p><strong>Status:</strong> {applicant.status || 'pending'}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EmployerDashboard;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const EmployerDashboard = () => {
//   const [jobsWithApplicants, setJobsWithApplicants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchApplications = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         setError('Authentication token not found. Please log in.');
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get(
//           'http://localhost:5000/api/applications/my-applications',
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );

//         setJobsWithApplicants(response.data.data || []);
//       } catch (err) {
//         console.error('Error fetching employer applications:', err);
//         const msg =
//           err.response?.data?.message || 'Failed to fetch job applications.';
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchApplications();
//   }, []);

//   if (loading) {
//     return <p className="text-gray-500">Loading applications...</p>;
//   }

//   if (error) {
//     return <p className="text-red-600">{error}</p>;
//   }

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">My Job Applications</h2>

//       {jobsWithApplicants.length === 0 ? (
//         <p>No job applications yet.</p>
//       ) : (
//         jobsWithApplicants.map((job) => (
//           <div key={job._id} className="border rounded p-4 mb-4 shadow">
//             <h3 className="text-xl font-semibold">{job.title}</h3>
//             <p className="text-gray-600 mb-2">
//               Posted on: {new Date(job.createdAt).toLocaleDateString()}
//             </p>

//             <h4 className="font-medium">Applicants:</h4>
//             {job.applicants?.length === 0 ? (
//               <p className="ml-4 text-gray-500">No applicants yet.</p>
//             ) : (
//               job.applicants.map((applicant) => (
//                 <div
//                   key={applicant._id}
//                   className="ml-4 mt-2 p-2 bg-gray-50 rounded"
//                 >
//                   <p>
//                     <strong>Name:</strong> {applicant.name}
//                   </p>
//                   <p>
//                     <strong>Email:</strong> {applicant.email}
//                   </p>
//                   <p>
//                     <strong>Status:</strong> {applicant.status || 'pending'}
//                   </p>
//                 </div>
//               ))
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default EmployerDashboard;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const EmployerDashboard = () => {
//   const [jobsWithApplicants, setJobsWithApplicants] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchEmployerApplications = async () => {
//       const token = localStorage.getItem('token');

//       if (!token) {
//         setError('🔒 Token not found. Please log in.');
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await axios.get('http://localhost:5000/api/applications/my-applications', {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//       console.log('Token from localStorage:', token);

//         const data = response.data.data || [];
//         setJobsWithApplicants(data);
//       } catch (err) {
//         console.error('❌ API Error:', err);
//         const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
//         setError(msg);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEmployerApplications();
//   }, 
//   []);

//   if (loading) return <p className="text-gray-500">Loading job applications...</p>;
//   if (error) return <p className="text-red-600">{error}</p>;

//   return (
//     <div>
//       <h2 className="text-2xl font-bold mb-4">📋 My Job Applications</h2>

//       {jobsWithApplicants.length === 0 ? (
//         <p>No jobs with applicants found.</p>
//       ) : (
//         jobsWithApplicants.map((job) => (
//           <div key={job._id} className="border rounded p-4 mb-6 shadow-md">
//             <h3 className="text-xl font-semibold">{job.title}</h3>
//             <p className="text-sm text-gray-600 mb-2">
//               Posted on: {new Date(job.createdAt).toLocaleDateString()}
//             </p>

//             <h4 className="font-semibold mb-2">Applicants:</h4>
//             {job.applicants?.length === 0 ? (
//               <p className="ml-4 text-gray-500">No applicants yet.</p>
//             ) : (
//               job.applicants.map((applicant) => (
//                 <div
//                   key={applicant._id}
//                   className="ml-4 mt-2 p-3 bg-gray-50 rounded border"
//                 >
//                   <p><strong>Name:</strong> {applicant.name}</p>
//                   <p><strong>Email:</strong> {applicant.email}</p>
//                   <p><strong>Status:</strong> {applicant.status || 'pending'}</p>
//                 </div>
//               ))
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   );
// };


// export default EmployerDashboard;

import { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryPieChart from '../components/CategoryPieChart';

const EmployerDashboard = () => {
  const [categoryStats, setCategoryStats] = useState([]);
  const employerId = localStorage.getItem('userId');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/dashboard/employer/${employerId}/category-stats`)
      .then(res => setCategoryStats(res.data))
      .catch(err => console.error(err));
  }, [employerId]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">📊 Job Stats by Category</h2>
      <div className="bg-white shadow rounded-xl p-6">
        {categoryStats.length > 0 ? (
          <CategoryPieChart data={categoryStats} />
        ) : (
          <p>No data available</p>
        )}
      </div>
    </div>
  );
};

export default EmployerDashboard;
