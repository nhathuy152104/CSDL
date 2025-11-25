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
