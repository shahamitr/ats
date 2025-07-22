// FeedbackStageForm.tsx
// Stage-Based Feedback Collection: panel assignment, feedback, scores, outcome, completion tracker, edit restrictions
import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../Auth/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Stage-Based Feedback Collection</CardTitle>
      </CardHeader>
      <CardContent>
      <form onSubmit={e => { e.preventDefault(); saveFeedbacks(); }} className="space-y-8">
        <div className="space-y-6">
          {feedbacks.map((fb, idx) => (
            <Card key={fb.stage}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{fb.stage}</CardTitle>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${fb.completed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {fb.completed ? 'Complete' : 'Incomplete'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`panelMember-${idx}`}>Panel Member</Label>
                    <Select value={fb.panelMember} onValueChange={canEdit ? (value) => handleChange(idx, 'panelMember', value) : undefined} disabled={!canEdit}>
                      <SelectTrigger id={`panelMember-${idx}`}>
                        <SelectValue placeholder="Select Panelist" />
                      </SelectTrigger>
                      <SelectContent>
                        {panelMembers.map(pm => (<SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor={`score-${idx}`}>Score (1-10)</Label>
                          <Input id={`score-${idx}`} type="number" min={1} max={10} value={fb.score === 0 ? '' : fb.score} onChange={canEdit ? (e: React.ChangeEvent<HTMLInputElement>) => handleChange(idx, 'score', Number(e.target.value)) : undefined} disabled={!canEdit} />
                      </div>
                      <div className="space-y-2">
                          <Label htmlFor={`outcome-${idx}`}>Outcome</Label>
                          <Select value={fb.outcome} onValueChange={canEdit ? (value: 'Yes' | 'No') => handleChange(idx, 'outcome', value) : undefined} disabled={!canEdit}>
                            <SelectTrigger id={`outcome-${idx}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="No">No</SelectItem>
                              <SelectItem value="Yes">Yes</SelectItem>
                            </SelectContent>
                          </Select>
                      </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`feedback-${idx}`}>Feedback</Label>
                  <div className="bg-background">
                    <ReactQuill id={`feedback-${idx}`} theme="snow" value={fb.feedback} onChange={canEdit ? (val: string) => handleChange(idx, 'feedback', val) : undefined} readOnly={!canEdit} placeholder="Enter detailed feedback..." />
                  </div>
                </div>

                {/* Audit log view for each stage */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Audit Logs</h5>
                  <ul className="text-xs text-muted-foreground space-y-1 max-h-20 overflow-y-auto rounded-md border p-2">
                    {(fb.auditLogs || []).length > 0 ? (fb.auditLogs || []).map((log, i) => (
                      <li key={i}>{new Date(log.timestamp).toLocaleString()}: {log.user} - {log.action}</li>
                    )) : <li>No audit history for this stage.</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {canEdit && (
          <div className="flex justify-end pt-4">
            <Button type="submit">
              Save All Feedbacks
            </Button>
          </div>
        )}
      </form>
      </CardContent>
    </Card>
  );
};

export default FeedbackStageForm;
