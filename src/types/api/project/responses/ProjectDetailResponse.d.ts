/** GET /projects/:id */
interface ProjectDetailResponse {
  id: number;
  name: string;
  description: string;
  status: ProjectStatus;
  fragility: StatCardData;
  bus_factor: StatCardData;
  started_at: string;
  deadline: string;
  paused_at: string | null;
  completed_at: string | null;
  archived_at: string | null;
  users_count?: number;
  users?: ProjectDetailUser[];
  skill_requirements?: ProjectSkillRequirementItem[];
  created_at: string;
}
