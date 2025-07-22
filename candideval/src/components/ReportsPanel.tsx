import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, PieChart, RadarChart } from './ChartComponents';
import Snackbar from './Snackbar';

interface AnalyticsData {
  candidatesByMonth: { month: string; count: number }[];
  interviewOutcomes: { result: string; count: number }[];
  competencyAverages: {
    communication: number | null;
    cultural_fit: number | null;
    passion: number | null;
    leadership: number | null;
    learning_agility: number | null;
  };
}

const ReportsPanel: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; type?: 'success' | 'error' | 'info' }>({ open: false, message: '' });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get<AnalyticsData>('/api/reports/analytics', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnalytics(res.data);
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to load analytics data', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="text-center p-4">Loading reports...</div>;
  }

  if (!analytics) {
    return <div className="text-center p-4">No analytics data available.</div>;
  }

  const candidatesByMonthData = {
    labels: analytics.candidatesByMonth.map(d => d.month),
    datasets: [
      {
        label: 'New Candidates',
        data: analytics.candidatesByMonth.map(d => d.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const interviewOutcomesData = {
    labels: analytics.interviewOutcomes.map(d => d.result),
    datasets: [
      {
        label: 'Interview Outcomes',
        data: analytics.interviewOutcomes.map(d => d.count),
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const competencyAveragesData = {
    labels: Object.keys(analytics.competencyAverages),
    datasets: [
      {
        label: 'Average Competency Score',
        data: Object.values(analytics.competencyAverages),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow"><BarChart data={candidatesByMonthData} title="New Candidates (Last 6 Months)" /></div>
        <div className="bg-white p-4 rounded-lg shadow"><PieChart data={interviewOutcomesData} title="Interview Outcomes" /></div>
        {Object.keys(analytics.competencyAverages).length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2"><RadarChart data={competencyAveragesData} title="Average Competency Ratings" /></div>
        )}
      </div>
      <Snackbar open={snackbar.open} message={snackbar.message} type={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })} />
    </div>
  );
};

export default ReportsPanel;