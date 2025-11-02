import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CandidateDashboard = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/applications/my-applications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(res.data);
    };
    fetchApplications();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">My Applications</h2>
      {applications.map((app) => (
        <div key={app._id} className="p-4 border mb-2 rounded">
          <p><strong>Job Title:</strong> {app.job.title}</p>
          <p><strong>Status:</strong> {app.status || 'Pending'}</p>
        </div>
      ))}
    </div>
  );
};

export default CandidateDashboard;
