interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  department: { id: number; name: string } | null;
  skills: number;
  projects: number;
  criticality: Criticality;
  busFactor: number;
  status: UserStatus;
  initials: string;
  color: string;
  leaves: LeaveRange[];
  created_at: string;
}
