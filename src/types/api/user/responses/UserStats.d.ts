/** GET /users/:id/stats */
interface UserStats {
  criticality: StatCardData;
  bus_factor_in_org: StatCardData;
  skills: StatCardData;
  active_projects: StatCardData;
}
