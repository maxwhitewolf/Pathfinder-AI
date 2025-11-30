import React, { useState, useEffect } from 'react';
import { jobAPI, aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const Jobs = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('matched');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    skills: ''
  });

  useEffect(() => {
    fetchAllJobs();
    if (activeTab === 'matched') {
      fetchMatchedJobs();
    }
  }, [activeTab]);

  const fetchAllJobs = async () => {
    try {
      const response = await jobAPI.getAllJobs();
      setAllJobs(response.data);
    } catch (error) {
      console.log('Failed to fetch jobs');
    }
  };

  const fetchMatchedJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.matchJobs();
      setMatchedJobs(response.data.jobs);
      if (!response.data.jobs || response.data.jobs.length === 0) {
        setError('No matching jobs found. Try uploading a resume with more details.');
      }
    } catch (error) {
      const errorMsg = getErrorFromResponse(error, 'Failed to fetch matched jobs');
      setError(errorMsg);
      
      // If the error indicates no resume, provide helpful guidance
      if (errorMsg.includes('Resume not found') || errorMsg.includes('upload a resume')) {
        setError('Please upload your resume first to get AI-powered job matches. Go to Profile → Upload Resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = allJobs.filter(job => {
    const skillsArray = Array.isArray(job.skills_required) 
      ? job.skills_required 
      : typeof job.skills_required === 'string' 
        ? job.skills_required.split(',').map(s => s.trim())
        : [];
    
    return (
      (!filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
      (!filters.industry || job.industry?.toLowerCase().includes(filters.industry.toLowerCase())) &&
      (!filters.skills || skillsArray.some(skill => 
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      ))
    );
  });

  const JobCard = ({ job, showMatchScore = false }) => (
    <div className="group bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 hover:border-blue-300/50 relative overflow-hidden">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors duration-300">{job.title}</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {job.location && (
                <span className="flex items-center px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  {job.location}
                </span>
              )}
              {job.industry && (
                <span className="flex items-center px-3 py-1 bg-purple-100/80 text-purple-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v2h1a1 1 0 001-1v-1h-2zm-2-1h2V9h-2v3zm-2 3h2v-2h-2v2zm-2 0h2v-2H9v2zm-2-2v2H6v-2h1zm0-1H6V9h1v3z" clipRule="evenodd" />
                  </svg>
                  {job.industry}
                </span>
              )}
              {job.salary && (
                <span className="flex items-center px-3 py-1 bg-green-100/80 text-green-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {job.salary}
                </span>
              )}
            </div>
            {showMatchScore && job.similarity_score && (
              <div className="mb-4">
                <span className="text-lg font-bold text-blue-600 mr-2">
                  {(job.similarity_score * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500">Match Score</span>
              </div>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {job.status}
            </span>
          </div>
        </div>

        <p className="text-gray-700 text-sm mb-6 line-clamp-3 leading-relaxed">
          {job.description}
        </p>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const skillsArray = Array.isArray(job.skills_required) 
                ? job.skills_required 
                : typeof job.skills_required === 'string' 
                  ? job.skills_required.split(',').map(s => s.trim())
                  : [];
              
              return skillsArray.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors duration-200"
                >
                  {skill}
                </span>
              ));
            })()}
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Posted on {new Date(job.created_at).toLocaleDateString()}
          </span>
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25">
            View Details
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full opacity-20 blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-cyan-200 text-sm font-medium">AI-Powered Job Matching</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Job
            <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Opportunities
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover personalized job matches powered by AI that align with your skills, experience, and career aspirations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Modern Tab Navigation */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-white/20 mb-8">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('matched')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'matched'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>AI Matched Jobs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>All Jobs</span>
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="mb-8 bg-white/70 backdrop-blur-lg p-6 rounded-2xl shadow-xl border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., San Francisco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input
                  type="text"
                  value={filters.industry}
                  onChange={(e) => setFilters({...filters, industry: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Technology"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <input
                  type="text"
                  value={filters.skills}
                  onChange={(e) => setFilters({...filters, skills: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., Python"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
              {activeTab === 'matched' && (
                <button
                  onClick={fetchMatchedJobs}
                  className="ml-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        )}

        {loading && activeTab === 'matched' ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Finding your perfect matches...</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Our AI is analyzing thousands of job opportunities to find the best matches for your profile
              </p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'matched' ? (
              matchedJobs.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 backdrop-blur-sm rounded-2xl p-8 border border-blue-200/50 shadow-xl">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">AI-Matched Jobs</h3>
                        <p className="text-gray-700 leading-relaxed">
                          These opportunities are specifically selected based on your resume, skills, and academic background using our advanced Doc2Vec matching algorithm.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-8 md:grid-cols-2">
                    {matchedJobs.map((job, index) => (
                      <JobCard key={job.id || index} job={job} showMatchScore={true} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6M9 16v-2a2 2 0 012-2h2a2 2 0 012 2v2M9 16a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No matched jobs found</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Upload your resume and complete your profile to get personalized job matches tailored to your skills and experience.
                  </p>
                  <button
                    onClick={fetchMatchedJobs}
                    className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Matches
                  </button>
                </div>
              )
            ) : (
              filteredJobs.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2">
                  {filteredJobs.map((job, index) => (
                    <JobCard key={job.id || index} job={job} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6M9 16v-2a2 2 0 012-2h2a2 2 0 012 2v2M9 16a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2h2a2 2 0 012 2v2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No jobs found</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {Object.values(filters).some(filter => filter) 
                      ? 'Try adjusting your filters to see more results.'
                      : 'No jobs are currently available. Check back later for new opportunities!'}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;