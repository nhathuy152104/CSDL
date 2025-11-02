import React, { useState, useEffect } from 'react';
import { Briefcase, Building, MapPin, FileText, Send, Sparkles, Plus, CheckCircle } from 'lucide-react';

const PostJob = () => {
  const [job, setJob] = useState({ title: '', company: '', location: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handlePost = async () => {
    if (!job.title || !job.company || !job.location || !job.description) {
      alert('Please fill in all fields');
      return;
    }

    const formData = new FormData();
    formData.append('title', job.title);
    formData.append('company', job.company);
    formData.append('location', job.location);
    formData.append('description', job.description);
    if (pdfFile) formData.append('pdf', pdfFile);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/job/add', {
        method: 'POST',
        body: formData,
        credentials: 'include', // Important for session-based auth
      });

      if (response.status === 403) {
        const errorData = await response.json();
        alert(`Access Denied: ${errorData.detail}`);
        return;
      }

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Failed to post job');
      }

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setJob({ title: '', company: '', location: '', description: '' });
      setPdfFile(null);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const backgroundStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px,
      rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.2) 25%, rgba(139, 92, 246, 0.1) 50%, transparent 70%)`,
  };

  const isFormValid = job.title && job.company && job.location && job.description;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 transition-all duration-300 ease-out" style={backgroundStyle} />
      <div className="absolute top-16 left-16 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-16 right-16 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 right-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-500"></div>

      {showSuccess && (
        <div className="fixed top-8 right-8 z-50 bg-emerald-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <span className="font-semibold">Job Posted Successfully! 🎉</span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-12 pt-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-500/20 rounded-2xl backdrop-blur-sm">
              <Plus className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Post a Job
            </h2>
            <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <p className="text-gray-300/80 text-lg">
            Share your opportunity with talented professionals
          </p>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Job Title */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Job Title
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g. Senior Software Engineer"
                    value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/25"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Company Name
                </label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g. Tech Innovations Inc."
                    value={job.company}
                    onChange={(e) => setJob({ ...job, company: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/25"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={job.location}
                    onChange={(e) => setJob({ ...job, location: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/25"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="group h-full">
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  Job Description
                </label>
                <div className="relative h-full">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    placeholder="Describe the role, responsibilities, and requirements..."
                    value={job.description}
                    onChange={(e) => setJob({ ...job, description: e.target.value })}
                    rows={8}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:shadow-lg focus:shadow-emerald-500/25 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PDF Upload */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-200 mb-3">
              Upload PDF (Optional)
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files[0])}
              className="block w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-emerald-500 file:text-white hover:file:bg-emerald-600"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 text-center">
            <button
              onClick={handlePost}
              disabled={!isFormValid || loading}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-full text-white text-lg font-semibold transition-all duration-300 ${
                !isFormValid || loading
                  ? 'bg-emerald-700/50 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-600'
              }`}
            >
              {loading ? 'Posting...' : (<><Send className="w-5 h-5" /> Post Job</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostJob;
