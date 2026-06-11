/** Skill as embedded on a user list row (with level pivot). */
interface UserSkillItem {
  id: number;
  name: string;
  category: { id: number; name: string };
  pivot: { level: number };
}
