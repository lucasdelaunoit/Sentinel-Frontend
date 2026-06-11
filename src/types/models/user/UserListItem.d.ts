/**
 * List row (GET /users, GET /projects/:id/users) — a `User` whose `department`
 * and `skills` relations are guaranteed loaded via `includes`.
 */
type UserListItem = User & {
  department: { id: number; name: string } | null;
  skills: UserSkillItem[];
};
