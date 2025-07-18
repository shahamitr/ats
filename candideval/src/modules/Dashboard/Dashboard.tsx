// Dashboard.tsx
// Admin & Reporting Dashboard: filters, export, pending tracker, timeline, audit logs, backend
import React from 'react';
import { useAuth } from '../Auth/AuthContext';
import AdminDashboard from './AdminDashboard';
import HRDashboard from './HRDashboard';
import RecruiterDashboard from './RecruiterDashboard';
import PanelistDashboard from './PanelistDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <div className="p-8">Please log in to view your dashboard.</div>;

  switch (user.role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'HR Manager':
      return <HRDashboard />;
    case 'Recruiter':
      return <RecruiterDashboard />;
    case 'Panelist':
      return <PanelistDashboard />;
    default:
      return <div className="p-8">No dashboard available for your role.</div>;
  }
};

export default Dashboard;
