// types for candidate profile
export interface AuditLog {
  action: string;
  user: string;
  timestamp: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  tags: string[];
  timeline: Array<{
    stage: string;
    date: string;
    status: string;
  }>;
  auditLogs?: AuditLog[];
}
