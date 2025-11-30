import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import Navbar from './components/Common/Navbar';
import LandingPage from './pages/LandingPage';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

import Dashboard from './pages/User/Dashboard';
import Profile from './pages/User/Profile';
import ResumeUpload from './pages/User/ResumeUpload';
import CareerRecommendations from './pages/User/CareerRecommendations';
import Jobs from './pages/User/Jobs';
import Roadmap from './pages/User/Roadmap';
import Analysis from './pages/User/Analysis';
import Chat from './pages/User/Chat';

import RecruiterDashboard from './pages/Recruiter/Dashboard';
import CreateJob from './pages/Recruiter/CreateJob';
import ManageJobs from './pages/Recruiter/ManageJobs';

const HomePage = () => {
  const { isAuthenticated, isUser, isRecruiter } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  if (isUser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isRecruiter) {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

const ConditionalNavbar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Don't show navbar on landing page when not authenticated
  if (!isAuthenticated && location.pathname === '/') {
    return null;
  }
  
  return <Navbar />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <ConditionalNavbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute userType="user">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute userType="user">
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/resume" 
              element={
                <ProtectedRoute userType="user">
                  <ResumeUpload />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute userType="user">
                  <CareerRecommendations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/jobs" 
              element={
                <ProtectedRoute userType="user">
                  <Jobs />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/roadmap" 
              element={
                <ProtectedRoute userType="user">
                  <Roadmap />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <ProtectedRoute userType="user">
                  <Analysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <ProtectedRoute userType="user">
                  <Chat />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/recruiter/dashboard" 
              element={
                <ProtectedRoute userType="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/create-job" 
              element={
                <ProtectedRoute userType="recruiter">
                  <CreateJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recruiter/jobs" 
              element={
                <ProtectedRoute userType="recruiter">
                  <ManageJobs />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
