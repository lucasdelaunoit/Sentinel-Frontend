interface ProjectImpact {
  project_id: number;
  name: string;
  status_after: "healthy" | "at_risk" | "blocked";
  bus_factor_before: number;
  bus_factor_after: number;
  bus_factor_delta: number;
  coverage_pct_before: number;
  coverage_pct_after: number;
  coverage_delta_pct: number;
  risk_score_before: number;
  risk_score_after: number;
  skills_at_risk: SkillAtRisk[];
  severity: Severity;
}
