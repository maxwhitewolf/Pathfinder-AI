import React, { useState } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const Roadmap = () => {
  const [formData, setFormData] = useState({
    target_career: '',
    missing_skills: [],
    experience_level: 'beginner',
    time_commitment: 'part-time'
  });
  const [roadmapData, setRoadmapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        missing_skills: [...formData.missing_skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setFormData({
      ...formData,
      missing_skills: formData.missing_skills.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.generateRoadmap(formData);
      setRoadmapData(response.data);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to generate roadmap'));
    } finally {
      setLoading(false);
    }
  };

  const RoadmapCard = ({ roadmap, isSelected = false }) => (
    <div className={`group relative overflow-hidden rounded-3xl transition-all duration-500 hover:transform hover:-translate-y-2 ${
      isSelected 
        ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-3 border-blue-500 shadow-2xl shadow-blue-500/20' 
        : 'bg-white/80 backdrop-blur-lg border-2 border-white/50 hover:shadow-2xl hover:border-purple-200'
    }`}>
      {/* Card Header */}
      <div className={`relative p-8 ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-500 to-indigo-600' 
          : 'bg-gradient-to-r from-gray-700 to-gray-800 group-hover:from-purple-600 group-hover:to-indigo-600'
      } text-white`}>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-8 -translate-y-8"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full transform -translate-x-6 translate-y-6"></div>
        
        <div className="relative flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              {isSelected && (
                <span className="inline-flex items-center bg-green-500/20 text-green-100 border border-green-400/30 px-4 py-2 rounded-full text-sm font-bold">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  🏆 AI Recommended
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 group-hover:scale-105 transition-transform duration-300">
              {roadmap.name}
            </h3>
            <div className="flex items-center text-white/90 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">{roadmap.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-8">
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">{roadmap.description}</p>
        </div>

        {/* Learning Steps */}
        <div className="space-y-4">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900">🗺️ Learning Journey</h4>
          </div>
          
          {roadmap.steps?.map((step, index) => (
            <div key={index} className="relative">
              {/* Step connector line */}
              {index < roadmap.steps.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-8 bg-gradient-to-b from-blue-300 to-purple-300 z-0"></div>
              )}
              
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:bg-white/80">
                <div className="flex items-start">
                  {/* Step number */}
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h5 className="text-lg font-bold text-gray-900 leading-tight">{step.title}</h5>
                      <div className="flex items-center bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold ml-4">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {step.duration_weeks} weeks
                      </div>
                    </div>
                    
                    {step.skills_gained && step.skills_gained.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                          Skills you'll master:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.skills_gained.map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                            >
                              <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.resources && step.resources.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          Learning resources:
                        </p>
                        <ul className="space-y-2">
                          {step.resources.map((resource, resourceIndex) => (
                            <li key={resourceIndex} className="flex items-start text-sm text-gray-700">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="leading-relaxed">{resource}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
              <span className="text-cyan-200 text-sm font-medium">AI-Powered Learning Path</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Career Roadmap
              <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
                Generator
              </span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Get a personalized, step-by-step learning path crafted by AI to accelerate your journey to your dream career
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">

        {!roadmapData ? (
          <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/20 overflow-hidden">
            <div className="px-8 py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">🎯 Create Your Roadmap</h2>
                <p className="text-gray-600 text-lg">Tell us about your goals and we'll create a personalized learning journey</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200/50 rounded-xl p-4 shadow-lg backdrop-blur-sm">
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

                {/* Target Career Field */}
                <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6a2 2 0 012-2h4a2 2 0 012 2v2z" />
                      </svg>
                    </div>
                    <label htmlFor="target_career" className="text-lg font-bold text-gray-900">
                      🎯 Target Career *
                    </label>
                  </div>
                  <input
                    type="text"
                    name="target_career"
                    id="target_career"
                    required
                    value={formData.target_career}
                    onChange={handleChange}
                    className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 backdrop-blur-sm text-lg"
                    placeholder="e.g., Data Scientist, Software Engineer, Product Manager"
                  />
                </div>

                {/* Skills Development Field */}
                <div className="bg-gradient-to-r from-purple-50/50 to-pink-50/50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <label className="text-lg font-bold text-gray-900">
                      ⚡ Skills You Want to Develop
                    </label>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mb-4">
                    {formData.missing_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:shadow-lg transition-all duration-200"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Add a skill you want to learn (e.g., Python, React, Machine Learning)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-400 hover:to-pink-500 transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Experience Level & Time Commitment */}
                <div className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">📈 Learning Preferences</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="experience_level" className="block text-sm font-semibold text-gray-700 mb-2">
                        🎓 Experience Level
                      </label>
                      <select
                        name="experience_level"
                        id="experience_level"
                        value={formData.experience_level}
                        onChange={handleChange}
                        className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-lg"
                      >
                        <option value="beginner">🌱 Beginner - Just starting out</option>
                        <option value="intermediate">🌿 Intermediate - Some experience</option>
                        <option value="advanced">🌳 Advanced - Experienced professional</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="time_commitment" className="block text-sm font-semibold text-gray-700 mb-2">
                        ⏰ Time Commitment
                      </label>
                      <select
                        name="time_commitment"
                        id="time_commitment"
                        value={formData.time_commitment}
                        onChange={handleChange}
                        className="block w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200 backdrop-blur-sm text-lg"
                      >
                        <option value="casual">📚 Casual (5-10 hours/week)</option>
                        <option value="part-time">📅 Part-time (10-15 hours/week)</option>
                        <option value="full-time">🚀 Full-time (30+ hours/week)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white px-12 py-4 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        <span className="text-lg">🧪 Generating Your Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 mr-3 group-hover:scale-110 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        🎆 Generate My Roadmap
                      </>
                    )}
                  </button>
                  <p className="text-gray-500 mt-4 text-sm">Our AI will create multiple roadmap variants for you to choose from</p>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-lg shadow-xl rounded-2xl border border-white/20 overflow-hidden">
              <div className="px-8 py-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1 mb-6 lg:mb-0">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-bold">
                        ✅ Roadmap Generated Successfully
                      </span>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-3">
                      🎯 Your Personalized Roadmap
                    </h2>
                    <p className="text-xl text-gray-600">
                      AI-crafted learning path for <strong className="text-blue-600">{formData.target_career}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRoadmapData(null);
                      setFormData({
                        target_career: '',
                        missing_skills: [],
                        experience_level: 'beginner',
                        time_commitment: 'part-time'
                      });
                    }}
                    className="group inline-flex items-center border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Generate New Roadmap
                  </button>
                </div>

                {/* AI Info Banner */}
                <div className="mt-8 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 backdrop-blur-lg rounded-xl p-6 border border-indigo-100">
                  <div className="flex items-start">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center">
                        <span className="mr-2">🤖</span>
                        AI-Generated Learning Paths
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Our advanced AI has analyzed your <strong>target career</strong>, <strong>skill requirements</strong>, <strong>experience level</strong>, and <strong>time commitment</strong> to create multiple personalized learning paths. The recommended roadmap is optimized for your specific situation and learning preferences.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommended Roadmap */}
            {roadmapData.selected_roadmap && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center">
                    <span className="mr-3">🏆</span>
                    AI Recommended Path
                  </h3>
                  <p className="text-gray-600 text-lg">This roadmap is specifically optimized for your goals and preferences</p>
                </div>
                <RoadmapCard roadmap={roadmapData.selected_roadmap} isSelected={true} />
              </div>
            )}

            {/* Alternative Roadmaps */}
            {roadmapData.all_roadmaps && roadmapData.all_roadmaps.length > 0 && (
              <div>
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center">
                    <span className="mr-3">🔄</span>
                    Alternative Learning Paths
                  </h3>
                  <p className="text-gray-600 text-lg">Explore different approaches to reach your career goals</p>
                </div>
                <div className="grid gap-8 lg:grid-cols-2">
                  {roadmapData.all_roadmaps.map((roadmap, index) => (
                    <RoadmapCard 
                      key={index} 
                      roadmap={roadmap} 
                      isSelected={roadmap.roadmap_id === roadmapData.selected_roadmap?.roadmap_id}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps Section */}
            <div className="bg-gradient-to-r from-purple-50/80 to-pink-50/80 backdrop-blur-lg rounded-2xl p-8 border border-purple-100 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                  <span className="mr-3">🚀</span>
                  Ready to Start Your Journey?
                </h3>
                <p className="text-gray-600 text-lg">Transform your roadmap into reality with these actionable next steps</p>
              </div>
              
              <div className="grid gap-6 md:grid-cols-3">
                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">📚 Start Learning</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Begin with the first step of your recommended roadmap. Follow the suggested resources, set up your learning schedule, and take the first course or tutorial.
                  </p>
                </div>
                
                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2V7a2 2 0 012-2h2a2 2 0 002 2v2a2 2 0 002 2h2a2 2 0 012-2V7a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 00-2 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">📈 Track Progress</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Monitor your learning milestones, complete skill assessments, and update your profile as you gain new competencies. Celebrate your achievements!
                  </p>
                </div>
                
                <div className="group bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">🤝 Get Support</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Use our AI chatbot for personalized guidance, join professional communities, find mentors, and connect with peers on similar learning journeys.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmap;