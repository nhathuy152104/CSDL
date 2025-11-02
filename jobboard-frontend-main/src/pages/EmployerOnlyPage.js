  import { AlertCircle } from 'lucide-react';
  import { Link } from 'react-router-dom';

  const EmployerOnlyPage = () => {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
          </div>
          <p className="mb-4 text-gray-600">
            Only employer accounts can access this page. If you should have access,
            please login with an employer account.
          </p>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              Go to Login
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  };

  export default EmployerOnlyPage;