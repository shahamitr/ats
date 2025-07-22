// FeedbackStageForm.tsx
// Stage-Based Feedback Collection: panel assignment, feedback, scores, outcome, completion tracker, edit restrictions
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';
// Dummy data for stages and panelMembers (replace with actual imports or props as needed)
const stages = ['Screening', 'Technical Round 1', 'Managerial', 'HR Round'];
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
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Stage-Based Feedback Collection</h2>
      <form onSubmit={e => { e.preventDefault(); saveFeedbacks(); }} className="space-y-8">
        <div className="space-y-6">
          {feedbacks.map((fb, idx) => (
            <div key={fb.stage} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">{fb.stage}</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${fb.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {fb.completed ? 'Complete' : 'Incomplete'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor={`panelMember-${idx}`} className="block text-sm font-medium text-gray-700">Panel Member</label>
                  <select
                    id={`panelMember-${idx}`}
                    value={fb.panelMember}
                    onChange={canEdit ? e => handleChange(idx, 'panelMember', e.target.value) : undefined}
                    disabled={!canEdit}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                  >
                    <option value="">Select Panelist</option>
                    {panelMembers.map(pm => (
                      <option key={pm.id} value={pm.name}>{pm.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`score-${idx}`} className="block text-sm font-medium text-gray-700">Score (1-10)</label>
                        <input
                            id={`score-${idx}`}
                            type="number"
                            min={1} max={10}
                            value={fb.score === 0 ? '' : fb.score}
                            onChange={canEdit ? (e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, 'score', Number(e.target.value)) : undefined}
                            disabled={!canEdit}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
                        />
                    </div>
                    <div>
                        <label htmlFor={`outcome-${idx}`} className="block text-sm font-medium text-gray-700">Outcome</label>
                        <select
                            id={`outcome-${idx}`}
                            value={fb.outcome}
                            onChange={canEdit ? (e: React.ChangeEvent<HTMLSelectElement>) => handleChange(idx, 'outcome', e.target.value as 'Yes' | 'No') : undefined}
                            disabled={!canEdit}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100"
                        >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                        </select>
                    </div>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor={`feedback-${idx}`} className="block text-sm font-medium text-gray-700">Feedback</label>
                <div className="mt-1">
                  <ReactQuill id={`feedback-${idx}`} theme="snow" value={fb.feedback} onChange={canEdit ? (val: string) => handleChange(idx, 'feedback', val) : undefined} readOnly={!canEdit} placeholder="Enter detailed feedback..." />
                </div>
              </div>

              {/* Audit log view for each stage */}
              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-600">Audit Logs</h5>
                <ul className="mt-2 text-xs text-gray-500 space-y-1 max-h-20 overflow-y-auto">
                  {(fb.auditLogs || []).length > 0 ? (fb.auditLogs || []).map((log, i) => (
                    <li key={i}>{new Date(log.timestamp).toLocaleString()}: {log.user} - {log.action}</li>
                  )) : <li>No audit history for this stage.</li>}
                </ul>
              </div>
            </div>
          ))}
        </div>
        {canEdit && (
          <div className="flex justify-end pt-4">
            <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Save All Feedbacks
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default FeedbackStageForm;
