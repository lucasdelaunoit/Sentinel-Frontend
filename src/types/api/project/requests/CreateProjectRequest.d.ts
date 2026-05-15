interface CreateProjectSkillRequirement {
  skill_id: number;
  required_level: number;
}

interface CreateProjectRequest {
  name: string;
  description?: string;
  started_at?: string;
  deadline?: string;
  user_ids?: number[];
  skill_requirements?: CreateProjectSkillRequirement[];
}
