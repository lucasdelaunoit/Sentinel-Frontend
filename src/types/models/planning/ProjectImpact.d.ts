interface ProjectImpact {
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
  severity: Severity;
}
