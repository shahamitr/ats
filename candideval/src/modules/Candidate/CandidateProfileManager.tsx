// CandidateProfileManager.tsx
// Candidate Profile Manager: Manual entry, CSV import, resume link, tags, timeline view
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'sonner';
import api from '../../api/axiosConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Toaster } from '@/components/ui/sonner';

const candidateProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required.'),
  email: z.string().min(1, 'Email is required.').email('Invalid email format.'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val), {
      message: 'Invalid phone number format.',
    }),
  resumeUrl: z.string().url('Invalid URL format.').optional().or(z.literal('')),
  tags: z.array(z.string()),
  timeline: z.array(z.any()),
  auditLogs: z.array(z.any()),
  interviewDate: z.date().optional(),
  auditContent: z.string().optional(),
});

type CandidateProfileFormValues = z.infer<typeof candidateProfileSchema>;

const initialProfile: CandidateProfileFormValues = {
  id: '',
  name: '',
  email: '',
  phone: '',
  resumeUrl: '',
  tags: [],
  timeline: [],
  auditLogs: [],
  interviewDate: undefined,
  auditContent: '',
};

const existingTags = ['Java', 'React', 'Python', 'Manager', 'Remote', 'Intern'];

const CandidateProfileManager: React.FC = () => {
  const [csvData, setCsvData] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  const { register, handleSubmit, control, setValue, getValues, watch, formState: { errors } } = useForm<CandidateProfileFormValues>({
    resolver: zodResolver(candidateProfileSchema),
    defaultValues: initialProfile,
  });

  const currentTags = watch('tags');
  const auditLogs = watch('auditLogs');

  const handleTagAdd = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      setValue('tags', [...currentTags, trimmedTag]);
      setNewTag('');
    }
  };
  const handleTagRemove = (tag: string) => {
    setValue('tags', currentTags.filter((t) => t !== tag));
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
    const currentLogs = getValues('auditLogs') || [];
    setValue('auditLogs', [
      ...currentLogs,
      { action, user, timestamp: new Date().toISOString() },
    ]);
  };

  // Backend connection (demo: save profile)
  const onSubmit = async (data: CandidateProfileFormValues) => {
    try {
      // The backend expects tags as a comma-separated string
      const payload = { ...data, tags: data.tags.join(',') };
      await api.post('/candidates', payload);
      addAuditLog('Profile saved', 'admin');
      toast.success('Profile Saved', {
        description: 'The candidate profile has been updated successfully.',
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Error Saving Profile', {
        description:
          'There was a problem saving the profile. Please try again.',
      });
    }
  };

  return (
    <TooltipProvider>
      <Toaster position="top-right" richColors />
      <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Candidate Profile Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Full candidate name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Valid email address" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" type="tel" placeholder="+1234567890" {...register('phone')} />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="resumeUrl">Resume Link (Optional)</Label>
              <Input id="resumeUrl" type="url" placeholder="https://linkedin.com/in/..." {...register('resumeUrl')} />
              {errors.resumeUrl && <p className="text-sm text-destructive">{errors.resumeUrl.message}</p>}
            </div>
          </div>

          {/* Interview Date & CSV Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="interviewDate">Interview Date</Label>
              <Controller
                name="interviewDate"
                control={control}
                render={({ field }) => <DatePicker date={field.value} setDate={field.onChange} />}
              />
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
                  <Button key={tag} type="button" variant={currentTags.includes(tag) ? "default" : "outline"} size="sm" onClick={() => handleTagAdd(tag)}>
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-tag">Add new tag</Label>
              <div className="flex gap-2">
                <Input id="new-tag" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="e.g., Senior, Frontend" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleTagAdd(newTag); } }} />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" onClick={() => handleTagAdd(newTag)}>Add</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add this new tag to the candidate.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            {currentTags.length > 0 && (
              <div className="space-y-2">
                <Label>Current Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {currentTags.map(tag => (
                    <span key={tag} className="inline-flex items-center py-1 pl-3 pr-2 rounded-full text-sm font-medium bg-amber-400 text-amber-900">
                      {tag}
                      <AlertDialog>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <button type="button" className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-amber-700 hover:bg-amber-300 hover:text-amber-800 focus:outline-none focus:bg-amber-500 focus:text-white">
                                <span className="sr-only">Remove {tag}</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                              </button>
                            </AlertDialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Remove tag</p>
                          </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the "{tag}" tag from the candidate.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleTagRemove(tag)}>
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-5 flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit">Save Profile</Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save all changes to the candidate's profile.</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </form>

        <div className="mt-10 space-y-8">
          {/* Timeline view */}
          <div>
            <h3 className="text-lg font-medium">Timeline</h3>
            <ul className="mt-4 space-y-2">
              {initialProfile.timeline.length > 0 ? initialProfile.timeline.map((item, idx) => (
                <li key={idx} className="p-2 bg-muted rounded-md text-sm">{item.stage} - {item.date} - {item.status}</li>
              )) : <p className="text-sm text-muted-foreground">No timeline events yet.</p>}
            </ul>
          </div>

          {/* WYSIWYG Rich Content Auditor */}
          <div>
            <h3 className="text-lg font-medium">Audit Log (Rich Content)</h3>
            <div className="mt-4 space-y-2">
              <Controller
                name="auditContent"
                control={control}
                render={({ field }) => <ReactQuill theme="snow" value={field.value} onChange={field.onChange} placeholder="Enter audit notes..." />}
              />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline">Clear Audit Content</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently clear the content of the audit log. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => setValue('auditContent', '')}>
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-lg font-medium">Recent Activity</h3>
            <div className="mt-4 space-y-2">
              {(auditLogs || []).map((log, index) => (
                <Drawer key={index}>
                  <DrawerTrigger asChild>
                    <div className="p-3 bg-muted rounded-md cursor-pointer hover:bg-muted/80 transition-colors">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        By {log.user} on {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </DrawerTrigger>
                  <DrawerContent className="p-4">
                    <h4 className="text-lg font-semibold">Activity Details</h4>
                    <div className="mt-4 grid gap-2 text-sm">
                      <p><strong>Action:</strong> {log.action}</p>
                      <p><strong>User:</strong> {log.user}</p>
                      <p><strong>Timestamp:</strong> {new Date(log.timestamp).toISOString()}</p>
                    </div>
                  </DrawerContent>
                </Drawer>
              ))}
              {(auditLogs || []).length === 0 && (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
};

export default CandidateProfileManager;
