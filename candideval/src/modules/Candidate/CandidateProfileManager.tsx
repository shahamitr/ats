// CandidateProfileManager.tsx
// Candidate Profile Manager: Manual entry, CSV import, resume link, tags, timeline view
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import RecentActivity from '../../components/RecentActivity';
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

const existingTags = ['Java', 'React', 'Python', 'Manager', 'Remote', 'Intern'];
const CandidateProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile);
  const [csvData, setCsvData] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState<Date | null>(null);
  const [auditContent, setAuditContent] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [tooltip, setTooltip] = useState<string>('');
  const [newTag, setNewTag] = useState('');

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
    if (!profile.tags.includes(tag)) {
      setProfile({ ...profile, tags: [...profile.tags, tag] });
    }
  };
  const handleTagRemove = (tag: string) => {
    setProfile({ ...profile, tags: profile.tags.filter(t => t !== tag) });
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
      // Send tags as comma-separated string
      const payload = { ...profile, tags: profile.tags.join(',') };
      await axios.post('/api/candidates', payload);
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
        {/* Modern Date Picker for Interview Date */}
        <div style={{ margin: '8px 0' }}>
          <label>Interview Date:</label>
          <DatePicker selected={interviewDate} onChange={(date: Date | null) => setInterviewDate(date)} dateFormat="yyyy-MM-dd" placeholderText="Select interview date" />
        </div>
        <input type="file" accept=".csv" onChange={handleCsvImport} />
        {/* Tags input: select existing or add new */}
        <div style={{ margin: '8px 0' }}>
          <label>Select existing tags:</label>
          <div>
            {existingTags.map(tag => (
              <button
                key={tag}
                type="button"
                style={{ margin: '2px', background: profile.tags.includes(tag) ? '#4ade80' : '#eee', border: 'none', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                onClick={() => handleTagAdd(tag)}
              >{tag}</button>
            ))}
          </div>
        </div>
        <div style={{ margin: '8px 0' }}>
          <label>Add new tag:</label>
          <input
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            placeholder="Type tag and press Enter"
            onKeyDown={e => {
              if (e.key === 'Enter' && newTag.trim()) {
                handleTagAdd(newTag.trim());
                setNewTag('');
                e.preventDefault();
              }
            }}
          />
        </div>
        <div>
          {profile.tags.map(tag => (
            <span key={tag} style={{ marginRight: 8, background: '#fbbf24', borderRadius: '4px', padding: '2px 8px' }}>
              {tag}
              <button type="button" style={{ marginLeft: 4, background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => handleTagRemove(tag)}>x</button>
            </span>
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
      {/* WYSIWYG Rich Content Auditor */}
      <h3>Audit Log (Rich Content)</h3>
      <ReactQuill value={auditContent} onChange={setAuditContent} placeholder="Enter audit notes..." />
      <button type="button" style={{ marginTop: 8 }} onClick={() => setAuditContent('')}>Clear Audit Content</button>
      {/* Recent Activity */}
      <RecentActivity activities={(profile.auditLogs || []).map(log => ({ timestamp: log.timestamp, user: log.user, action: log.action }))} />
    </div>
  );
};

export default CandidateProfileManager;
