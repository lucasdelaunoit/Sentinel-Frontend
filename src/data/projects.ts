export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Planning'
export type ProjectPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export interface ProjectMember {
  id: string
  initials: string
  color: string
  name: string
}

export interface ProjectData {
  id: string
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number   // 0–100
  riskScore: number  // 0–100 (higher = more risky)
  busFactor: number
  health: number     // 0–100
  team: ProjectMember[]
  startDate: string
  endDate: string
  department: string
  skills: string[]
}

export const PROJECTS: ProjectData[] = [
  {
    id: 'P001',
    name: 'Cloud Migration Platform',
    description: 'Migrate legacy infrastructure to cloud-native architecture using AWS & Kubernetes',
    status: 'Active',
    priority: 'Critical',
    progress: 62,
    riskScore: 18,
    busFactor: 1,
    health: 64,
    team: [
      { id: 'E003', initials: 'SC', color: 'bg-indigo-500', name: 'Sarah Chen' },
      { id: 'E004', initials: 'MJ', color: 'bg-blue-500', name: 'Michael Johnson' },
      { id: 'E006', initials: 'DK', color: 'bg-amber-500', name: 'David Kim' },
      { id: 'E001', initials: 'CC', color: 'bg-indigo-400', name: 'Clint Cambier' },
      { id: 'E002', initials: 'GM', color: 'bg-amber-600', name: 'Gérard Martic' },
    ],
    startDate: '2025-01-15',
    endDate: '2026-06-30',
    department: 'Engineering',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'],
  },
  {
    id: 'P002',
    name: 'Data Analytics Pipeline',
    description: 'Build a real-time data pipeline for business analytics and reporting dashboards',
    status: 'Active',
    priority: 'High',
    progress: 35,
    riskScore: 22,
    busFactor: 1,
    health: 48,
    team: [
      { id: 'E004', initials: 'MJ', color: 'bg-blue-500', name: 'Michael Johnson' },
      { id: 'E005', initials: 'ER', color: 'bg-rose-500', name: 'Emily Rodriguez' },
      { id: 'E007', initials: 'LW', color: 'bg-emerald-500', name: 'Lisa Wang' },
    ],
    startDate: '2025-04-01',
    endDate: '2025-12-31',
    department: 'Data',
    skills: ['Python', 'Spark', 'Airflow', 'dbt', 'SQL'],
  },
  {
    id: 'P003',
    name: 'Customer Portal Redesign',
    description: 'Redesign and rebuild the customer-facing portal with a modern UX and component library',
    status: 'Active',
    priority: 'High',
    progress: 28,
    riskScore: 10,
    busFactor: 2,
    health: 78,
    team: [
      { id: 'E003', initials: 'SC', color: 'bg-indigo-500', name: 'Sarah Chen' },
      { id: 'E005', initials: 'ER', color: 'bg-rose-500', name: 'Emily Rodriguez' },
      { id: 'E008', initials: 'JP', color: 'bg-cyan-500', name: 'James Park' },
    ],
    startDate: '2025-06-01',
    endDate: '2026-02-28',
    department: 'Design',
    skills: ['React', 'Figma', 'TypeScript', 'CSS'],
  },
  {
    id: 'P004',
    name: 'Security Compliance Audit',
    description: 'Internal security audit and compliance review for ISO 27001 certification',
    status: 'On Hold',
    priority: 'Critical',
    progress: 55,
    riskScore: 30,
    busFactor: 1,
    health: 40,
    team: [
      { id: 'E006', initials: 'DK', color: 'bg-amber-500', name: 'David Kim' },
      { id: 'E002', initials: 'GM', color: 'bg-amber-600', name: 'Gérard Martic' },
    ],
    startDate: '2024-10-01',
    endDate: '2025-03-31',
    department: 'Security',
    skills: ['Penetration Testing', 'SIEM', 'Compliance', 'Network Security'],
  },
  {
    id: 'P005',
    name: 'Internal Dev Platform',
    description: 'Build a unified internal developer platform with shared tooling, CI/CD and observability',
    status: 'Planning',
    priority: 'Medium',
    progress: 8,
    riskScore: 7,
    busFactor: 3,
    health: 90,
    team: [
      { id: 'E004', initials: 'MJ', color: 'bg-blue-500', name: 'Michael Johnson' },
      { id: 'E006', initials: 'DK', color: 'bg-amber-500', name: 'David Kim' },
    ],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    department: 'DevOps',
    skills: ['Kubernetes', 'CI/CD', 'Prometheus', 'Vault'],
  },
  {
    id: 'P006',
    name: 'HR Onboarding Automation',
    description: 'Automate the employee onboarding workflow with integrated tooling and notifications',
    status: 'Completed',
    priority: 'Low',
    progress: 100,
    riskScore: 2,
    busFactor: 4,
    health: 95,
    team: [
      { id: 'E007', initials: 'LW', color: 'bg-emerald-500', name: 'Lisa Wang' },
      { id: 'E008', initials: 'JP', color: 'bg-cyan-500', name: 'James Park' },
    ],
    startDate: '2024-06-01',
    endDate: '2025-01-31',
    department: 'Engineering',
    skills: ['Python', 'SQL', 'Airflow'],
  },
]
