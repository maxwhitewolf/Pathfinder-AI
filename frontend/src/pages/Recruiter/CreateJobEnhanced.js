import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { getErrorFromResponse } from '../../utils/errorHandler';

const CreateJobEnhanced = () => {
  const [formData, setFormData] = useState({
    job_title: '',
    company_name: '',
    location_city: '',
    location_country: '',
    is_remote: false,
    work_type: 'onsite',
    job_type: 'full_time',
    experience_level: 'fresher',
    min_experience_years: '',
    max_experience_years: '',
    min_salary: '',
    max_salary: '',
    salary_currency: 'INR',
    salary_pay_period: 'year',
    is_salary_visible: true,
    industry: '',
    jd_text: '',
    skills_required: [],
    nice_to_have_skills: [],
    employment_level: 'entry_level',
    application_url: '',
    application_email: '',
    application_deadline: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newNiceSkill, setNewNiceSkill] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkill = (type) => {
    const skill = type === 'required' ? newSkill.trim() : newNiceSkill.trim();
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    
    if (skill && !formData[field].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], skill]
      }));
      if (type === 'required') {
        setNewSkill('');
      } else {
        setNewNiceSkill('');
      }
    }
  };

  const removeSkill = (index, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.job_title.trim()) {
      setError('Job title is required');
      setLoading(false);
      return;
    }
    if (!formData.jd_text.trim() || formData.jd_text.trim().length < 10) {
      setError('Job description must be at least 10 characters');
      setLoading(false);
      return;
    }
    if (formData.skills_required.length === 0) {
      setError('Please add at least one required skill');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const submitData = {
        ...formData,
        min_experience_years: formData.min_experience_years ? parseInt(formData.min_experience_years) : null,
        max_experience_years: formData.max_experience_years ? parseInt(formData.max_experience_years) : null,
        min_salary: formData.min_salary ? parseInt(formData.min_salary) : null,
        max_salary: formData.max_salary ? parseInt(formData.max_salary) : null,
        application_deadline: formData.application_deadline || null,
      };

      await jobAPI.createJobEnhanced(submitData);
      setSuccess('Job posted successfully!');
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 2000);
    } catch (error) {
      setError(getErrorFromResponse(error, 'Failed to create job posting'));
    } finally {
      setLoading(false);
    }
  };

  const commonSkills = [
    'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'SQL', 'AWS', 'Docker',
    'Leadership', 'Communication', 'Project Management', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'DevOps', 'Git', 'TypeScript', 'MongoDB'
  ];

  const addCommonSkill = (skill, type) => {
    const field = type === 'required' ? 'skills_required' : 'nice_to_have_skills';
    if (!formData[field].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], skill]
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job Posting</h1>
          <p className="text-gray-600 mb-6">Fill in all the details to post your job</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="location_city"
                    value={formData.location_city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="location_country"
                    value={formData.location_country}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., India"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_remote"
                    checked={formData.is_remote}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Remote Position</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Type</label>
                  <select
                    name="work_type"
                    value={formData.work_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
                  <select
                    name="experience_level"
                    value={formData.experience_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Experience (Years)</label>
                  <input
                    type="number"
                    name="min_experience_years"
                    value={formData.min_experience_years}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Experience (Years)</label>
                  <input
                    type="number"
                    name="max_experience_years"
                    value={formData.max_experience_years}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employment Level</label>
                  <select
                    name="employment_level"
                    value={formData.employment_level}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="entry_level">Entry Level</option>
                    <option value="mid_level">Mid Level</option>
                    <option value="senior_level">Senior Level</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Technology"
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Salary Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Salary</label>
                  <input
                    type="number"
                    name="min_salary"
                    value={formData.min_salary}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Salary</label>
                  <input
                    type="number"
                    name="max_salary"
                    value={formData.max_salary}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    name="salary_currency"
                    value={formData.salary_currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pay Period</label>
                  <select
                    name="salary_pay_period"
                    value={formData.salary_pay_period}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="year">Per Year</option>
                    <option value="month">Per Month</option>
                    <option value="hour">Per Hour</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_salary_visible"
                    checked={formData.is_salary_visible}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Show Salary in Listing</label>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="jd_text"
                value={formData.jd_text}
                onChange={handleChange}
                required
                rows="8"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter the complete job description, responsibilities, requirements, etc."
              />
            </div>

            {/* Skills */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
              
              {/* Required Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
                    placeholder="Add required skill"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('required')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills_required.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, 'required')}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {commonSkills.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addCommonSkill(skill, 'required')}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200"
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nice to Have Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nice to Have Skills</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newNiceSkill}
                    onChange={(e) => setNewNiceSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('nice'))}
                    placeholder="Add nice-to-have skill"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addSkill('nice')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.nice_to_have_skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(index, 'nice')}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Application Details */}
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Application Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application URL</label>
                  <input
                    type="url"
                    name="application_url"
                    value={formData.application_url}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://company.com/apply"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Email</label>
                  <input
                    type="email"
                    name="application_email"
                    value={formData.application_email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="jobs@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                  <input
                    type="date"
                    name="application_deadline"
                    value={formData.application_deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/recruiter/jobs')}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <LoadingSpinner /> : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateJobEnhanced;

