// CandidateProfileManager.tsx
// Candidate Profile Manager: Manual entry, CSV import, resume link, tags, timeline view
import React, { useState } from 'react';
import { CandidateProfile } from '../../types/candidate';
import axios from 'axios';


const initialProfile: CandidateProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  resumeUrl: '',
  tags: [],
  timeline: [],
  auditLogs: [], // new field for audit logs
};

const CandidateProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile);
  const [csvData, setCsvData] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [tooltip, setTooltip] = useState<string>('');

  // Handlers for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    // Simple validation
    if (name === 'email' && value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
    } else if (name === 'name' && !value) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTagAdd = (tag: string) => {
    setProfile({ ...profile, tags: [...profile.tags, tag] });
  };

  const handleResumeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, resumeUrl: e.target.value });
  };

  // CSV import handler (basic, for demo)
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
        // TODO: Parse CSV and update profile(s)
      };
      reader.readAsText(file);
    }
  };

  // Audit log handler
  const addAuditLog = (action: string, user: string) => {
    setProfile(prev => ({
      ...prev,
      auditLogs: [
        ...(prev.auditLogs || []),
        { action, user, timestamp: new Date().toISOString() },
      ],
    }));
  };

  // Backend connection (demo: save profile)
  const saveProfile = async () => {
    try {
      // Replace with your backend API endpoint
      await axios.post('/api/candidates', profile);
      addAuditLog('Profile saved', 'admin');
      alert('Profile saved successfully!');
    } catch (err) {
      alert('Error saving profile');
    }
  };

  return (
    <div>
      <h2>Candidate Profile Manager</h2>
      <form onSubmit={e => { e.preventDefault(); saveProfile(); }}>
        <div style={{ position: 'relative' }}>
          <input
            name="name"
            placeholder="Name"
            value={profile.name}
            onChange={handleChange}
            onFocus={() => setTooltip('Enter full candidate name')}
            onBlur={() => setTooltip('')}
          />
          {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
        </div>
        <div style={{ position: 'relative' }}>
          <input
            name="email"
            placeholder="Email"
            value={profile.email}
            onChange={handleChange}
            onFocus={() => setTooltip('Enter valid email address')}
            onBlur={() => setTooltip('')}
          />
          {errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
        </div>
        <input name="phone" placeholder="Phone" value={profile.phone} onChange={handleChange} />
        <input name="resumeUrl" placeholder="Resume Link" value={profile.resumeUrl} onChange={handleResumeUrlChange} />
        <input type="file" accept=".csv" onChange={handleCsvImport} />
        {/* Tags input (simple demo) */}
        <input
          placeholder="Add tag"
          onFocus={() => setTooltip('Type and press Enter to add tag')}
          onBlur={() => setTooltip('')}
          onKeyDown={e => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              handleTagAdd(e.currentTarget.value);
              e.currentTarget.value = '';
              e.preventDefault();
            }
          }}
        />
        <div>
          {profile.tags.map(tag => (
            <span key={tag} style={{ marginRight: 8 }}>{tag}</span>
          ))}
        </div>
        <button type="submit">Save Profile</button>
      </form>
      {tooltip && <div style={{ position: 'absolute', background: '#eee', padding: '4px', borderRadius: '4px', top: 0, left: '100%' }}>{tooltip}</div>}
      {/* Timeline view (simple list) */}
      <h3>Timeline</h3>
      <ul>
        {profile.timeline.map((item, idx) => (
          <li key={idx}>{item.stage} - {item.date} - {item.status}</li>
        ))}
      </ul>
      {/* Audit log view */}
      <h3>Audit Logs</h3>
      <ul>
        {(profile.auditLogs || []).map((log, idx) => (
          <li key={idx}>{log.timestamp}: {log.user} - {log.action}</li>
        ))}
      </ul>
    </div>
  );
};

export default CandidateProfileManager;
