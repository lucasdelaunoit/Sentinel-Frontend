interface UserImpact {
  user_id: string;
  severity: Severity;
  days_off: number;
  skills_uncovered: UncoveredSkillRef[];
  projects_affected: ProjectAffected[];
  replacement_candidates: ReplacementCandidate[];
  is_critical_employee: boolean;
  bus_factor_contribution: number;
}
