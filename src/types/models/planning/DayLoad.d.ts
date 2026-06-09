interface DayLoad {
  date: string;
  is_weekend: boolean;
  is_holiday: boolean;
  absent_user_ids: string[];
  absent_count: number;
  absent_fte: number;
  coverage_pct: number;
  capacity_pct: number;
  critical_skills_uncovered: number[];
  severity: Severity;
}
