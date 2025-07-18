import React from 'react';

interface Activity {
  timestamp: string;
  user: string;
  action: string;
}

const RecentActivity: React.FC<{ activities: Activity[] }> = ({ activities }) => (
  <div className="mb-4">
    <h4 className="font-bold mb-2">Recent Activity</h4>
    <ul className="space-y-1">
      {activities.map((log, idx) => (
        <li key={idx} className="text-sm text-gray-700">
          <span className="font-semibold">{log.user}</span> - {log.action} <span className="text-gray-500">({new Date(log.timestamp).toLocaleString()})</span>
        </li>
      ))}
    </ul>
  </div>
);

export default RecentActivity;
