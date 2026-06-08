interface Hotspot {
  date_range: [string, string];
  reason: string;
  absent_user_ids: string[];
  projects_impacted: number[];
  severity: PlanningSeverity;
}
