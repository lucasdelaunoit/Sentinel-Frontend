/* ── Shared building blocks ──────────────────────────────── */

export interface RiskProjectDetail {
  id: string
  name: string
  risk_score: number
  bus_factor: number
  health: number
  missing_skills: string[]
  siloed_skills: string[]
}

export interface CategoryDetail {
  category_id: string
  category_name: string
  coverage_pct: number
  safe: number
  siloed: number
  uncovered: number
  siloed_skills: string[]
  uncovered_skills: string[]
}

export interface AbsentEmployeeDetail {
  id: string
  name: string
  criticality: string
  is_critical: boolean
  projects: string[]
  skills: string[]
}

export interface UncoveredSkillDetail {
  skill_id: string
  skill_name: string
  required_by_project: string
  previously_covered_by: string
  before_status: string
}

/* ── Detail endpoint responses ───────────────────────────── */

export interface ProjectsAtRiskDetail {
  critical: RiskProjectDetail[]
  unstable: RiskProjectDetail[]
}

export interface KnowledgeCoverageDetail {
  categories: CategoryDetail[]
  most_fragile: string
}

export interface TeamAvailabilityDetail {
  absent_employees: AbsentEmployeeDetail[]
  degraded_projects?: string[]
}

export interface AbsenceImpactDetail {
  uncovered_skills: UncoveredSkillDetail[]
}

/* ── Stat card shapes (GET /dashboard/stats) ─────────────── */

export interface ProjectsAtRiskStat {
  value: number
  insight: string
  severity: Severity
}

export interface KnowledgeCoverageStat {
  value: number
  insight: string
  severity: Severity
}

export interface TeamAvailabilityStat {
  value: string
  available: number
  total: number
  insight: string
  severity: Severity
}

export interface AbsenceImpactStat {
  value: number
  insight: string
  severity: Severity
}

/* ── Team status (GET /employees/today-status) ───────────── */

export type TodayStatus = "Available" | "Has Leave" | "Remote"

export interface EmployeeTodayStatus {
  id: number
  name: string
  role: string
  initials: string
  today_status: TodayStatus
}

export interface TeamTodayStatusResponse {
  capacity_pct: number
  total: number
  employees: EmployeeTodayStatus[]
}

/* ── Employee list (GET /employees) ──────────────────────── */

export interface EmployeeSkillItem {
  id: number
  name: string
  category: { id: number; name: string }
  pivot: { level: number }
}

export interface EmployeeListItem {
  id: number
  department_id: number
  name: string
  email: string
  title: string
  is_remote: boolean
  status: EmployeeStatus
  department: { id: number; name: string }
  skills: EmployeeSkillItem[]
}

/* ── Root response ───────────────────────────────────────── */

export interface DashboardStats {
  projects_at_risk: ProjectsAtRiskStat
  knowledge_coverage: KnowledgeCoverageStat
  team_availability: TeamAvailabilityStat
  absence_impact: AbsenceImpactStat
}