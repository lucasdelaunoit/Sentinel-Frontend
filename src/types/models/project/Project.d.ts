interface Project {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  fragility: MetricResult;
  team_availability?: MetricResult;
  knowledge_coverage?: MetricResult;
  started_at: string;
  deadline: string;
  paused_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  deleted_at: string | null;
  created_at: string;
  users_count?: number;
}
