import { ShieldAlert, AlertTriangle, Brain, Users } from "lucide-react";
import StatCardView from "@/components/common/cards/StatCardView";
import type { ProjectStats } from "@/types/dashboard";

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardView title="Fragility" icon={ShieldAlert} card={stats.fragility} />
      <StatCardView title="Bus Factor" icon={AlertTriangle} card={stats.bus_factor} />
      <StatCardView title="Trajectory" icon={Brain} card={stats.trajectory} />
      <StatCardView title="Team" icon={Users} card={stats.team} />
    </div>
  );
}

ProjectStatsSection.Skeleton = function ProjectStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardView.Skeleton title="Fragility" icon={ShieldAlert} />
      <StatCardView.Skeleton title="Bus Factor" icon={AlertTriangle} />
      <StatCardView.Skeleton title="Trajectory" icon={Brain} />
      <StatCardView.Skeleton title="Team" icon={Users} />
    </div>
  );
};
