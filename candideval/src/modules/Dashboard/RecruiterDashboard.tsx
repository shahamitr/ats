import React from 'react';
import NotificationsPanel from '../../components/NotificationsPanel';
import DashboardFilters, { DashboardFilterValues } from '../../components/DashboardFilters';
import { useState } from 'react';

const RecruiterDashboard: React.FC = () => {
  const [filters, setFilters] = useState<DashboardFilterValues>({});
  const stages = ['Screening', 'Interview', 'Offer', 'Hired'];
  const locations = ['Bangalore', 'Delhi', 'Remote'];
  const tags = ['Java', 'React', 'Python', 'Manager'];
  // Example: Recruiter can add candidates, view status, export candidate list, etc.
  return (
    <div className="p-8">
      <NotificationsPanel userRole="Recruiter" />
      <h1 className="text-2xl font-bold mb-4">Recruiter Dashboard</h1>
      <ul className="mb-4">
        <li>Add Candidates</li>
        <li>View Candidate Status</li>
        <li>Export Candidate List</li>
      </ul>
      <DashboardFilters values={filters} onChange={setFilters} stages={stages} locations={locations} tags={tags} />
      <button className="bg-blue-600 text-white px-4 py-2 rounded mb-4" onClick={() => {/* TODO: Export filtered data logic */}}>Export Filtered Data</button>
    </div>
  );
};

export default RecruiterDashboard;
