type ProjectKnowledgeCoverageStatus = "uncovered" | "silo" | "covered";

interface ProjectKnowledgeCoverageHolder {
  id: string;
  firstname: string;
  lastname: string;
  status: UserStatus;
  level: number;
  on_leave_today: boolean;
}

interface ProjectKnowledgeCoverageItem {
  skill: {
    id: string;
    name: string;
    category: string;
  };
  required_level: number;
  max_level: number;
  active_holders_count: number;
  team_size: number;
  status: ProjectKnowledgeCoverageStatus;
  holders: ProjectKnowledgeCoverageHolder[];
}
