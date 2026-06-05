type ProjectFragilityAlertSeverity = "critical" | "warning" | "info";

interface ProjectFragilityAlert {
  id: string;
  severity: ProjectFragilityAlertSeverity;
  category: string;
  title: string;
  detail: string;
}
