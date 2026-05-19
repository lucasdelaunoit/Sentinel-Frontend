import StatCard from "@/components/common/cards/StatCard";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import { FoldersIcon, HeartbeatIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react";

export default function ProjectsStatCardsSection() {
  const { data: stats, isLoading } = useGetProjectsStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <StatCard.Skeleton title="Total Projects" icon={FoldersIcon} />
        <StatCard.Skeleton title="Avg Fragility" icon={HeartbeatIcon} />
        <StatCard.Skeleton title="Critical" icon={ShieldWarningIcon} />
        <StatCard.Skeleton title="Stretched" icon={WarningIcon} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Projects" icon={FoldersIcon} card={stats.total} />
      <StatCard title="Avg Fragility" icon={HeartbeatIcon} card={stats.avg_fragility} />
      <StatCard title="Critical" icon={ShieldWarningIcon} card={stats.fragile_count} />
      <StatCard title="Stretched" icon={WarningIcon} card={stats.stretched_count} />
    </div>
  );
}
