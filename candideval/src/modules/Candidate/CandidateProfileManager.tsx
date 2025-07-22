// CandidateProfileManager.tsx
// Candidate Profile Manager: Manual entry, CSV import, resume link, tags, timeline view
import React, { useState, useCallback } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import RecentActivity from '../../components/RecentActivity';
import { CandidateProfile } from '../../types/candidate';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

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
  const [interviewDate, setInterviewDate] = useState<Date | undefined>(undefined);
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Candidate Profile Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={e => { e.preventDefault(); saveProfile(); }} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" type="text" placeholder="Full candidate name" value={profile.name} onChange={handleChange} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Valid email address" value={profile.email} onChange={handleChange} />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1234567890" value={profile.phone} onChange={handleChange} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume Link (Optional)</Label>
              <Input id="resumeUrl" name="resumeUrl" type="url" placeholder="https://linkedin.com/in/..." value={profile.resumeUrl} onChange={handleChange} />
              {errors.resumeUrl && <p className="text-sm text-destructive">{errors.resumeUrl}</p>}
            </div>
          </div>

          {/* Interview Date & CSV Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <DatePicker date={interviewDate} setDate={setInterviewDate} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="csv-import">Import from CSV</Label>
              <Input id="csv-import" type="file" accept=".csv" onChange={handleCsvImport} />
            </div>
          </div>

          {/* Tags Management */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select existing tags</Label>
              <div className="flex flex-wrap gap-2">
                {existingTags.map(tag => (
                  <Button key={tag} type="button" variant={profile.tags.includes(tag) ? "default" : "outline"} size="sm" onClick={() => handleTagAdd(tag)}>
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-tag">Add new tag</Label>
              <div className="flex gap-2">
                <Input id="new-tag" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Type tag and press Enter" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd(newTag); } }} />
                <Button type="button" onClick={() => handleTagAdd(newTag)}>Add</Button>
              </div>
            </div>
            {profile.tags.length > 0 && (
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2">
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

          <div className="pt-5 flex justify-end">
            <Button type="submit">Save Profile</Button>
          </div>
        </form>

        <div className="mt-10 space-y-8">
          {/* Timeline view */}
          <div>
            <h3 className="text-lg font-medium">Timeline</h3>
            <ul className="mt-4 space-y-2">
              {profile.timeline.length > 0 ? profile.timeline.map((item, idx) => (
                <li key={idx} className="p-2 bg-muted rounded-md text-sm">{item.stage} - {item.date} - {item.status}</li>
              )) : <p className="text-sm text-muted-foreground">No timeline events yet.</p>}
            </ul>
          </div>

          {/* WYSIWYG Rich Content Auditor */}
          <div>
            <h3 className="text-lg font-medium">Audit Log (Rich Content)</h3>
            <div className="mt-4 space-y-2">
              <ReactQuill theme="snow" value={auditContent} onChange={setAuditContent} placeholder="Enter audit notes..." />
              <Button type="button" variant="outline" onClick={() => setAuditContent('')}>
                Clear Audit Content
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={(profile.auditLogs || []).map(log => ({ timestamp: log.timestamp, user: log.user, action: log.action }))} />
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateProfileManager;
