interface UserImpact {
  user_id: string;
  severity: Severity;
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
