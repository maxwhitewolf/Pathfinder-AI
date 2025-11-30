import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isUser, isRecruiter } = useAuth();

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">PathFinder AI</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {isUser && (
                  <>
                    <Link to="/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Profile
                    </Link>
                    <Link to="/recommendations" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Recommendations
                    </Link>
                    <Link to="/job-matching" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Job Matching
                    </Link>
                    <Link to="/jobs" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Search Jobs
                    </Link>
                    <Link to="/roadmaps" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Roadmaps
                    </Link>
                  </>
                )}
                
                {isRecruiter && (
                  <>
                    <Link to="/recruiter/dashboard" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Dashboard
                    </Link>
                    <Link to="/recruiter/jobs" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      My Jobs
                    </Link>
                    <Link to="/recruiter/create-job" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                      Post Job
                    </Link>
                  </>
                )}
                
                <span className="text-sm text-gray-600">
                  Welcome, {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md text-sm font-medium">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;