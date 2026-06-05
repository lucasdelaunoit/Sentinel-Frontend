import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import useGetProjectFragilityAlerts from "@/api/projects/useGetProjectFragilityAlerts.ts";
import MediumAlertRow from "@/components/specified/models/alert/datas/MediumAlertRow.tsx";

interface ProjectFragilityAlertsCardProps {
  projectId: string | undefined;
}

export default function ProjectFragilityAlertsCard({ projectId }: ProjectFragilityAlertsCardProps) {
  const { data: alerts = [], isLoading } = useGetProjectFragilityAlerts(projectId);

  if (isLoading) return <ProjectFragilityAlertsCard.Skeleton />;

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <ComposedCard
      title="Fragility Alerts"
      action={
        <div className="flex items-center gap-2">
          {criticalCount > 0 && <Badge className="text-card bg-danger">{criticalCount} critical</Badge>}
          {warningCount > 0 && <Badge className="text-card bg-warning">{warningCount} warning</Badge>}
        </div>
      }
    >
      <div className="space-y-2.5">
        {alerts.length === 0 ? (
          <Feedback
            variant="success"
            title="No active fragility alerts"
            description="This project is in good shape — no critical risks detected."
            className="py-10"
          />
        ) : (
          alerts.map((alert) => <MediumAlertRow key={alert.id} alert={alert} />)
        )}
      </div>
    </ComposedCard>
  );
}

ProjectFragilityAlertsCard.Skeleton = function ProjectFragilityAlertsCardSkeleton() {
  return (
    <ComposedCard
      title="Fragility Alerts"
      action={
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      }
    >
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <MediumAlertRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
