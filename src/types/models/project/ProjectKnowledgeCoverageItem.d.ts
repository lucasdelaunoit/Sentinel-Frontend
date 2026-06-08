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
  /** Row identity for table keying — mirrors skill.id. */
  id: number;
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
  /** First 5 holders (best level first); see holders_total for the full count. */
  holders: ProjectKnowledgeCoverageHolder[];
  /** Total members holding the skill at any level — drives the "+N / view all" affordance. */
  holders_total: number;
}

interface ProjectKnowledgeCoverageSummary {
  covered: number;
  silo: number;
  uncovered: number;
  total: number;
}
