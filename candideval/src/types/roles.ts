// types/roles.ts
export type Role = 'Admin' | 'Recruiter' | 'Panelist' | 'HR Manager';

export interface User {
  id: string;
  name: string;
  role: Role;
}
