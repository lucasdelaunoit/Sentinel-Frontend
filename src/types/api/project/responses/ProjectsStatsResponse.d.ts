interface ProjectStatsResponse {
  risk_score: number;
  bus_factor: number;
  health_score: number;
  team: {
    total: number;
    away: number;
  };
}
