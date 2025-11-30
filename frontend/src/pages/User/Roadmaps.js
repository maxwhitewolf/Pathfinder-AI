import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roadmapAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const Roadmaps = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const fetchRoadmaps = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await roadmapAPI.getSavedRoadmaps();
      setRoadmaps(response.data || []);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch saved roadmaps'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roadmapId) => {
    if (!window.confirm('Are you sure you want to delete this roadmap?')) {
      return;
    }
    
    setDeletingId(roadmapId);
    try {
      await roadmapAPI.deleteRoadmap(roadmapId);
      setRoadmaps(roadmaps.filter(r => r.id !== roadmapId));
    } catch (error) {
      alert(getErrorFromResponse(error, 'Failed to delete roadmap'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleSwap = (index1, index2) => {
    const newRoadmaps = [...roadmaps];
    [newRoadmaps[index1], newRoadmaps[index2]] = [newRoadmaps[index2], newRoadmaps[index1]];
    setRoadmaps(newRoadmaps);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

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
            <span className="text-cyan-200 text-sm font-medium">Your Saved Roadmaps</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            My
            <span className="block bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Roadmaps
            </span>
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Manage your saved learning roadmaps. You can save up to 3 roadmaps at a time.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
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
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Roadmaps Grid */}
        {roadmaps.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {roadmaps.map((roadmap, index) => (
              <div key={roadmap.id} className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50 hover:shadow-2xl transition-all duration-500 relative">
                {/* Position Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xs font-bold">
                    #{index + 1}
                  </span>
                </div>

                {/* Roadmap Content */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 pr-16">
                    {roadmap.title || roadmap.target_career || 'Untitled Roadmap'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {roadmap.roadmap_type === 'job' ? 'Job-based Roadmap' : 'Career Roadmap'}
                  </p>
                  {roadmap.target_career && (
                    <p className="text-sm text-gray-500">
                      Target: {roadmap.target_career}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(roadmap.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Roadmap Preview */}
                {roadmap.roadmap_data && (
                  <div className="mb-4 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    {roadmap.roadmap_data.role_summary && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Role:</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {roadmap.roadmap_data.role_summary.title || 'N/A'}
                        </p>
                      </div>
                    )}
                    {roadmap.roadmap_data.roadmap && roadmap.roadmap_data.roadmap.phases && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Phases:</p>
                        <p className="text-sm text-gray-900">
                          {roadmap.roadmap_data.roadmap.phases.length} learning phases
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                  <Link
                    to={`/roadmaps/${roadmap.id}`}
                    className="w-full text-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300 transform hover:scale-105"
                  >
                    View Roadmap →
                  </Link>
                  
                  <div className="flex gap-2">
                    {index > 0 && (
                      <button
                        onClick={() => handleSwap(index, index - 1)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                        title="Move up"
                      >
                        ↑
                      </button>
                    )}
                    {index < roadmaps.length - 1 && (
                      <button
                        onClick={() => handleSwap(index, index + 1)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                        title="Move down"
                      >
                        ↓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(roadmap.id)}
                      disabled={deletingId === roadmap.id}
                      className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                      title="Delete roadmap"
                    >
                      {deletingId === roadmap.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-lg rounded-2xl p-12 shadow-xl border border-white/20 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No saved roadmaps yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Generate a roadmap from a job listing or create a career roadmap to get started.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                to="/jobs"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-400 hover:to-purple-500 transition-all duration-300"
              >
                Browse Jobs
              </Link>
              <Link
                to="/recommendations"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300 border border-gray-200"
              >
                Career Recommendations
              </Link>
            </div>
          </div>
        )}

        {/* Info Box */}
        {roadmaps.length > 0 && roadmaps.length < 3 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Save More Roadmaps</h3>
                <p className="text-gray-700">
                  You can save up to 3 roadmaps. You currently have {roadmaps.length} saved roadmap{roadmaps.length !== 1 ? 's' : ''}. 
                  Generate roadmaps from job listings or create career roadmaps to save them here.
                </p>
              </div>
            </div>
          </div>
        )}

        {roadmaps.length >= 3 && (
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200/50 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Maximum Roadmaps Reached</h3>
                <p className="text-gray-700">
                  You have reached the maximum of 3 saved roadmaps. To save a new roadmap, delete an existing one first.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roadmaps;

