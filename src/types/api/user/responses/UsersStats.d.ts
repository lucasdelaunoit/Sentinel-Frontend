/** GET /users/stats */
interface UsersStats {
  total: StatCardData;
  available: StatCardData;
  critical_users: StatCardData;
  unique_skill_holders: StatCardData;
  departments: StatCardData;
  critical_users_preview: CriticalUserPreviewItem[];
}
