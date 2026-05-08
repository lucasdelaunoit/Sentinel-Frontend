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

export interface AbsentUserDetail {
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
  absent_users: AbsentUserDetail[]
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

/* ── Employees page stats (GET /employees/stats) ─────────── */

export interface TotalEmployeesStat {
  value: number
  insight: string
  severity: Severity
}

export interface CriticalEmployeesStat {
  value: number
  insight: string
  severity: Severity
}

export interface SkillCoverageStat {
  value: number
  insight: string
  severity: Severity
}

export interface DepartmentBalanceStat {
  value: string
  insight: string
  severity: Severity
}

export interface UsersStats {
  total_employees: TotalEmployeesStat
  critical_employees: CriticalEmployeesStat
  skill_coverage: SkillCoverageStat
  department_balance: DepartmentBalanceStat
}

/* ── Team status (GET /employees/today-status) ───────────── */

export type TodayStatus = "Available" | "Has Leave" | "Remote"

export interface UserTodayStatus {
  id: number
  name: string
  role: string
  initials: string
  today_status: TodayStatus
}

export interface TeamTodayStatusResponse {
  capacity_pct: number
  total: number
  employees: UserTodayStatus[]
}

/* ── Employee list (GET /employees) ──────────────────────── */

export interface UserSkillItem {
  id: number
  name: string
  category: { id: number; name: string }
  pivot: { level: number }
}

export interface UserListItem {
  id: number
  department_id: number
  name: string
  email: string
  title: string
  is_remote: boolean
  status: UserStatus
  department: { id: number; name: string }
  skills: UserSkillItem[]
}

/* ── Project list (GET /projects) ───────────────────────── */

export interface ProjectMemberSnippet {
  id: number
  name: string
  initials: string
}

export interface ProjectSkillItem {
  id: number
  name: string
}

export interface ProjectListItem {
  id: number
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  risk_score: number
  bus_factor: number
  health: number
  end_date: string
  team: ProjectMemberSnippet[]
  skills: ProjectSkillItem[]
}

/* ── Root response ───────────────────────────────────────── */

export interface DashboardStats {
  projects_at_risk: ProjectsAtRiskStat
  knowledge_coverage: KnowledgeCoverageStat
  team_availability: TeamAvailabilityStat
  absence_impact: AbsenceImpactStat
}