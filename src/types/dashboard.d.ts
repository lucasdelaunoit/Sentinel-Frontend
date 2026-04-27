import type { Severity } from "@/types/api"

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

/* ── Stat card shapes ────────────────────────────────────── */

export interface ProjectsAtRiskStat {
  value: number
  insight: string
  severity: Severity
  detail: {
    critical: RiskProjectDetail[]
    unstable: RiskProjectDetail[]
  }
}

export interface KnowledgeCoverageStat {
  value: number
  insight: string
  severity: Severity
  detail: {
    categories: CategoryDetail[]
    most_fragile: string
  }
}

export interface TeamAvailabilityStat {
  value: string
  available: number
  total: number
  insight: string
  severity: Severity
  detail: {
    absent_employees: AbsentEmployeeDetail[]
  }
}

export interface AbsenceImpactStat {
  value: number
  insight: string
  severity: Severity
  detail: {
    uncovered_skills: UncoveredSkillDetail[]
  }
}

/* ── Root response ───────────────────────────────────────── */

export interface DashboardStats {
  projects_at_risk: ProjectsAtRiskStat
  knowledge_coverage: KnowledgeCoverageStat
  team_availability: TeamAvailabilityStat
  absence_impact: AbsenceImpactStat
}
