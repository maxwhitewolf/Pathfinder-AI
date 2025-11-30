import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { jobAPI, roadmapAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState('');
  const [savingRoadmap, setSavingRoadmap] = useState(false);
  const [roadmapSaved, setRoadmapSaved] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await jobAPI.getJobById(id);
      setJob(response.data);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch job details'));
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (job) => {
    if (!job) return 'Salary not disclosed';
    if (job.is_salary_visible === false || (!job.min_salary && !job.max_salary && !job.salary)) {
      return 'Salary not disclosed';
    }
    
    // New format
    if (job.min_salary || job.max_salary) {
      const min = job.min_salary ? job.min_salary.toLocaleString() : '';
      const max = job.max_salary ? job.max_salary.toLocaleString() : '';
      const currency = job.salary_currency || 'INR';
      const period = job.salary_pay_period === 'year' ? 'yr' : 
                     job.salary_pay_period === 'month' ? 'mo' : 
                     job.salary_pay_period === 'hour' ? 'hr' : '';
      
      if (min && max) {
        return `${currency} ${min} - ${max} / ${period}`;
      } else if (min) {
        return `${currency} ${min}+ / ${period}`;
      } else if (max) {
        return `Up to ${currency} ${max} / ${period}`;
      }
    }
    
    // Legacy format
    if (job.salary) {
      return job.salary;
    }
    
    return 'Salary not disclosed';
  };

  const formatLocation = (job) => {
    if (!job) return 'Location not specified';
    const parts = [];
    if (job.location_city) parts.push(job.location_city);
    if (job.location_country) parts.push(job.location_country);
    if (job.is_remote) parts.push('Remote');
    if (parts.length === 0 && job.location) {
      return job.location;
    }
    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const handleGenerateRoadmap = async () => {
    setGeneratingRoadmap(true);
    setRoadmapError('');
    setRoadmapSaved(false);
    
    try {
      const response = await jobAPI.generateJobRoadmapForUser(id);
      setRoadmap(response.data.roadmap);
    } catch (error) {
      setRoadmapError(getErrorFromResponse(error, 'Failed to generate roadmap'));
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  const handleSaveRoadmap = async () => {
    if (!roadmap) return;
    
    setSavingRoadmap(true);
    try {
      const title = roadmap.role_summary?.title || `${job.job_title} - Learning Roadmap`;
      await roadmapAPI.saveRoadmap({
        roadmap_data: roadmap,
        title: title,
        job_id: parseInt(id),
        roadmap_type: 'job',
        target_career: roadmap.role_summary?.title || job.job_title
      });
      setRoadmapSaved(true);
      setTimeout(() => setRoadmapSaved(false), 3000);
    } catch (error) {
      alert(getErrorFromResponse(error, 'Failed to save roadmap'));
    } finally {
      setSavingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Job Not Found</h2>
            <p className="text-red-600 mb-6">{error || 'The job you are looking for does not exist.'}</p>
            <Link
              to="/jobs"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Job Board
            </Link>
          </div>
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
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-cyan-200 text-sm font-medium">Job Opportunity</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {job.job_title || job.title || 'Job Title'}
              </h1>
              <p className="text-xl text-blue-100 mb-6">{job.company_name || 'Company Name'}</p>
              
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                  📍 {formatLocation(job)}
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                  💼 {job.job_type ? job.job_type.replace('_', ' ') : 'Full Time'}
                </span>
                {job.experience_level && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    ⭐ {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                  </span>
                )}
                {job.work_type && (
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium border border-white/30">
                    🏢 {job.work_type.charAt(0).toUpperCase() + job.work_type.slice(1)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="ml-8">
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                Job Description
              </h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {job.jd_text || job.description || 'No description available.'}
              </div>
            </div>

            {/* Required Skills */}
            {job.skills_required && (Array.isArray(job.skills_required) ? job.skills_required.length > 0 : true) && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {Array.isArray(job.skills_required) ? (
                    job.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200">
                      {job.skills_required}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Nice to Have Skills */}
            {job.nice_to_have_skills && Array.isArray(job.nice_to_have_skills) && job.nice_to_have_skills.length > 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-3">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Nice to Have Skills
                </h2>
                <div className="flex flex-wrap gap-3">
                  {job.nice_to_have_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Apply Now</h3>
              
              {/* Generate Roadmap Button */}
              <button
                onClick={handleGenerateRoadmap}
                disabled={generatingRoadmap}
                className="w-full mb-4 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
              >
                {generatingRoadmap ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Roadmap...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Generate Learning Roadmap
                  </>
                )}
              </button>

              {roadmapError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{roadmapError}</p>
                </div>
              )}
              
              {job.application_url ? (
                <a
                  href={job.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg mb-4"
                >
                  Apply on Company Website
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              ) : job.application_email ? (
                <a
                  href={`mailto:${job.application_email}?subject=Application for ${job.job_title || job.title}`}
                  className="w-full block text-center px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg mb-4"
                >
                  Apply via Email
                  <svg className="w-5 h-5 inline-block ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
              ) : (
                <div className="text-center px-6 py-4 bg-gray-100 text-gray-600 rounded-xl mb-4">
                  Application details not provided
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-gray-200">
                {/* Salary */}
                {(job.is_salary_visible !== false) && (job.min_salary || job.max_salary || job.salary) && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Salary</div>
                    <div className="text-lg font-bold text-gray-900">{formatSalary(job)}</div>
                  </div>
                )}

                {/* Experience */}
                {(job.min_experience_years || job.max_experience_years) && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Experience Required</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {job.min_experience_years && job.max_experience_years
                        ? `${job.min_experience_years} - ${job.max_experience_years} years`
                        : job.min_experience_years
                        ? `${job.min_experience_years}+ years`
                        : `Up to ${job.max_experience_years} years`}
                    </div>
                  </div>
                )}

                {/* Industry */}
                {job.industry && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Industry</div>
                    <div className="text-lg font-semibold text-gray-900">{job.industry}</div>
                  </div>
                )}

                {/* Employment Level */}
                {job.employment_level && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Employment Level</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {job.employment_level.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {job.application_deadline && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Application Deadline</div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(job.application_deadline)}</div>
                  </div>
                )}

                {/* Posted Date */}
                {job.created_at && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Posted</div>
                    <div className="text-sm text-gray-600">{formatDate(job.created_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Summary Card */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-blue-200/50">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Summary</h3>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                  </svg>
                  <span className="text-sm">{job.job_type ? job.job_type.replace('_', ' ') : 'Full Time'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span className="text-sm">{job.experience_level ? job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1) : 'Any Level'}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{formatLocation(job)}</span>
                </div>
                {job.is_remote && (
                  <div className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-3 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm">Remote Work Available</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Display Section */}
        {roadmap && (
          <div className="mt-8 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                Your Personalized Learning Roadmap
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveRoadmap}
                  disabled={savingRoadmap || roadmapSaved}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${
                    roadmapSaved
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {savingRoadmap ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : roadmapSaved ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Saved!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Roadmap
                    </>
                  )}
                </button>
                <button
                  onClick={() => setRoadmap(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Role Summary */}
            {roadmap.role_summary && (
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{roadmap.role_summary.title}</h3>
                {roadmap.role_summary.what_you_do && roadmap.role_summary.what_you_do.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Key Responsibilities:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {roadmap.role_summary.what_you_do.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {roadmap.role_summary.required_stack && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Required Tech Stack:</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(roadmap.role_summary.required_stack).map(([category, skills]) => (
                        skills && skills.length > 0 && (
                          <div key={category} className="mb-2">
                            <span className="text-sm font-medium text-gray-600 capitalize">{category.replace('_', ' ')}: </span>
                            {skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mr-1">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Gap Analysis */}
            {roadmap.gap_analysis && (
              <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Gap Analysis</h3>
                {roadmap.gap_analysis.summary && (
                  <p className="text-gray-700 mb-4 leading-relaxed">{roadmap.gap_analysis.summary}</p>
                )}
                {roadmap.gap_analysis.missing_skills && roadmap.gap_analysis.missing_skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Missing Skills:</h4>
                    <div className="space-y-2">
                      {roadmap.gap_analysis.missing_skills.map((skill, idx) => (
                        <div key={idx} className="p-3 bg-white rounded-lg border border-yellow-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{skill.skill}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              skill.priority === 'high' ? 'bg-red-100 text-red-800' :
                              skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {skill.priority} priority
                            </span>
                          </div>
                          {skill.reason && (
                            <p className="text-sm text-gray-600 mt-1">{skill.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Roadmap Phases */}
            {roadmap.roadmap && roadmap.roadmap.phases && roadmap.roadmap.phases.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning Phases</h3>
                <div className="space-y-6">
                  {roadmap.roadmap.phases.map((phase, phaseIdx) => (
                    <div key={phase.phase_id || phaseIdx} className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-2">
                            Phase {phase.phase_id || phaseIdx + 1}: {phase.phase_name}
                          </h4>
                          {phase.goal && (
                            <p className="text-gray-700 mb-2">{phase.goal}</p>
                          )}
                          {phase.estimated_duration_weeks && (
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              ⏱️ {phase.estimated_duration_weeks} weeks
                            </span>
                          )}
                        </div>
                      </div>

                      {phase.tasks && phase.tasks.length > 0 && (
                        <div className="space-y-4 mt-4">
                          {phase.tasks.map((task, taskIdx) => (
                            <div key={task.task_id || taskIdx} className="p-4 bg-white rounded-lg border border-gray-200">
                              <h5 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h5>
                              {task.description && (
                                <p className="text-gray-700 mb-3">{task.description}</p>
                              )}
                              {task.jd_alignment && task.jd_alignment.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-600">JD Alignment: </span>
                                  <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                                    {task.jd_alignment.map((align, idx) => (
                                      <li key={idx}>{align}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-600">Subtasks:</span>
                                  <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
                                    {task.subtasks.map((subtask, idx) => (
                                      <li key={idx}>{subtask}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {task.skills_gained && task.skills_gained.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {task.skills_gained.map((skill, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              )}
                              {task.status_options && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {task.status_options.map((status, idx) => (
                                    <button
                                      key={idx}
                                      className={`px-3 py-1 rounded text-xs font-medium ${
                                        status === 'start' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                                        status === 'already_know' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                                        status === 'need_easier' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' :
                                        status === 'skip' ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' :
                                        'bg-purple-100 text-purple-800 hover:bg-purple-200'
                                      }`}
                                    >
                                      {status.replace('_', ' ')}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetail;

