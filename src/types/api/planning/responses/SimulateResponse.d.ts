interface SimulateResponse {
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
}
