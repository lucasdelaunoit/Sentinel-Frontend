/* ── Upcoming risk events (GET /dashboard/upcoming-risk-events) ─ */

export type RiskEventKind = "leave" | "sick_leave";
export type RiskEventSeverity = "low" | "medium" | "high" | "critical";
/** Metric-block severity from the shared Scale enums (distinct from the event severity union). */
export type MetricBlockSeverity = "ok" | "warning" | "critical";

/** Per-project impact of one person's upcoming absence. Coverage/fragility are 0–100 ints. */
export interface RiskEventProjectImpact {
  id: string;
  name: string;
  fragility_before: number;
  fragility_after: number;
  coverage_before: number;
  coverage_after: number;
  bus_factor_before: number;
  bus_factor_after: number;
  lost_skills: string[];
}

/** A single metric's before/after with tier + severity. Fragility: higher worse. Coverage: lower worse. */
export interface RiskEventMetricBlock {
  before: number;
  after: number;
  delta: number;
  tier: string;
  tier_label: string;
  severity: MetricBlockSeverity;
}

export interface RiskEventScopeImpact {
  fragility: RiskEventMetricBlock;
  knowledge_coverage: RiskEventMetricBlock;
}

/** Dual-scope headline. `affected` = avg over the person's projects (punchy). `org` = whole-org avg (honest). */
export interface RiskEventOrgImpact {
  affected: RiskEventScopeImpact;
  org: RiskEventScopeImpact;
}

export interface UpcomingRiskEvent {
  id: string;
  /** ISO date the absence starts. */
  date: string;
  employee: { id: string; firstname: string; lastname: string };
  kind: RiskEventKind;
  severity: RiskEventSeverity;
  org_impact: RiskEventOrgImpact;
  /** Empty when removing the person changes no project metric. */
  affected_projects: RiskEventProjectImpact[];
}

export interface UpcomingRiskEventsResponse {
  generated_at: string;
  events: UpcomingRiskEvent[];
}

/* ── Shared building blocks ──────────────────────────────── */

export interface RiskProjectDetail {
  id: string;
  name: string;
  risk_score: number;
  bus_factor: number;
  health: number;
  missing_skills: string[];
  siloed_skills: string[];
}

export interface CategoryDetail {
  category_id: number;
  category_name: string;
  coverage_pct: number;
  safe: number;
  siloed: number;
  uncovered: number;
  siloed_skills: string[];
  uncovered_skills: string[];
}

export interface AbsentUserDetail {
  id: string;
  firstname: string;
  lastname: string;
  criticality: string;
  is_critical: boolean;
  projects: string[];
  skills: string[];
}

export interface UncoveredSkillDetail {
  skill_id: string;
  skill_name: string;
  required_by_project: string;
  previously_covered_by: string;
  before_status: string;
}

/* ── Detail endpoint responses ───────────────────────────── */

export interface ProjectsAtRiskDetail {
  critical: RiskProjectDetail[];
  unstable: RiskProjectDetail[];
}

export interface KnowledgeCoverageDetail {
  categories: CategoryDetail[];
  most_fragile: string | null;
}

export interface TeamAvailabilityDetail {
  absent_users: AbsentUserDetail[];
  degraded_projects?: string[];
}

export interface AbsenceImpactDetail {
  uncovered_skills: UncoveredSkillDetail[];
}

/* ── Universal stat card shape ───────────────────────────── */

export interface StatCardData {
  value: string;
  severity: Severity;
  change: string;
  hint: string | null;
  raw: number | null;
  value_raw?: number | null;
  insight?: string | null;
}

/* ── Users page stats (GET /users/stats) ─────────────────── */

export interface CriticalUserPreviewItem {
  id: number;
  name: string;
  title: string;
  score: number;
  severity: string;
}

export interface UsersStats {
  total: StatCardData;
  available: StatCardData;
  critical_users: StatCardData;
  unique_skill_holders: StatCardData;
  departments: StatCardData;
  critical_users_preview: CriticalUserPreviewItem[];
}

/* ── Users capacity (GET /users/capacity) ────────────────── */

export interface UsersCapacityResponse {
  capacity_pct: number;
}

/* ── Employee list (GET /employees) ──────────────────────── */

export interface UserSkillItem {
  id: number;
  name: string;
  category: { id: number; name: string };
  pivot: { level: number };
}

export interface UserListItem {
  id: number;
  department_id: number;
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  is_remote: boolean;
  status: UserStatus;
  department: { id: number; name: string };
  skills: UserSkillItem[];
}

/* ── Project detail (GET /projects/:id) ──────────────────── */

export interface ProjectDetailUser {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  is_remote: boolean;
  status: UserStatus;
  department: { id: number; name: string };
}

export interface ProjectSkillRequirementItem {
  id: number;
  name: string;
  pivot?: { project_id: number; skill_id: number; required_level: number };
}

export interface ProjectDetailResponse {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  fragility: StatCardData;
  bus_factor: StatCardData;
  started_at: string;
  deadline: string;
  paused_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  users_count?: number;
  users?: ProjectDetailUser[];
  skill_requirements?: ProjectSkillRequirementItem[];
  created_at: string;
}

/* ── User projects (GET /users/:id/projects) ─────────────── */

export interface UserProjectItem {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  role: string;
  fragility: StatCardData;
  bus_factor: StatCardData;
  deadline: string;
}

/* ── User skills (GET /users/:id/skills) ─────────────────── */

export interface UserSkillDetail {
  id: number;
  skill_category_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string; created_at: string; updated_at: string };
  pivot: {
    user_id: number;
    skill_id: number;
    level: number;
    created_at: string;
    updated_at: string;
  };
}

/* ── User stats (GET /users/:id/stats) ───────────────────── */

export interface UserStats {
  criticality: StatCardData;
  bus_factor_in_org: StatCardData;
  skills: StatCardData;
  active_projects: StatCardData;
}

/* ── User absences (GET /users/:id/absences) ─────────────── */

export type AbsenceType = "vacation" | "sick" | "conference";
export type AbsenceStatus = "approved" | "pending" | "rejected";

export interface AbsenceItem {
  id: number;
  user_id: number;
  type: AbsenceType;
  start_date: string;
  start_half: 0 | 1;
  end_date: string;
  end_half: 0 | 1;
  status: AbsenceStatus;
  reason?: string | null;
  created_at: string;
  updated_at: string;
}

/* ── Root response ───────────────────────────────────────── */

export interface DashboardStats {
  fragile_projects: StatCardData;
  knowledge_coverage: StatCardData;
  team_availability: StatCardData;
  absence_impact: StatCardData;
}

/* ── Projects stats (GET /projects/stats) ────────────────── */

export interface ProjectsStats {
  total: StatCardData;
  avg_fragility: StatCardData;
  fragile_count: StatCardData;
  deadline_pressure: StatCardData;
}
