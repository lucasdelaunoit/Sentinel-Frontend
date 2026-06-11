/** GET /dashboard/upcoming-risk-events */
interface UpcomingRiskEventsResponse {
  generated_at: string;
  events: UpcomingRiskEvent[];
}
