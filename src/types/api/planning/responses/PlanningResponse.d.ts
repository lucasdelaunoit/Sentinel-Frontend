interface PlanningResponse {
  month: string;
  users: PlanningUser[];
  capacity_today: PlanningCapacityToday | null;
}
