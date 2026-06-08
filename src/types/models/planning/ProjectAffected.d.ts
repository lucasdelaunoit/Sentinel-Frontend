interface ProjectAffected {
  project_id: number;
  name: string;
  role: string | null;
  criticality: PlanningSeverity;
}
