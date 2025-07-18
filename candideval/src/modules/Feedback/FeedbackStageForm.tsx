// FeedbackStageForm.tsx
// Stage-Based Feedback Collection: panel assignment, feedback, scores, outcome, completion tracker, edit restrictions
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';
// Dummy data for stages and panelMembers (replace with actual imports or props as needed)
const stages = ['Screening', 'Technical', 'Managerial', 'HR'];
const panelMembers = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
];

interface AuditLog {
  action: string;
  user: string;
  timestamp: string;
}

interface StageFeedback {
  stage: string;
  panelMember: string;
  feedback: string;
  score: number;
  outcome: 'Yes' | 'No';
  completed: boolean;
  auditLogs: AuditLog[];
}
const FeedbackStageForm: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<StageFeedback[]>(
    stages.map(stage => ({
      stage,
      panelMember: '',
      feedback: '',
      score: 0,
      outcome: 'No',
      completed: false,
      auditLogs: [],
    }))
  );

  const handleChange = (idx: number, field: keyof StageFeedback, value: any) => {
    const updated = [...feedbacks];
    (updated[idx] as any)[field] = value;
    // Completion tracker
    updated[idx].completed = !!(updated[idx].panelMember && updated[idx].feedback && updated[idx].score);
    // Audit log for edit
    updated[idx].auditLogs = [
      ...(updated[idx].auditLogs || []),
      { action: `Updated ${field}`, user: 'panelist', timestamp: new Date().toISOString() },
    ];
    setFeedbacks(updated);
  };

  // Backend connection (demo: save feedbacks)
  const saveFeedbacks = async () => {
    try {
      await axios.post('/api/feedbacks', feedbacks);
      // Add audit log for save
      setFeedbacks(fbs => fbs.map(fb => ({
        ...fb,
        auditLogs: [
          ...(fb.auditLogs || []),
          { action: 'Feedback saved', user: 'panelist', timestamp: new Date().toISOString() },
        ],
      })));
      alert('Feedbacks saved successfully!');
    } catch (err) {
      alert('Error saving feedbacks');
    }
  };

  const canEdit = user && (user.role === 'Panelist' || user.role === 'Admin');
  return (
    <div>
      <h2>Stage-Based Feedback Collection</h2>
      <form onSubmit={e => { e.preventDefault(); saveFeedbacks(); }}>
        {feedbacks.map((fb, idx) => (
          <div key={fb.stage} style={{ border: '1px solid #ccc', margin: '8px', padding: '8px' }}>
            <h4>{fb.stage}</h4>
            <label>Panel Member:
              <select
                value={fb.panelMember}
                onChange={canEdit ? e => handleChange(idx, 'panelMember', e.target.value) : undefined}
                disabled={!canEdit}
              >
                <option value="">Select</option>
                {panelMembers.map(pm => (
                  <option key={pm.id} value={pm.name}>{pm.name}</option>
                ))}
              </select>
            </label>
            <br />
            <label>Feedback:
              <div style={{ margin: '8px 0' }}>
                <ReactQuill value={fb.feedback} onChange={canEdit ? (val: string) => handleChange(idx, 'feedback', val) : undefined} readOnly={!canEdit} placeholder="Enter feedback (2-7 lines)" />
              </div>
            </label>
            <br />
            <label>Score:
              <input
                type="number"
                min={1}
                max={10}
                value={fb.score}
                onChange={canEdit ? (e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, 'score', Number(e.target.value)) : undefined}
                disabled={!canEdit}
              />
            </label>
            <br />
            <label>Outcome:
              <select
                value={fb.outcome}
                onChange={canEdit ? (e: React.ChangeEvent<HTMLSelectElement>) => handleChange(idx, 'outcome', e.target.value as 'Yes' | 'No') : undefined}
                disabled={!canEdit}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </label>
            <br />
            <span style={{ color: fb.completed ? 'green' : 'red' }}>
              {fb.completed ? 'Complete' : 'Incomplete'}
            </span>
            {/* Audit log view for each stage */}
            <h5>Audit Logs</h5>
            <ul>
              {(fb.auditLogs || []).map((log, i) => (
                <li key={i}>{log.timestamp}: {log.user} - {log.action}</li>
              ))}
            </ul>
          </div>
        ))}
        {canEdit && <button type="submit">Save All Feedbacks</button>}
      </form>
    </div>
  );
};

export default FeedbackStageForm;
