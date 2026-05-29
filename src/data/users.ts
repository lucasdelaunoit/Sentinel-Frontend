export type Criticality = 'High' | 'Medium' | 'Low'
export type TodayStatus = 'Available' | 'Has Leave' | 'Remote'
export type LeaveType = 'vacation' | 'conference' | 'training' | 'parental' | 'sabbatical' | 'other'
export type SkillCategory = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'DATABASE' | 'SECURITY' | 'TESTING'

export interface Skill {
  name: string
  level: number // 1–5
  category: SkillCategory
}

export interface LeaveRecord {
  id: string
  type: LeaveType
  startDate: string
  endDate: string
  status: 'approved' | 'pending' | 'rejected'
}

export interface ProjectRecord {
  id: string
  name: string
  role: string
  status: 'Active' | 'Completed' | 'On Hold'
}

export interface UserDetail {
  id: string
  name: string
  email: string
  phone: string
  department: string
  role: string
  criticality: Criticality
  busFactor: number
  todayStatus: TodayStatus
  onLeaveUntil?: string
  initials: string
  color: string
  startDate: string
  manager: string
  skills: Skill[]
  leaves: LeaveRecord[]
  projects: ProjectRecord[]
}

export const USER_DETAILS: Record<string, UserDetail> = {
  E001: {
    id: 'E001',
    name: 'Clint Cambier',
    email: 'clint@qite.be',
    phone: '+32 495 12 34 56',
    department: 'Management',
    role: 'Backend Developer',
    criticality: 'High',
    busFactor: 1,
    todayStatus: 'Has Leave',
    onLeaveUntil: '27 Feb',
    initials: 'CC',
    color: 'bg-indigo-500',
    startDate: '2020-03-15',
    manager: 'Gérard Martic',
    skills: [
      { name: 'React', level: 5, category: 'FRONTEND' },
      { name: 'Node.js', level: 5, category: 'BACKEND' },
      { name: 'TypeScript', level: 4, category: 'FRONTEND' },
      { name: 'PostgreSQL', level: 4, category: 'DATABASE' },
      { name: 'AWS', level: 3, category: 'DEVOPS' },
      { name: 'Docker', level: 3, category: 'DEVOPS' },
      { name: 'GraphQL', level: 4, category: 'BACKEND' },
      { name: 'CI/CD', level: 3, category: 'DEVOPS' },
    ],
    leaves: [
      { id: 'L1', type: 'vacation', startDate: '2026-02-20', endDate: '2026-02-27', status: 'approved' },
      { id: 'L2', type: 'other', startDate: '2025-11-05', endDate: '2025-11-06', status: 'approved' },
      { id: 'L3', type: 'conference', startDate: '2025-09-15', endDate: '2025-09-18', status: 'approved' },
    ],
    projects: [
      { id: 'P001', name: 'Cloud Migration Platform', role: 'Lead Developer', status: 'Active' },
      { id: 'P002', name: 'Data Analytics Pipeline', role: 'Contributor', status: 'Active' },
    ],
  },
  E002: {
    id: 'E002',
    name: 'Gérard Martic',
    email: 'gerard@qite.be',
    phone: '+32 477 98 76 54',
    department: 'Management',
    role: 'Engineering Manager',
    criticality: 'High',
    busFactor: 1,
    todayStatus: 'Available',
    initials: 'GM',
    color: 'bg-amber-600',
    startDate: '2018-06-01',
    manager: 'CEO',
    skills: [
      { name: 'Leadership', level: 5, category: 'BACKEND' },
      { name: 'Agile', level: 5, category: 'TESTING' },
      { name: 'Python', level: 4, category: 'BACKEND' },
      { name: 'Kubernetes', level: 3, category: 'DEVOPS' },
      { name: 'MySQL', level: 4, category: 'DATABASE' },
      { name: 'Terraform', level: 3, category: 'DEVOPS' },
    ],
    leaves: [
      { id: 'L1', type: 'conference', startDate: '2025-10-10', endDate: '2025-10-12', status: 'approved' },
    ],
    projects: [
      { id: 'P001', name: 'Cloud Migration Platform', role: 'Project Owner', status: 'Active' },
      { id: 'P003', name: 'Customer Portal Redesign', role: 'Stakeholder', status: 'Active' },
    ],
  },
  E003: {
    id: 'E003',
    name: 'Sarah Chen',
    email: 'sarah@qite.be',
    phone: '+32 488 23 45 67',
    department: 'Engineering',
    role: 'Full-Stack Developer',
    criticality: 'High',
    busFactor: 1,
    todayStatus: 'Available',
    initials: 'SC',
    color: 'bg-indigo-500',
    startDate: '2021-09-01',
    manager: 'Gérard Martic',
    skills: [
      { name: 'Vue.js', level: 5, category: 'FRONTEND' },
      { name: 'Django', level: 4, category: 'BACKEND' },
      { name: 'TypeScript', level: 4, category: 'FRONTEND' },
      { name: 'Redis', level: 3, category: 'DATABASE' },
      { name: 'Jenkins', level: 3, category: 'DEVOPS' },
      { name: 'Jest', level: 4, category: 'TESTING' },
    ],
    leaves: [
      { id: 'L1', type: 'vacation', startDate: '2026-04-02', endDate: '2026-04-06', status: 'approved' },
    ],
    projects: [
      { id: 'P002', name: 'Data Analytics Pipeline', role: 'Frontend Lead', status: 'Active' },
      { id: 'P003', name: 'Customer Portal Redesign', role: 'Lead Developer', status: 'Active' },
    ],
  },
  E004: {
    id: 'E004',
    name: 'Michael Johnson',
    email: 'michael@qite.be',
    phone: '+32 499 34 56 78',
    department: 'Engineering',
    role: 'DevOps Engineer',
    criticality: 'Medium',
    busFactor: 2,
    todayStatus: 'Available',
    initials: 'MJ',
    color: 'bg-blue-500',
    startDate: '2022-01-10',
    manager: 'Gérard Martic',
    skills: [
      { name: 'Kubernetes', level: 5, category: 'DEVOPS' },
      { name: 'Terraform', level: 5, category: 'DEVOPS' },
      { name: 'AWS', level: 4, category: 'DEVOPS' },
      { name: 'PostgreSQL', level: 3, category: 'DATABASE' },
      { name: 'Python', level: 3, category: 'BACKEND' },
      { name: 'Prometheus', level: 4, category: 'TESTING' },
    ],
    leaves: [
      { id: 'L1', type: 'conference', startDate: '2026-04-14', endDate: '2026-04-18', status: 'approved' },
    ],
    projects: [
      { id: 'P001', name: 'Cloud Migration Platform', role: 'DevOps Lead', status: 'Active' },
    ],
  },
  E005: {
    id: 'E005',
    name: 'Emily Rodriguez',
    email: 'emily@qite.be',
    phone: '+32 472 45 67 89',
    department: 'Design',
    role: 'UX/UI Designer',
    criticality: 'Medium',
    busFactor: 2,
    todayStatus: 'Remote',
    initials: 'ER',
    color: 'bg-rose-500',
    startDate: '2022-05-15',
    manager: 'Gérard Martic',
    skills: [
      { name: 'Figma', level: 5, category: 'FRONTEND' },
      { name: 'CSS', level: 5, category: 'FRONTEND' },
      { name: 'React', level: 3, category: 'FRONTEND' },
      { name: 'Accessibility', level: 4, category: 'TESTING' },
      { name: 'Storybook', level: 3, category: 'TESTING' },
    ],
    leaves: [],
    projects: [
      { id: 'P003', name: 'Customer Portal Redesign', role: 'Lead Designer', status: 'Active' },
    ],
  },
  E006: {
    id: 'E006',
    name: 'David Kim',
    email: 'david@qite.be',
    phone: '+32 483 56 78 90',
    department: 'Engineering',
    role: 'Security Engineer',
    criticality: 'High',
    busFactor: 1,
    todayStatus: 'Available',
    initials: 'DK',
    color: 'bg-amber-500',
    startDate: '2019-11-01',
    manager: 'Gérard Martic',
    skills: [
      { name: 'Penetration Testing', level: 5, category: 'SECURITY' },
      { name: 'SIEM', level: 5, category: 'SECURITY' },
      { name: 'Python', level: 4, category: 'BACKEND' },
      { name: 'Network Security', level: 5, category: 'SECURITY' },
      { name: 'Vault', level: 4, category: 'DEVOPS' },
      { name: 'Compliance', level: 4, category: 'TESTING' },
    ],
    leaves: [],
    projects: [
      { id: 'P001', name: 'Cloud Migration Platform', role: 'Security Advisor', status: 'Active' },
    ],
  },
  E007: {
    id: 'E007',
    name: 'Lisa Wang',
    email: 'lisa@qite.be',
    phone: '+32 467 67 89 01',
    department: 'Data',
    role: 'Data Engineer',
    criticality: 'Medium',
    busFactor: 3,
    todayStatus: 'Available',
    initials: 'LW',
    color: 'bg-emerald-500',
    startDate: '2023-02-01',
    manager: 'Gérard Martic',
    skills: [
      { name: 'Python', level: 5, category: 'BACKEND' },
      { name: 'Spark', level: 4, category: 'BACKEND' },
      { name: 'dbt', level: 4, category: 'DATABASE' },
      { name: 'Snowflake', level: 4, category: 'DATABASE' },
      { name: 'Airflow', level: 3, category: 'DEVOPS' },
      { name: 'SQL', level: 5, category: 'DATABASE' },
    ],
    leaves: [],
    projects: [
      { id: 'P002', name: 'Data Analytics Pipeline', role: 'Data Lead', status: 'Active' },
    ],
  },
  E008: {
    id: 'E008',
    name: 'James Park',
    email: 'james@qite.be',
    phone: '+32 496 78 90 12',
    department: 'Engineering',
    role: 'Frontend Developer',
    criticality: 'Low',
    busFactor: 4,
    todayStatus: 'Available',
    initials: 'JP',
    color: 'bg-cyan-500',
    startDate: '2024-01-08',
    manager: 'Gérard Martic',
    skills: [
      { name: 'React', level: 4, category: 'FRONTEND' },
      { name: 'Next.js', level: 3, category: 'FRONTEND' },
      { name: 'TypeScript', level: 3, category: 'FRONTEND' },
      { name: 'Tailwind', level: 4, category: 'FRONTEND' },
      { name: 'Cypress', level: 3, category: 'TESTING' },
    ],
    leaves: [
      { id: 'L1', type: 'conference', startDate: '2026-04-22', endDate: '2026-04-26', status: 'approved' },
    ],
    projects: [
      { id: 'P003', name: 'Customer Portal Redesign', role: 'Developer', status: 'Active' },
    ],
  },
}

export const USERS_LIST = Object.values(USER_DETAILS)
