import { Badge } from "@/components/ui/badge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { TONE_BG } from "@/lib/scoring.ts";
import { cn } from "@/lib/utils.ts";
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
          {criticalCount > 0 && (
            <Badge className={cn("text-white border-transparent", TONE_BG.danger)}>{criticalCount} critical</Badge>
          )}
          {warningCount > 0 && (
            <Badge className={cn("text-white border-transparent", TONE_BG.warning)}>{warningCount} warning</Badge>
          )}
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
    <ComposedCard title="Fragility Alerts" action={<Skeleton className="h-5 w-20 rounded-full" />}>
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <MediumAlertRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
