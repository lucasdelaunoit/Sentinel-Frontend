interface SkillAtRisk {
  skill_id: number;
  name: string;
  required_level: number;
  owners_left: number;
  owners_lost: string[];
  severity: Severity;
  dates_affected: string[];
}
