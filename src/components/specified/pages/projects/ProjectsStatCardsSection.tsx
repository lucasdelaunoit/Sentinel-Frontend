import StatCard from "@/components/common/cards/StatCard";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import { FoldersIcon, HeartbeatIcon, ShieldWarningIcon, ClockCountdownIcon } from "@phosphor-icons/react";

export default function ProjectsStatCardsSection() {
  const { data: stats, isLoading } = useGetProjectsStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <StatCard.Skeleton title="Total Projects" icon={FoldersIcon} />
        <StatCard.Skeleton title="Avg Fragility" icon={HeartbeatIcon} />
        <StatCard.Skeleton title="Critical Projects" icon={ShieldWarningIcon} />
        <StatCard.Skeleton title="Deadline Pressure" icon={ClockCountdownIcon} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Projects" icon={FoldersIcon} card={stats.total} />
      <StatCard title="Avg Fragility" icon={HeartbeatIcon} card={stats.avg_fragility} />
      <StatCard title="Critical Projects" icon={ShieldWarningIcon} card={stats.fragile_count} />
      <StatCard title="Deadline Pressure" icon={ClockCountdownIcon} card={stats.deadline_pressure} />
    </div>
  );
}
