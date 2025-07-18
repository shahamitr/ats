// Dashboard.tsx
// Admin & Reporting Dashboard: filters, export, pending tracker, timeline, audit logs, backend
import React, { useState, useEffect } from 'react';
import { Chart } from 'react-chartjs-2'; // Placeholder, install chart.js and react-chartjs-2
import axios from 'axios';

interface AuditLog {
  action: string;
  user: string;
  timestamp: string;
}

interface CandidateSummary {
  id: string;
  name: string;
  status: string;
  role: string;
  panelMember: string;
  date: string;
  timeline: Array<{ stage: string; duration: string }>;
  auditLogs?: AuditLog[];
  score?: number;
  tags?: string;
}

const Dashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [filter, setFilter] = useState<{ date?: string; panelMember?: string; status?: string; role?: string; stage?: string; scoreMin?: number; scoreMax?: number; tags?: string }>({});
  const [theme, setTheme] = useState<'light' | 'dark'>(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');

  // Fetch candidates (demo)
  const fetchCandidates = async () => {
    try {
      const res = await axios.get('/api/candidates', { params: filter });
      setCandidates(res.data);
    } catch (err) {
      alert('Error fetching candidates');
    }
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Export to CSV (demo)
  const exportCSV = () => {
    const header = 'Name,Status,Role,PanelMember,Date,Stage,Score,Tags\n';
    const rows = candidates.map(c => `${c.name},${c.status},${c.role},${c.panelMember},${c.date},${c.timeline.map(t=>t.stage).join('|')},${c.score || ''},${c.tags || ''}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export to PDF (simple demo)
  const exportPDF = () => {
    window.print(); // For demo, use browser print to PDF
  };

  return (
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Admin & Reporting Dashboard</h2>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="px-4 py-2 rounded bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1">Date</label>
          <input type="date" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
        </div>
        <div>
          <label className="block mb-1">Panel Member</label>
          <input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Panel Member" onChange={e => setFilter(f => ({ ...f, panelMember: e.target.value }))} />
        </div>
        <div>
          <label className="block mb-1">Status</label>
          <select className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Role/Department</label>
          <input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Role/Department" onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} />
        </div>
        <div>
          <label className="block mb-1">Stage</label>
          <input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Stage" onChange={e => setFilter(f => ({ ...f, stage: e.target.value }))} />
        </div>
        <div>
          <label className="block mb-1">Score Range</label>
          <div className="flex gap-2">
            <input type="number" className="w-1/2 p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Min" onChange={e => setFilter(f => ({ ...f, scoreMin: Number(e.target.value) }))} />
            <input type="number" className="w-1/2 p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Max" onChange={e => setFilter(f => ({ ...f, scoreMax: Number(e.target.value) }))} />
          </div>
        </div>
        <div>
          <label className="block mb-1">Tags</label>
          <input type="text" className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white" placeholder="Tags" onChange={e => setFilter(f => ({ ...f, tags: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <button onClick={fetchCandidates} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Filter</button>
        <button onClick={exportCSV} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Export CSV</button>
        <button onClick={exportPDF} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">Export PDF</button>
      </div>
      {/* Chart/Visualization Placeholder */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Summary Charts</h3>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          {/* Replace with actual chart component */}
          <div className="h-48 flex items-center justify-center text-gray-400 dark:text-gray-500">[Charts go here]</div>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">Candidate Timeline</h3>
      <ul className="space-y-4">
        {candidates.map(c => (
          <li key={c.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-bold">{c.name}</span> - {c.status} - {c.role} - {c.panelMember} - {c.date}
              </div>
              <div className="flex gap-2">
                <button className="px-2 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600">Edit</button>
                <button className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600">View</button>
                <button className="px-2 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600">Assign</button>
              </div>
            </div>
            <ul className="ml-4 mt-2">
              {c.timeline.map((t, idx) => (
                <li key={idx}>{t.stage}: {t.duration}</li>
              ))}
            </ul>
            {/* Audit log view */}
            <h5 className="mt-2 font-semibold">Audit Logs</h5>
            <ul className="ml-4">
              {(c.auditLogs || []).map((log, i) => (
                <li key={i}>{log.timestamp}: {log.user} - {log.action}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
