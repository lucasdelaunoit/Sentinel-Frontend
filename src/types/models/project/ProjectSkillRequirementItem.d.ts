interface ProjectSkillRequirementItem {
  id: number;
  name: string;
  pivot?: { project_id: number; skill_id: number; required_level: number };
}
