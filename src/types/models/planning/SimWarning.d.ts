interface SimWarning {
  code: WarningCode;
  severity: PlanningSeverity;
  message?: string;
  skill_id?: number;
  user_id?: string;
  user_ids?: string[];
  project_id?: number;
  date?: string;
  note?: string;
  actionable?: boolean;
}
