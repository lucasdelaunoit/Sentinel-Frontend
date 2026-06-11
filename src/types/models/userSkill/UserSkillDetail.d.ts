/** GET /users/:id/skills item — full skill with user pivot. */
interface UserSkillDetail {
  id: number;
  skill_category_id: number;
  skill_category: SkillCategory;
  name: string;
  created_at: string;
  updated_at: string;
  category: { id: number; name: string; created_at: string; updated_at: string };
  pivot: {
    user_id: number;
    skill_id: number;
    level: number;
    created_at: string;
    updated_at: string;
  };
}
