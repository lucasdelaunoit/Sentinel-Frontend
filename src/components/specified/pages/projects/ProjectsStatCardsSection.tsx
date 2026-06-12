import StatCardsGrid from "@/components/common/cards/StatCardsGrid.tsx";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import { FoldersIcon, HeartbeatIcon, ShieldWarningIcon, ClockCountdownIcon } from "@phosphor-icons/react";

export default function ProjectsStatCardsSection() {
  const { data: stats, isLoading } = useGetProjectsStats();

  return (
    <StatCardsGrid
      className="grid-cols-4"
      isLoading={isLoading || !stats}
      items={[
        { title: "Total Projects", icon: FoldersIcon, card: stats?.total },
        { title: "Avg Fragility", icon: HeartbeatIcon, card: stats?.avg_fragility },
        { title: "Critical Projects", icon: ShieldWarningIcon, card: stats?.fragile_count },
        { title: "Deadline Pressure", icon: ClockCountdownIcon, card: stats?.deadline_pressure },
      ]}
    />
  );
}
