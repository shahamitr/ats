import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Snackbar from './Snackbar';

interface Notification {
  id: string;
  type: 'pending-feedback' | 'info' | 'summary';
  message: string;
}

interface NotificationsPanelProps {
  userRole: string;
  candidateId?: number;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ userRole, candidateId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ open: false, message: '' });

  useEffect(() => {
    // Fetch pending feedback notifications for all users
    const fetchNotifications = async () => {
      try {
        if (userRole === 'Panelist') {
          // Panelist: show pending feedback assigned to them
          const res = await axios.get('/api/pending-feedback', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          const userId = localStorage.getItem('userId');
          const userPending = res.data.pending.filter((p: any) => String(p.panel_member) === userId);
          setNotifications(userPending.map((p: any) => ({ id: p.id, type: 'pending-feedback', message: `Pending feedback for candidate ${p.candidate_id} at stage ${p.stage}` })));
        } else if (userRole === 'Admin' || userRole === 'HR Manager') {
          // Admin/HR: show all pending feedback
          const res = await axios.get('/api/pending-feedback', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          setNotifications(res.data.pending.map((p: any) => ({ id: p.id, type: 'pending-feedback', message: `Panel member ${p.panel_member} has pending feedback for candidate ${p.candidate_id} at stage ${p.stage}` })));
        }
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to fetch notifications', type: 'error' });
      }
    };
    fetchNotifications();
  }, [userRole]);

  // AI summary notification (for HR/Admin)
  const handleFetchSummary = async () => {
    if (!candidateId) return;
    try {
      const res = await axios.get(`/api/candidates/${candidateId}/feedback-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSnackbar({ open: true, message: res.data.summary, type: 'info' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to fetch summary', type: 'error' });
    }
  };

  return (
    <div className="mb-4">
      <h4 className="font-bold mb-2">Notifications</h4>
      <ul className="space-y-2">
        {notifications.map(n => (
          <li key={n.id} className="bg-yellow-100 text-yellow-900 p-2 rounded">
            {n.message}
          </li>
        ))}
      </ul>
      {(userRole === 'Admin' || userRole === 'HR Manager') && candidateId && (
        <button onClick={handleFetchSummary} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Get AI Feedback Summary
        </button>
      )}
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </div>
  );
};

export default NotificationsPanel;
