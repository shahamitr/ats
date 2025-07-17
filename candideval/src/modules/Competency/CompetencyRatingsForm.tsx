// CompetencyRatingsForm.tsx
// Competency Ratings: Communication, Cultural Fit, Passion, Leadership, Learning Agility (1-5 scale)
import React, { useState } from 'react';
import axios from 'axios';

interface AuditLog {
  action: string;
  user: string;
  timestamp: string;
}

interface CompetencyRatings {
  communication: number;
  culturalFit: number;
  passion: number;
  leadership: number;
  learningAgility: number;
  auditLogs?: AuditLog[];
}

const initialRatings: CompetencyRatings = {
  communication: 1,
  culturalFit: 1,
  passion: 1,
  leadership: 1,
  learningAgility: 1,
  auditLogs: [],
};

const CompetencyRatingsForm: React.FC = () => {
  const [ratings, setRatings] = useState<CompetencyRatings>(initialRatings);

  const handleChange = (field: keyof CompetencyRatings, value: number) => {
    const updated = { ...ratings, [field]: value };
    updated.auditLogs = [
      ...(ratings.auditLogs || []),
      { action: `Updated ${field}`, user: 'panelist', timestamp: new Date().toISOString() },
    ];
    setRatings(updated);
  };

  // Backend connection (demo: save ratings)
  const saveRatings = async () => {
    try {
      await axios.post('/api/competency-ratings', ratings);
      setRatings(r => ({
        ...r,
        auditLogs: [
          ...(r.auditLogs || []),
          { action: 'Ratings saved', user: 'panelist', timestamp: new Date().toISOString() },
        ],
      }));
      alert('Ratings saved successfully!');
    } catch (err) {
      alert('Error saving ratings');
    }
  };

  return (
    <div>
      <h2>Competency Ratings</h2>
      <form onSubmit={e => { e.preventDefault(); saveRatings(); }}>
        <label>Communication Skills:
          <select value={ratings.communication} onChange={e => handleChange('communication', Number(e.target.value))}>
            {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </label>
        <br />
        <label>Cultural Fit:
          <select value={ratings.culturalFit} onChange={e => handleChange('culturalFit', Number(e.target.value))}>
            {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </label>
        <br />
        <label>Passion:
          <select value={ratings.passion} onChange={e => handleChange('passion', Number(e.target.value))}>
            {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </label>
        <br />
        <label>Leadership Potential:
          <select value={ratings.leadership} onChange={e => handleChange('leadership', Number(e.target.value))}>
            {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </label>
        <br />
        <label>Learning Agility:
          <select value={ratings.learningAgility} onChange={e => handleChange('learningAgility', Number(e.target.value))}>
            {[1,2,3,4,5].map(val => <option key={val} value={val}>{val}</option>)}
          </select>
        </label>
        <br />
        <button type="submit">Save Ratings</button>
      </form>
      {/* Audit log view */}
      <h3>Audit Logs</h3>
      <ul>
        {(ratings.auditLogs || []).map((log, idx) => (
          <li key={idx}>{log.timestamp}: {log.user} - {log.action}</li>
        ))}
      </ul>
    </div>
  );
};

export default CompetencyRatingsForm;
