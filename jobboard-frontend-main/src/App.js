// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import JobList from './pages/JobList';
import Register from './pages/Register';
import Login from './pages/Login';
import PostJob from './pages/PostJob';
import EmployerApplications from './pages/EmployerApplications';
import EmployerOnlyPage from './pages/EmployerOnlyPage';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import ChatRoom from './components/ChatRoom';
import About from './pages/About';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ProfilePage from './pages/ProfilePage'; // ✅ thêm
import SkillsPage from "./pages/SkillsPage";
import CompanyList from "./pages/CompanyList";
import CompanyDetail from "./pages/CompanyDetail";
import EmployerCompanyProfile from "./pages/EmployerCompanyProfile";
import JobDetail from './pages/JobDetail'; // ✅ tạo file này ở bước 3
import CompanyJobs from "./pages/CompanyJobs";


// ✅ Guard đơn giản
const RequireAuth = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('userEmail') || !!localStorage.getItem('userName');
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

function App() {
  const userRole = localStorage.getItem('userRole');
  const jobId = '64fab12345cdef1234567890';
  const currentUserId = '64fabc00001abc0000000001';
  const targetUserId = '64fabc00001abc0000000002';

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow ml-0 md:ml-60 p-6">
          <Routes>
            {/* Public */}
            <Route path="/" element={<JobList />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/post-job" element={<PostJob />} />

            {/* Info */}
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* ✅ Profile */}
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <ProfilePage />
                </RequireAuth>
              }
            />

            {/* Employer-only */}
            <Route
              path="/employer/applications"
              element={userRole === 'employer' ? <EmployerApplications /> : <EmployerOnlyPage />}
            />
            <Route path="/EmployerApplications" element={<Navigate to="/employer/applications" replace />} />
            <Route path="/skills" element={<SkillsPage />} />

            {/* Dashboards */}
            <Route
              path="/seeker/dashboard"
              element={userRole === 'employer' ? <EmployerDashboard /> : <CandidateDashboard />}
            />
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/companies/:id" element={<CompanyDetail />} />

              <Route path="/employer/company" element={<EmployerCompanyProfile />} />

            {/* Chat */}

              {/* Public */}
            <Route path="/" element={<Navigate to="/jobs" replace />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
              {/* ... các route khác giữ nguyên */}
            <Route
              path="/chat"
              element={<ChatRoom jobId={jobId} currentUserId={currentUserId} targetUserId={targetUserId} />}
            />
            <Route path="/company/jobs" element={<CompanyJobs />} />
          </Routes>
          
          {/* public */}
        </main>
        <Footer />
      </div>
    </Router>
    
  );
}

export default App;
