import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './modules/Auth/AuthContext';
import CandidateProfileManager from './modules/Candidate/CandidateProfileManager';
import FeedbackStageForm from './modules/Feedback/FeedbackStageForm';
import CompetencyRatingsForm from './modules/Competency/CompetencyRatingsForm';
import FinalRecommendationForm from './modules/Recommendation/FinalRecommendationForm';
import Dashboard from './modules/Dashboard/Dashboard';
import MenuBar from './components/MenuBar';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AdminEmailTemplates from './pages/AdminEmailTemplates';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <>
      {user && <MenuBar />}
      <div className="p-4 sm:p-6 lg:p-8">
        <ErrorBoundary>
          <Routes>
            <Route path="/login" element={<Login />} />
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/candidate" element={<CandidateProfileManager />} />
              <Route path="/feedback" element={<FeedbackStageForm />} />
              <Route path="/competency" element={<CompetencyRatingsForm />} />
              <Route path="/recommendation" element={<FinalRecommendationForm />} />
              <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
            </Route>
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
          </Routes>
        </ErrorBoundary>
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
