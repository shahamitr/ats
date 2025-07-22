import React from 'react';
import DownloadCandidateJourneyButton from '../../components/DownloadCandidateJourneyButton';
import NotificationsPanel from '../../components/NotificationsPanel';
import CandidateManagementPanel from '../../components/CandidateManagementPanel';
import ReportsPanel from '../../components/ReportsPanel';
import DashboardFilters, { DashboardFilterValues } from '../../components/DashboardFilters';
import { useState } from 'react';

const AdminDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const stages = ['Screening', 'Interview', 'Offer', 'Hired'];
  const locations = ['Bangalore', 'Delhi', 'Remote'];
  const tags = ['Java', 'React', 'Python', 'Manager'];
  // Example: Admin can manage users, candidates, export data, etc.
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <NotificationsPanel userRole="Admin" />
      <hr className="my-6" />
      <ReportsPanel />
      <hr className="my-6" />
      <CandidateManagementPanel />
      <hr className="my-6" />
      <DashboardFilters values={filters} onChange={setFilters} stages={stages} locations={locations} tags={tags} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => {/* TODO: Export filtered data logic */}}>Export Filtered Data</button>
      {/* Example button for candidate journey download */}
      <DownloadCandidateJourneyButton candidateId={1} userRole="Admin" />
    </div>
  );
};

export default AdminDashboard;
