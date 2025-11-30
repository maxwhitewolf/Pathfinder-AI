import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';
import { filterValidCareers } from '../../utils/dataValidator';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    profileComplete: false,
    resumeUploaded: false,
    skillsCount: 0,
    certificationsCount: 0
  });
  const [recentRecommendations, setRecentRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const profileResponse = await userAPI.getProfile();
      const profileData = profileResponse.data;
      setProfile(profileData);

      setStats({
        profileComplete: !!(profileData.degree && profileData.cgpa_10th && profileData.cgpa_12th),
        resumeUploaded: !!profileData.resume_path,
        skillsCount: (profileData.skills || []).length + (profileData.extracted_skills || []).length,
        certificationsCount: (profileData.certifications || []).length
      });

      if (profileData.skills && profileData.skills.length > 0) {
        try {
          const recommendationsResponse = await aiAPI.recommendCareers();
          // Ensure we only set valid career objects
          if (recommendationsResponse?.data?.careers && Array.isArray(recommendationsResponse.data.careers)) {
            const validCareers = filterValidCareers(recommendationsResponse.data.careers).slice(0, 3);
            setRecentRecommendations(validCareers);
          }
        } catch (error) {
          // Silently fail for recommendations - not critical
          console.log('No recommendations available yet');
        }
      }
    } catch (error) {
      // Handle 404 (profile not found) gracefully
      if (error.response?.status === 404) {
        setError(null); // Don't show error for missing profile - it's expected for new users
        setProfile(null);
      } else {
        // For other errors (422, 500, etc.), show the error message
        const errorMessage = getErrorFromResponse(error, 'Failed to load dashboard data');
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading your dashboard...</h3>
          <p className="text-gray-600">Preparing your personalized career insights</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, status, icon, link, linkText, gradient, iconColor }) => (
    <div className="group bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-1 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {status && (
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              status.includes('Complete') || status.includes('Uploaded') 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {status}
            </span>
          </div>
        )}
        
        <Link 
          to={link}
          className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 group/link"
        >
          {linkText}
          <svg className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );

  const ActionCard = ({ title, description, link, gradient, icon }) => (
    <Link to={link} className="group block">
      <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:transform hover:-translate-y-1 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
        
        <div className="relative flex items-center">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r ${gradient} mr-4 group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );

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
              <span className="text-cyan-200 text-sm font-medium">Welcome Back to PathFinder AI</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Your Career
              <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Track your progress, discover opportunities, and accelerate your career growth with AI-powered insights
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        
        {/* Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          <StatCard
            title="Profile Status"
            value={stats.profileComplete ? "Complete" : "Incomplete"}
            status={stats.profileComplete ? "Profile Complete" : "Needs Completion"}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            }
            link="/profile"
            linkText={stats.profileComplete ? "View Profile" : "Complete Profile"}
            gradient="from-blue-500 to-cyan-500"
            iconColor={stats.profileComplete ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-600"}
          />
          
          <StatCard
            title="Resume Status"
            value={stats.resumeUploaded ? "Uploaded" : "Missing"}
            status={stats.resumeUploaded ? "Resume Uploaded" : "Upload Required"}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
              </svg>
            }
            link="/resume"
            linkText={stats.resumeUploaded ? "Update Resume" : "Upload Resume"}
            gradient="from-purple-500 to-pink-500"
            iconColor={stats.resumeUploaded ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-600"}
          />
          
          <StatCard
            title="Skills Portfolio"
            value={stats.skillsCount}
            status={stats.skillsCount > 0 ? `${stats.skillsCount} Skills Added` : "No Skills Yet"}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            }
            link="/profile"
            linkText="Manage Skills"
            gradient="from-indigo-500 to-blue-500"
            iconColor="bg-gradient-to-r from-blue-500 to-indigo-600"
          />
          
          <StatCard
            title="Certifications"
            value={stats.certificationsCount}
            status={stats.certificationsCount > 0 ? `${stats.certificationsCount} Certifications` : "Add Certifications"}
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            link="/profile"
            linkText="Add Certifications"
            gradient="from-purple-500 to-pink-500"
            iconColor="bg-gradient-to-r from-purple-500 to-pink-600"
          />
        </div>

        {/* Quick Actions & Recommendations */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-12">
          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="space-y-4">
                <ActionCard
                  title="Career Recommendations"
                  description="Discover AI-powered career paths"
                  link="/recommendations"
                  gradient="from-blue-500 to-cyan-500"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  }
                />
                
                <ActionCard
                  title="Job Matching"
                  description="Find jobs that match your profile"
                  link="/jobs"
                  gradient="from-green-500 to-emerald-500"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  }
                />
                
                <ActionCard
                  title="Career Roadmap"
                  description="Generate your learning path"
                  link="/roadmap"
                  gradient="from-purple-500 to-pink-500"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  }
                />
                
                <ActionCard
                  title="Skill Analysis"
                  description="Analyze your skill gaps"
                  link="/analysis"
                  gradient="from-orange-500 to-red-500"
                  icon={
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </div>

          {/* Recent Recommendations */}
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Career Recommendations</h3>
            </div>
            
            {recentRecommendations.length > 0 ? (
              <div className="space-y-4">
                {recentRecommendations.map((career, index) => (
                  <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200/50 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">{career.career}</h4>
                      {career.similarity_score !== undefined && (
                        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {typeof career.similarity_score === 'number' ? career.similarity_score.toFixed(1) : 'N/A'}% Match
                        </span>
                      )}
                    </div>
                    
                    {career.required_skills && career.required_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">Key Skills Required:</p>
                        <div className="flex flex-wrap gap-2">
                          {career.required_skills.slice(0, 3).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {career.required_skills.length > 3 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{career.required_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to="/recommendations"
                    className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors duration-200 group"
                  >
                    View All Recommendations
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-600 mb-6">
                  Complete your profile and add skills to get personalized AI-powered career recommendations.
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Complete Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!stats.profileComplete && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  🚀 Unlock Your Full Potential
                </h3>
                <p className="text-orange-700 mb-4 leading-relaxed">
                  Complete your profile to unlock AI-powered career recommendations, personalized job matches, and custom learning roadmaps. Your journey to the perfect career starts with a complete profile!
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center bg-gradient-to-r from-orange-500 to-yellow-600 hover:from-orange-400 hover:to-yellow-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Complete Profile Now
                  <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;