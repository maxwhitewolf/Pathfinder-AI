import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const RecruiterDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    closedJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await jobAPI.getRecruiterJobs();
      const jobsData = response.data;
      setJobs(jobsData);

      setStats({
        totalJobs: jobsData.length,
        activeJobs: jobsData.filter(job => job.status === 'open').length,
        closedJobs: jobsData.filter(job => job.status === 'closed').length
      });
    } catch (error) {
      console.log('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const recentJobs = jobs.slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">📊 Loading Dashboard</h3>
          <p className="text-lg text-gray-600 mb-2">Preparing your recruitment insights</p>
          <p className="text-sm text-gray-500">This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              <span className="text-cyan-200 text-sm font-medium">Recruiter Control Center</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Recruiter
              <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Manage your job postings and connect with top talent through AI-powered recruitment tools
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
          <div className="group bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative flex items-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
                  <div className="text-blue-100 font-medium">Total Jobs Posted</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Link
                to="/recruiter/jobs"
                className="group/link inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200"
              >
                <span>View All Jobs</span>
                <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative flex items-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white">{stats.activeJobs}</div>
                  <div className="text-green-100 font-medium">Active Positions</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <Link
                to="/recruiter/create-job"
                className="group/link inline-flex items-center text-green-600 hover:text-green-700 font-semibold transition-all duration-200"
              >
                <span>Post New Job</span>
                <svg className="w-5 h-5 ml-2 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Link>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:transform hover:-translate-y-1">
            <div className="relative bg-gradient-to-r from-gray-500 to-slate-600 p-6">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full transform translate-x-4 -translate-y-4"></div>
              <div className="relative flex items-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white">{stats.closedJobs}</div>
                  <div className="text-gray-100 font-medium">Closed Positions</div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <span className="inline-flex items-center text-gray-500 font-semibold">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" />
                </svg>
                Archived Positions
              </span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Quick Actions Card */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="relative bg-gradient-to-r from-purple-500 to-indigo-600 p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
              <div className="relative flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">⚡ Quick Actions</h3>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <Link
                to="/recruiter/create-job"
                className="group flex items-center w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Post a New Job
              </Link>
              <Link
                to="/recruiter/jobs"
                className="group flex items-center w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Manage My Jobs
              </Link>
              <Link
                to="/jobs"
                className="group flex items-center w-full bg-gradient-to-r from-indigo-500 to-pink-600 hover:from-indigo-400 hover:to-pink-500 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
              >
                <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse All Jobs
              </Link>
            </div>
          </div>

          {/* Recent Job Postings Card */}
          <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 p-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
              <div className="relative flex items-center">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white">📋 Recent Job Postings</h3>
              </div>
            </div>
            <div className="p-8">
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">{job.title}</h4>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            {job.location && (
                              <span className="flex items-center mr-4">
                                <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </span>
                            )}
                            <span className="flex items-center text-gray-500">
                              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {new Date(job.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${
                          job.status === 'open' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {job.status === 'open' && (
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          )}
                          {job.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.skills_required.slice(0, 4).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition-colors duration-200"
                          >
                            <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {skill}
                          </span>
                        ))}
                        {job.skills_required.length > 4 && (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600">
                            +{job.skills_required.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-6 text-center">
                    <Link
                      to="/recruiter/jobs"
                      className="group inline-flex items-center text-blue-600 hover:text-blue-700 font-bold text-lg transition-all duration-200"
                    >
                      <span>View All Job Postings</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">🚀 Ready to Start Recruiting?</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    Post your first job opening and start connecting with talented candidates through our AI-powered platform.
                  </p>
                  <Link
                    to="/recruiter/create-job"
                    className="group inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25"
                  >
                    <svg className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Welcome Banner */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-lg rounded-2xl p-8 border border-indigo-100 shadow-xl">
          <div className="flex items-start">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
              <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-3">🎯</span>
                Welcome to PathFinder AI Recruiter Portal
              </h3>
              <div className="text-lg text-gray-700 leading-relaxed mb-6">
                <p>
                  Leverage our advanced AI-powered platform to streamline your recruitment process. Post job openings, discover qualified candidates, and make data-driven hiring decisions with our intelligent matching system that analyzes skills, experience, and career aspirations.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/recruiter/create-job"
                  className="group inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Get Started Now
                </Link>
                <div className="flex items-center text-gray-600">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="ml-3 text-sm font-medium">Join 1000+ recruiters</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterDashboard;