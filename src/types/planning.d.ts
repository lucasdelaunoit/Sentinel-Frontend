import type { AbsenceType } from "@/types/absence";

export type ImpactLevel = "critical" | "warning" | "safe";
export type Severity = "safe" | "low" | "medium" | "high" | "critical";
export type PlanningMode = "view" | "simulate";
export type Half = 0 | 1;

export interface SimBlock {
  id: string;
  userId: string;
  startDate: string;
  startHalf: Half;
  endDate: string;
  endHalf: Half;
  colorIdx: number;
}

export interface ViewLeave {
  start: number;
  end: number;
  type: AbsenceType | null;
}

export interface BlockDisplayRange {
  startDay: number;
  endDay: number;
  startHalf: Half;
  endHalf: Half;
  clippedStart: boolean;
  clippedEnd: boolean;
}

export interface PlanningAbsence {
  id: number;
  type: AbsenceType | null;
  start_date: string;
  start_half: Half;
  end_date: string;
  end_half: Half;
  reason?: string | null;
}

export interface PlanningUserSkill {
  id: number;
  name: string;
  level: number;
}

export interface PlanningUserProject {
  id: number;
  name: string;
}

export interface PlanningUser {
  id: string;
  firstname: string;
  lastname: string;
  initials: string;
  title: string;
  department: { id: number; name: string } | null;
  color: string;
  skills: PlanningUserSkill[];
  projects: PlanningUserProject[];
  absences: PlanningAbsence[];
}

export interface PlanningCapacityToday {
  available: number;
  on_leave: number;
  total: number;
}

export interface PlanningResponse {
  month: string;
  users: PlanningUser[];
  capacity_today: PlanningCapacityToday | null;
}

export interface PlanningCapacityDay {
  day: number;
  ratio: number;
  available: number;
  on_leave: number;
}

export interface PlanningCapacityResponse {
  days: PlanningCapacityDay[];
}

export interface SimulateAbsenceInput {
  user_id: string;
  start_date: string;
  start_half: Half;
  end_date: string;
  end_half: Half;
}

/* ─────────────────────── Rich simulate response ─────────────────────── */

export interface SimulateTotals {
  risk_score: number;
  risk_score_delta: number;
  bus_factor: number;
  bus_factor_delta: number;
  coverage_pct: number;
  coverage_delta_pct: number;
  absent_fte_days: number;
  absent_headcount_peak: number;
  absent_headcount_peak_date: string | null;
  org_capacity_loss_pct: number;
  projects_at_risk_count: number;
  projects_blocked_count: number;
  critical_skills_uncovered_count: number;
  severity: Severity;
}

export interface UncoveredSkillRef {
  skill_id: number;
  name: string;
  level: number;
  is_critical: boolean;
  owners_left: number;
}

export interface ProjectAffected {
  project_id: number;
  name: string;
  role: string | null;
  criticality: Severity;
}

export interface ReplacementCandidate {
  user_id: string;
  name: string;
  skill_match_pct: number;
  available_days: number;
  cost_signal: "ok" | "stretch" | "overloaded";
}

export interface OverlapHint {
  user_id: string;
  dates: string[];
}

export interface UserImpact {
  user_id: string;
  level: ImpactLevel;
  days_off: number;
  working_days_in_month: number;
  absence_ratio_pct: number;
  skills_uncovered: UncoveredSkillRef[];
  projects_affected: ProjectAffected[];
  replacement_candidates: ReplacementCandidate[];
  overlap_with_other_sims: OverlapHint[];
  is_critical_employee: boolean;
  bus_factor_contribution: number;
}

export interface SkillAtRisk {
  skill_id: number;
  name: string;
  required_level: number;
  owners_left: number;
  owners_lost: string[];
  severity: Severity;
  dates_affected: string[];
}

export interface SinglePointOfFailure {
  skill_id: number;
  skill_name: string;
  owner_left: string;
}

export interface MilestoneAtRisk {
  id: string;
  name: string;
  date: string;
  confidence_delta_pct: number;
}

export interface ProjectImpact {
  project_id: number;
  name: string;
  status_before: "healthy" | "at_risk" | "blocked";
  status_after: "healthy" | "at_risk" | "blocked";
  bus_factor_before: number;
  bus_factor_after: number;
  bus_factor_delta: number;
  coverage_pct_before: number;
  coverage_pct_after: number;
  coverage_delta_pct: number;
  risk_score_before: number;
  risk_score_after: number;
  risk_delta: number;
  skills_at_risk: SkillAtRisk[];
  single_points_of_failure_created: SinglePointOfFailure[];
  milestones_at_risk: MilestoneAtRisk[];
  effective_team_size_before: number;
  effective_team_size_after: number;
  recommendation: string | null;
  level: ImpactLevel;
}

export interface SkillImpact {
  skill_id: number;
  name: string;
  category: string | null;
  is_critical_for_org: boolean;
  owners_total: number;
  owners_absent: number;
  owners_left: number;
  coverage_pct_before: number;
  coverage_pct_after: number;
  redundancy_before: number;
  redundancy_after: number;
  dates_uncovered: string[];
  projects_impacted: number[];
  severity: Severity;
}

export interface DayLoad {
  date: string;
  is_weekend: boolean;
  is_holiday: boolean;
  absent_user_ids: string[];
  absent_count: number;
  absent_fte: number;
  coverage_pct: number;
  capacity_pct: number;
  critical_skills_uncovered: number[];
  severity: Severity;
}

export interface Hotspot {
  date_range: [string, string];
  reason: string;
  absent_user_ids: string[];
  projects_impacted: number[];
  severity: Severity;
}

export interface SkillConcentrationShift {
  skill_id: number;
  skill_name: string;
  from_owners: number;
  to_owners: number;
  new_sole_owner: string | null;
  creates_bus_factor_1: boolean;
}

export interface CascadingRisk {
  type: "DOMINO" | "SKILL_CHAIN";
  trigger_user_id: string;
  if_also_absent: string[];
  consequence: string;
  probability_hint: "low" | "moderate" | "high";
}

export type WarningCode =
  | "CRITICAL_SKILL_GONE"
  | "BUS_FACTOR_1_CREATED"
  | "OVERLAPPING_LEADS"
  | "HOLIDAY_ADJACENT"
  | "PEAK_OVERLAP"
  | "PROJECT_BLOCKED";

export interface SimWarning {
  code: WarningCode;
  severity: Severity;
  message?: string;
  skill_id?: number;
  user_id?: string;
  user_ids?: string[];
  project_id?: number;
  date?: string;
  note?: string;
  actionable?: boolean;
}

export type RecommendationType = "REASSIGN" | "RESCHEDULE" | "UPSKILL" | "HIRE" | "SPLIT";

export interface RecommendationImpactPreview {
  risk_score_delta?: number;
  coverage_delta_pct?: number;
  absent_headcount_peak?: number;
  bus_factor_delta?: number;
}

export interface Recommendation {
  id: string;
  type: RecommendationType;
  priority: number;
  title: string;
  detail: string;
  impact_preview?: RecommendationImpactPreview;
}

export interface ComparisonBaseline {
  risk_score: { before: number; after: number; delta_pct: number };
  bus_factor: { before: number; after: number };
  coverage_pct: { before: number; after: number };
  projects_healthy_count: { before: number; after: number };
}

export interface SimulateMeta {
  computed_at: string;
  computation_ms: number;
  absences_evaluated: number;
  month: string;
}

export interface SimulateResponse {
  totals: SimulateTotals;
  per_user_impact: Record<string, UserImpact>;
  per_project_impact: ProjectImpact[];
  per_skill_impact: SkillImpact[];
  per_day_load: DayLoad[];
  hotspots: Hotspot[];
  skill_concentration_shifts: SkillConcentrationShift[];
  cascading_risks: CascadingRisk[];
  warnings: SimWarning[];
  recommendations: Recommendation[];
  comparison_vs_baseline: ComparisonBaseline;
  meta: SimulateMeta;
  /** Legacy alias derived from totals.severity. */
  overall_level: ImpactLevel;
  /** Legacy alias of per_project_impact. */
  projects: ProjectImpact[];
}
