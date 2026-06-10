interface SimulateResponse {
  totals: SimulateTotals;
  per_user_impact: Record<string, UserImpact>;
  per_project_impact: ProjectImpact[];
  per_skill_impact: SkillImpact[];
  per_day_load: DayLoad[];
  hotspots: Hotspot[];
  cascading_risks: CascadingRisk[];
  warnings: SimWarning[];
  comparison_vs_baseline: ComparisonBaseline;
}
