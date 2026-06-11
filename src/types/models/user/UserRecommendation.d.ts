/** GET /users/:id/recommendations item. */
interface UserRecommendation {
  id: string;
  icon: UserRecommendationIcon;
  title: string;
  description: string;
  severity: Severity;
  priority: "high" | "medium" | "low";
}
