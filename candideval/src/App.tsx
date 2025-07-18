import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './modules/Auth/AuthContext';
import CandidateProfileManager from './modules/Candidate/CandidateProfileManager';
import FeedbackStageForm from './modules/Feedback/FeedbackStageForm';
import CompetencyRatingsForm from './modules/Competency/CompetencyRatingsForm';
import FinalRecommendationForm from './modules/Recommendation/FinalRecommendationForm';
import Dashboard from './modules/Dashboard/Dashboard';
import MenuBar from './components/MenuBar';
import AdminEmailTemplates from './pages/AdminEmailTemplates';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MenuBar />
        <Routes>
          <Route path="/candidate" element={<CandidateProfileManager />} />
          <Route path="/feedback" element={<FeedbackStageForm />} />
          <Route path="/competency" element={<CompetencyRatingsForm />} />
          <Route path="/recommendation" element={<FinalRecommendationForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin/email-templates" element={<AdminEmailTemplates />} />
          {/* Add more routes for other modules here */}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
