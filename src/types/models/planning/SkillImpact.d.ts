interface SkillImpact {
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
