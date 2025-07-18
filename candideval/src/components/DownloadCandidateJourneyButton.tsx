import React from 'react';
import axios from 'axios';

interface DownloadCandidateJourneyButtonProps {
  candidateId: number;
  userRole: string;
}

const DownloadCandidateJourneyButton: React.FC<DownloadCandidateJourneyButtonProps> = ({ candidateId, userRole }) => {
  // Only show button for Admin or HR Manager
  if (userRole !== 'Admin' && userRole !== 'HR Manager') return null;

  const handleDownload = async () => {
    try {
      const response = await axios.get(`/api/admin/candidates/${candidateId}/journey/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `candidate_${candidateId}_journey.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download candidate journey PDF.');
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Download Candidate Journey (PDF)
    </button>
  );
};

export default DownloadCandidateJourneyButton;
