import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { roadmapAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const RoadmapDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmap();
  }, [id]);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await roadmapAPI.getSavedRoadmaps();
      const foundRoadmap = response.data.find(r => r.id === parseInt(id));
      if (foundRoadmap) {
        setRoadmap(foundRoadmap);
      } else {
        setError('Roadmap not found');
      }
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to fetch roadmap'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md">
            <h2 className="text-2xl font-bold text-red-800 mb-4">Roadmap Not Found</h2>
            <p className="text-red-600 mb-6">{error || 'The roadmap you are looking for does not exist.'}</p>
            <Link
              to="/roadmaps"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Roadmaps
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const roadmapData = roadmap.roadmap_data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-cyan-200 text-sm font-medium">Saved Roadmap</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {roadmap.title || roadmap.target_career || 'Learning Roadmap'}
              </h1>
              {roadmap.target_career && (
                <p className="text-xl text-blue-100 mb-6">{roadmap.target_career}</p>
              )}
            </div>
            
            <div className="ml-8">
              <Link
                to="/roadmaps"
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl text-white hover:bg-white/20 transition-colors border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Roadmaps
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Role Summary */}
        {roadmapData?.role_summary && (
          <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{roadmapData.role_summary.title}</h3>
            {roadmapData.role_summary.what_you_do && roadmapData.role_summary.what_you_do.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Key Responsibilities:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {roadmapData.role_summary.what_you_do.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {roadmapData.role_summary.required_stack && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Required Tech Stack:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(roadmapData.role_summary.required_stack).map(([category, skills]) => (
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
        {roadmapData?.gap_analysis && (
          <div className="mb-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Gap Analysis</h3>
            {roadmapData.gap_analysis.summary && (
              <p className="text-gray-700 mb-4 leading-relaxed">{roadmapData.gap_analysis.summary}</p>
            )}
            {roadmapData.gap_analysis.missing_skills && roadmapData.gap_analysis.missing_skills.length > 0 && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">Missing Skills:</h4>
                <div className="space-y-2">
                  {roadmapData.gap_analysis.missing_skills.map((skill, idx) => (
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
        {roadmapData?.roadmap && roadmapData.roadmap.phases && roadmapData.roadmap.phases.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Learning Phases</h3>
            <div className="space-y-6">
              {roadmapData.roadmap.phases.map((phase, phaseIdx) => (
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
    </div>
  );
};

export default RoadmapDetail;

