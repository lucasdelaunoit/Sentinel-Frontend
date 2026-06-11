/** GET /employees list row. */
interface UserListItem {
  id: number;
  department_id: number;
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  is_remote: boolean;
  status: UserStatus;
  department: { id: number; name: string };
  skills: UserSkillItem[];
}
