import { ShieldAlert, AlertTriangle, Users } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import type { ProjectStats } from "@/types/dashboard";

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard title="Fragility" icon={ShieldAlert} card={stats.fragility} />
      <StatCard title="Bus Factor" icon={AlertTriangle} card={stats.bus_factor} />
      <StatCard title="Team" icon={Users} card={stats.team} />
    </div>
  );
}

ProjectStatsSection.Skeleton = function ProjectStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <StatCard.Skeleton title="Fragility" icon={ShieldAlert} />
      <StatCard.Skeleton title="Bus Factor" icon={AlertTriangle} />
      <StatCard.Skeleton title="Team" icon={Users} />
    </div>
  );
};
