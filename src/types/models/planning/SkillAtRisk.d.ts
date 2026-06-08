interface SkillAtRisk {
  skill_id: number;
  name: string;
  required_level: number;
  owners_left: number;
  owners_lost: string[];
  severity: PlanningSeverity;
  dates_affected: string[];
}
