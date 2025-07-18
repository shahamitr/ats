import React from 'react';
import DownloadCandidateJourneyButton from '../../components/DownloadCandidateJourneyButton';
import NotificationsPanel from '../../components/NotificationsPanel';
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
      <NotificationsPanel userRole="Admin" />
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <ul className="mb-4">
        <li>Manage Users (Add, Enable/Disable, Import/Export)</li>
        <li>Manage Candidates (Add, Enable/Disable, Import/Export, Download Journey)</li>
        <li>View Reports & Audit Logs</li>
      </ul>
      <DashboardFilters values={filters} onChange={setFilters} stages={stages} locations={locations} tags={tags} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => {/* TODO: Export filtered data logic */}}>Export Filtered Data</button>
      {/* Example button for candidate journey download */}
      <DownloadCandidateJourneyButton candidateId={1} userRole="Admin" />
    </div>
  );
};

export default AdminDashboard;
