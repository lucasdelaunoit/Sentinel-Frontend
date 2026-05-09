interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  department: string;
  skills: number;
  projects: number;
  criticality: Criticality;
  busFactor: number;
  todayStatus: UserStatus;
  initials: string;
  color: string;
  leaves: LeaveRange[];
}
