interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  skills: number;
  projects: number;
  criticality: Criticality;
  busFactor: number;
  todayStatus: EmployeeStatus;
  initials: string;
  color: string;
  leaves: LeaveRange[];
}
