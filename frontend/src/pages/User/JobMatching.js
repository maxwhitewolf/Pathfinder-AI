import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const JobMatching = () => {
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatchedJobs();
  }, []);

  const fetchMatchedJobs = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.matchJobs();
      setMatchedJobs(response.data.jobs || []);
      if (!response.data.jobs || response.data.jobs.length === 0) {
        setError('No matching jobs found. Try uploading a resume with more details or completing your profile.');
      }
    } catch (error) {
      const errorMsg = getErrorFromResponse(error, 'Failed to fetch matched jobs');
      setError(errorMsg);
      
      // If the error indicates no resume, provide helpful guidance
      if (errorMsg.includes('Resume not found') || errorMsg.includes('upload a resume') || errorMsg.includes('Profile not found')) {
        setError('Please complete your profile and upload your resume first to get AI-powered job matches. Go to Profile → Upload Resume');
      }
    } finally {
      setLoading(false);
    }
  };

  const JobCard = ({ job, index }) => (
    <Link to={`/jobs/${job.job_id}`} className="group block">
      <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-8 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-2 hover:border-blue-300/50 relative overflow-hidden">
        {/* Background gradient animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                  {job.job_title || job.title || 'Untitled Job'}
                </h3>
                {job.match_score && (
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-bold shadow-lg">
                    {job.match_score.toFixed(1)}% Match
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-600 mb-4">{job.company_name || 'Company Not Specified'}</p>
              
              <div className="flex flex-wrap gap-3 mb-4">
                {(job.location_city || job.location_country || job.location) && (
                  <span className="flex items-center px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {job.location_city && job.location_country 
                      ? `${job.location_city}, ${job.location_country}`
                      : job.location || `${job.location_city || ''} ${job.location_country || ''}`.trim()}
                    {job.is_remote && ' (Remote)'}
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
                {job.experience_level && (
                  <span className="flex items-center px-3 py-1 bg-yellow-100/80 text-yellow-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                  </span>
                )}
                {job.skill_match_percentage > 0 && (
                  <span className="flex items-center px-3 py-1 bg-green-100/80 text-green-700 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {job.skill_match_percentage.toFixed(0)}% Skills Match
                  </span>
                )}
              </div>

              {job.similarity_score && (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-600">Match Score:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(job.match_score || job.similarity_score * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">
                      {job.match_score ? job.match_score.toFixed(1) : (job.similarity_score * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-6 line-clamp-3 leading-relaxed">
            {job.description || job.jd_text || 'No description available.'}
          </p>

          {job.skills_required && (Array.isArray(job.skills_required) ? job.skills_required.length > 0 : true) && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Required Skills:</h4>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(job.skills_required) ? (
                  job.skills_required.slice(0, 6).map((skill, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 ${
                        job.matching_skills && job.matching_skills.includes(skill)
                          ? 'bg-green-100 text-green-800 border-2 border-green-300'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {skill}
                      {job.matching_skills && job.matching_skills.includes(skill) && (
                        <svg className="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {job.skills_required}
                  </span>
                )}
                {Array.isArray(job.skills_required) && job.skills_required.length > 6 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{job.skills_required.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <span className="text-xs text-gray-500">
              {job.match_score && `Match Score: ${job.match_score.toFixed(1)}%`}
              {job.similarity_score && !job.match_score && `Similarity: ${(job.similarity_score * 100).toFixed(1)}%`}
            </span>
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform group-hover:scale-105 shadow-lg hover:shadow-blue-500/25">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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
              Matching
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Discover personalized job matches powered by AI that align with your skills, experience, and career aspirations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Action Bar */}
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={fetchMatchedJobs}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Matching...' : 'Refresh Matches'}
              </button>
              <Link
                to="/jobs"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse All Jobs
              </Link>
            </div>
            {matchedJobs.length > 0 && (
              <div className="text-gray-700 font-medium">
                Found <span className="text-blue-600 font-bold">{matchedJobs.length}</span> matching jobs
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-6 mb-8 shadow-lg backdrop-blur-sm">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">Unable to Match Jobs</h3>
                <p className="text-red-700">{error}</p>
                {error.includes('resume') || error.includes('profile') && (
                  <Link
                    to="/profile"
                    className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Go to Profile →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoadingSpinner />
            <p className="mt-6 text-gray-600 text-lg">Analyzing your profile and matching jobs...</p>
          </div>
        ) : (
          <>
            {/* Matched Jobs */}
            {matchedJobs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">Your Matched Jobs</h3>
                  <span className="text-sm text-gray-600">Sorted by match score</span>
                </div>
                {matchedJobs.map((job, index) => (
                  <JobCard key={job.job_id || index} job={job} index={index} />
                ))}
              </div>
            ) : !error ? (
              <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No matching jobs found</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  We couldn't find jobs that match your profile. Try completing your profile, uploading a resume, or browse all available jobs.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={fetchMatchedJobs}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300"
                  >
                    Try Again
                  </button>
                  <Link
                    to="/jobs"
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-200"
                  >
                    Browse All Jobs
                  </Link>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default JobMatching;


