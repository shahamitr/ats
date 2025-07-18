// FinalRecommendationForm.tsx
// Final Recommendation Engine: cumulative score, status selector, suggestions, audit logs, backend
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

interface AuditLog {
  action: string;
  user: string;
  timestamp: string;
}

interface Recommendation {
  cumulativeScore: number;
  status: 'Select' | 'Hold' | 'Reject';
  suggestions: string;
  auditLogs?: AuditLog[];
}

const initialRecommendation: Recommendation = {
  cumulativeScore: 0,
  status: 'Hold',
  suggestions: '',
  auditLogs: [],
};

const FinalRecommendationForm: React.FC = () => {
  const [rec, setRec] = useState<Recommendation>(initialRecommendation);

  const handleChange = (field: keyof Recommendation, value: any) => {
    const updated = { ...rec, [field]: value };
    updated.auditLogs = [
      ...(rec.auditLogs || []),
      { action: `Updated ${field}`, user: 'HR Manager', timestamp: new Date().toISOString() },
    ];
    setRec(updated);
  };

  // Backend connection (demo: save recommendation)
  const saveRecommendation = async () => {
    try {
      await axios.post('/api/recommendation', rec);
      setRec(r => ({
        ...r,
        auditLogs: [
          ...(r.auditLogs || []),
          { action: 'Recommendation saved', user: 'HR Manager', timestamp: new Date().toISOString() },
        ],
      }));
      alert('Recommendation saved successfully!');
    } catch (err) {
      alert('Error saving recommendation');
    }
  };

  return (
    <div>
      <h2>Final Recommendation</h2>
      <form onSubmit={e => { e.preventDefault(); saveRecommendation(); }}>
        <label>Cumulative Score:
          <input
            type="number"
            min={0}
            max={100}
            value={rec.cumulativeScore}
            onChange={e => handleChange('cumulativeScore', Number(e.target.value))}
          />
        </label>
        <br />
        <label>Status:
          <select value={rec.status} onChange={e => handleChange('status', e.target.value as Recommendation['status'])}>
            <option value="Select">Select</option>
            <option value="Hold">Hold</option>
            <option value="Reject">Reject</option>
          </select>
        </label>
        <br />
        <label>Suggestions:
          <div style={{ margin: '8px 0' }}>
            <ReactQuill value={rec.suggestions} onChange={(val: string) => handleChange('suggestions', val)} placeholder="Optional suggestions box" />
          </div>
        </label>
        <br />
        <button type="submit">Save Recommendation</button>
      </form>
      {/* Audit log view */}
      <h3>Audit Logs</h3>
      <ul>
        {(rec.auditLogs || []).map((log, idx) => (
          <li key={idx}>{log.timestamp}: {log.user} - {log.action}</li>
        ))}
      </ul>
    </div>
  );
};

export default FinalRecommendationForm;
