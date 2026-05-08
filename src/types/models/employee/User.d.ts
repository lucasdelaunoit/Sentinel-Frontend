interface User {
  id: string;
  name: string;
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
