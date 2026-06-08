interface SimulateTotals {
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
  severity: PlanningSeverity;
}
