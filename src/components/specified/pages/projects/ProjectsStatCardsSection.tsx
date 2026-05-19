import StatCardView from "@/components/common/cards/StatCardView";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import { FoldersIcon, HeartbeatIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react";

export default function ProjectsStatCardsSection() {
  const { data: stats, isLoading } = useGetProjectsStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCardView title="Total Projects" icon={FoldersIcon} card={stats?.total} isLoading={isLoading} />
      <StatCardView
        title="Avg Trajectory"
        icon={HeartbeatIcon}
        card={stats?.avg_trajectory}
        isLoading={isLoading}
      />
      <StatCardView
        title="Critical"
        icon={ShieldWarningIcon}
        card={stats?.fragile_count}
        isLoading={isLoading}
      />
      <StatCardView
        title="Stretched"
        icon={WarningIcon}
        card={stats?.stretched_count}
        isLoading={isLoading}
      />
    </div>
  );
}
