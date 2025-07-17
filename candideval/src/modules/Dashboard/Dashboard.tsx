// Dashboard.tsx
// Admin & Reporting Dashboard: filters, export, pending tracker, timeline, audit logs, backend
import React, { useState } from 'react';
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
}

const Dashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [filter, setFilter] = useState<{ date?: string; panelMember?: string; status?: string; role?: string }>({});

  // Fetch candidates (demo)
  const fetchCandidates = async () => {
    try {
      const res = await axios.get('/api/candidates', { params: filter });
      setCandidates(res.data);
    } catch (err) {
      alert('Error fetching candidates');
    }
  };

  // Export to CSV (demo)
  const exportCSV = () => {
    const header = 'Name,Status,Role,PanelMember,Date\n';
    const rows = candidates.map(c => `${c.name},${c.status},${c.role},${c.panelMember},${c.date}`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidates.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h2>Admin & Reporting Dashboard</h2>
      <div>
        <label>Date:
          <input type="date" onChange={e => setFilter(f => ({ ...f, date: e.target.value }))} />
        </label>
        <label>Panel Member:
          <input type="text" placeholder="Panel Member" onChange={e => setFilter(f => ({ ...f, panelMember: e.target.value }))} />
        </label>
        <label>Status:
          <select onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}>
            <option value="">All</option>
            <option value="Offered">Offered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </label>
        <label>Role/Department:
          <input type="text" placeholder="Role/Department" onChange={e => setFilter(f => ({ ...f, role: e.target.value }))} />
        </label>
        <button onClick={fetchCandidates}>Filter</button>
        <button onClick={exportCSV}>Export to CSV</button>
      </div>
      <h3>Candidate Timeline</h3>
      <ul>
        {candidates.map(c => (
          <li key={c.id}>
            {c.name} - {c.status} - {c.role} - {c.panelMember} - {c.date}
            <ul>
              {c.timeline.map((t, idx) => (
                <li key={idx}>{t.stage}: {t.duration}</li>
              ))}
            </ul>
            {/* Audit log view */}
            <h5>Audit Logs</h5>
            <ul>
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
