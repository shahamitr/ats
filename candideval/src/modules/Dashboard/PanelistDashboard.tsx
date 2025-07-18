import React from 'react';
import NotificationsPanel from '../../components/NotificationsPanel';
import DashboardFilters, { DashboardFilterValues } from '../../components/DashboardFilters';
import { useState } from 'react';

const PanelistDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const stages = ['Screening', 'Interview', 'Offer', 'Hired'];
  const locations = ['Bangalore', 'Delhi', 'Remote'];
  const tags = ['Java', 'React', 'Python', 'Manager'];
  // Example: Panelist can view assigned candidates, submit feedback, view timeline, etc.
  return (
    <div className="p-8">
      <NotificationsPanel userRole="Panelist" />
      <h1 className="text-2xl font-bold mb-4">Panelist Dashboard</h1>
      <ul className="mb-4">
        <li>View Assigned Candidates</li>
        <li>Submit Feedback</li>
        <li>View Timeline</li>
      </ul>
      <DashboardFilters values={filters} onChange={setFilters} stages={stages} locations={locations} tags={tags} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => {/* TODO: Export filtered data logic */}}>Export Filtered Data</button>
    </div>
  );
};

export default PanelistDashboard;
