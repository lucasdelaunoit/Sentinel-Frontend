/** GET /dashboard/stats */
interface DashboardStats {
  fragile_projects: StatCardData;
  knowledge_coverage: StatCardData;
  team_availability: StatCardData;
  absence_impact: StatCardData;
}
