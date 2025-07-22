// CandidateProfileManager.tsx
// Candidate Profile Manager: Manual entry, CSV import, resume link, tags, timeline view
import React, { useState, useCallback } from 'react';
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

type ValidationErrors = Partial<Record<keyof Omit<CandidateProfile, 'tags' | 'timeline' | 'auditLogs'>, string>>;

const CandidateProfileManager: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile>(initialProfile);
  const [csvData, setCsvData] = useState<string>('');
  const [interviewDate, setInterviewDate] = useState<Date | null>(null);
  const [auditContent, setAuditContent] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [newTag, setNewTag] = useState('');

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required.';
      case 'email':
        if (!value) return 'Email is required.';
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? '' : 'Invalid email format.';
      case 'phone':
        // Optional field, but if filled, validate it
        return !value || /^\+?[1-9]\d{1,14}$/.test(value) ? '' : 'Invalid phone number format.';
      case 'resumeUrl':
        try {
          if (value) new URL(value);
          return '';
        } catch (_) {
          return 'Invalid URL format.';
        }
      default:
        return '';
    }
  };

  // Handlers for form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleTagAdd = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !profile.tags.includes(trimmedTag)) {
      setProfile(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }));
      setNewTag('');
    }
  };
  const handleTagRemove = (tag: string) => {
    setProfile({ ...profile, tags: profile.tags.filter(t => t !== tag) });
  };

  // CSV import handler (basic, for demo)
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
        // TODO: Implement robust CSV parsing and display a preview or import directly.
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

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationErrors = {};
    (Object.keys(profile) as Array<keyof typeof profile>).forEach(key => {
      if (typeof profile[key] === 'string') {
        const error = validateField(key, profile[key] as string);
        if (error) newErrors[key as keyof ValidationErrors] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [profile]);

  // Backend connection (demo: save profile)
  const saveProfile = async () => {
    if (!validateForm()) return;
    try {
      const payload = { ...profile, tags: profile.tags.join(',') };
      await axios.post('/api/candidates', payload);
      addAuditLog('Profile saved', 'admin');
      alert('Profile saved successfully!');
    } catch (err) {
      alert('Error saving profile');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Candidate Profile Manager</h2>
      <form onSubmit={e => { e.preventDefault(); saveProfile(); }} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input id="name" name="name" type="text" placeholder="Full candidate name" value={profile.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input id="email" name="email" type="email" placeholder="Valid email address" value={profile.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone (Optional)</label>
            <input id="phone" name="phone" type="tel" placeholder="+1234567890" value={profile.phone} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">Resume Link (Optional)</label>
            <input id="resumeUrl" name="resumeUrl" type="url" placeholder="https://linkedin.com/in/..." value={profile.resumeUrl} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            {errors.resumeUrl && <p className="mt-2 text-sm text-red-600">{errors.resumeUrl}</p>}
          </div>
        </div>

        {/* Interview Date & CSV Import */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700">Interview Date</label>
            <DatePicker selected={interviewDate} onChange={(date: Date | null) => setInterviewDate(date)} dateFormat="yyyy-MM-dd" placeholderText="Select interview date" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" wrapperClassName="w-full" />
          </div>
          <div>
            <label htmlFor="csv-import" className="block text-sm font-medium text-gray-700">Import from CSV</label>
            <input id="csv-import" type="file" accept=".csv" onChange={handleCsvImport} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          </div>
        </div>

        {/* Tags Management */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select existing tags</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {existingTags.map(tag => (
                <button key={tag} type="button" onClick={() => handleTagAdd(tag)} className={`px-3 py-1 text-sm font-medium rounded-full ${profile.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="new-tag" className="block text-sm font-medium text-gray-700">Add new tag</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input id="new-tag" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Type tag and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd(newTag); } }} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              <button type="button" onClick={() => handleTagAdd(newTag)} className="-ml-px relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">Add</button>
            </div>
          </div>
          {profile.tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Tags</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.tags.map(tag => (
                  <span key={tag} className="inline-flex items-center py-1 pl-3 pr-2 rounded-full text-sm font-medium bg-amber-400 text-amber-900">
                    {tag}
                    <button type="button" onClick={() => handleTagRemove(tag)} className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-amber-700 hover:bg-amber-300 hover:text-amber-800 focus:outline-none focus:bg-amber-500 focus:text-white">
                      <span className="sr-only">Remove {tag}</span>
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="pt-5">
          <div className="flex justify-end">
            <button type="submit" className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Save Profile
            </button>
          </div>
        </div>
      </form>

      <div className="mt-10 space-y-8">
        {/* Timeline view */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Timeline</h3>
          <ul className="mt-4 space-y-2">
            {profile.timeline.length > 0 ? profile.timeline.map((item, idx) => (
              <li key={idx} className="p-2 bg-gray-50 rounded-md">{item.stage} - {item.date} - {item.status}</li>
            )) : <p className="text-sm text-gray-500">No timeline events yet.</p>}
          </ul>
        </div>

        {/* WYSIWYG Rich Content Auditor */}
        <div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Audit Log (Rich Content)</h3>
          <div className="mt-4">
            <ReactQuill theme="snow" value={auditContent} onChange={setAuditContent} placeholder="Enter audit notes..." />
            <button type="button" onClick={() => setAuditContent('')} className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Clear Audit Content
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={(profile.auditLogs || []).map(log => ({ timestamp: log.timestamp, user: log.user, action: log.action }))} />
      </div>
    </div>
  );
};

export default CandidateProfileManager;
