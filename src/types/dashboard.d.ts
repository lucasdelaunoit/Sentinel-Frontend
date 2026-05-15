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
  firstname: string
  lastname: string
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

/* ── Project stats (GET /projects/stats) ─────────────────── */

export interface ProjectsStats {
  total: number
  avg_health: number
  fragile: number
  at_risk: number
}

/* ── Team status (GET /employees/today-status) ───────────── */

export type TodayStatus = "Available" | "Has Leave" | "Remote"

export interface UserTodayStatus {
  id: number
  firstname: string
  lastname: string
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
  firstname: string
  lastname: string
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
  firstname: string
  lastname: string
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
  risk_score: number
  bus_factor: number
  health: number
  started_at: string
  deadline: string
  paused_at: string | null
  completed_at: string | null
  archived_at: string | null
  deleted_at: string | null
  users_count?: number
  team: ProjectMemberSnippet[]
  skills: ProjectSkillItem[]
}

/* ── Project detail (GET /projects/:id) ──────────────────── */

export interface ProjectDetailUser {
  id: number
  firstname: string
  lastname: string
  email: string
  title: string
  is_remote: boolean
  status: UserStatus
  department: { id: number; name: string }
}

export interface ProjectSkillRequirementItem {
  id: number
  name: string
  pivot?: { project_id: number; skill_id: number; required_level: number }
}

export interface ProjectDetailResponse {
  id: number
  name: string
  description: string
  status: ProjectStatus
  risk_score: number
  bus_factor: number
  health: number
  started_at: string
  deadline: string
  paused_at: string | null
  completed_at: string | null
  archived_at: string | null
  users_count?: number
  users?: ProjectDetailUser[]
  skill_requirements?: ProjectSkillRequirementItem[]
  created_at: string
}

/* ── User detail (GET /users/:id) ────────────────────────── */

export interface UserDetailResponse {
  id: number
  firstname: string
  lastname: string
  email: string
  title: string
  phone?: string
  is_remote: boolean
  status: UserStatus
  criticality: "high" | "medium" | "low"
  bus_factor: number
  start_date: string
  department: { id: number; name: string }
  manager?: { id: number; firstname: string; lastname: string } | null
  skills_count?: number
  expert_skills_count?: number
  projects_count?: number
  active_projects_count?: number
}

/* ── User projects (GET /users/:id/projects) ─────────────── */

export interface UserProjectItem {
  id: number
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  role: string
  risk_score: number
  bus_factor: number
  health: number
  deadline: string
}

/* ── User skills (GET /users/:id/skills) ─────────────────── */

export interface UserSkillDetail {
  id: number
  skill_category_id: number
  name: string
  created_at: string
  updated_at: string
  category: { id: number; name: string; created_at: string; updated_at: string }
  pivot: {
    user_id: number
    skill_id: number
    level: number
    created_at: string
    updated_at: string
  }
}

/* ── User stats (GET /users/:id/stats) ───────────────────── */

export interface UserStatsCriticality {
  score: number
  unique_skills: number
  silo_count: number
  bus_factor_projects: number
}

export interface UserStatsBusFactor {
  count: number
  projects: { id: number; name: string }[]
}

export interface UserStatsSkillCategory {
  category: string
  count: number
  avg_level: number
}

export interface UserStatsSkills {
  total: number
  by_category: UserStatsSkillCategory[]
}

export interface UserStatsActiveProjects {
  count: number
  projects: { id: number; name: string }[]
}

export interface UserStats {
  criticality: UserStatsCriticality
  bus_factor_in_org: UserStatsBusFactor
  skills: UserStatsSkills
  active_projects: UserStatsActiveProjects
}

/* ── User absences (GET /users/:id/absences) ─────────────── */

export type AbsenceType = 'vacation' | 'sick' | 'conference'
export type AbsenceStatus = 'approved' | 'pending' | 'rejected'

export interface AbsenceItem {
  id: number
  user_id: number
  type: AbsenceType
  start_date: string
  end_date: string
  status: AbsenceStatus
  reason?: string | null
  created_at: string
  updated_at: string
}

/* ── Root response ───────────────────────────────────────── */

export interface DashboardStats {
  projects_at_risk: ProjectsAtRiskStat
  knowledge_coverage: KnowledgeCoverageStat
  team_availability: TeamAvailabilityStat
  absence_impact: AbsenceImpactStat
}