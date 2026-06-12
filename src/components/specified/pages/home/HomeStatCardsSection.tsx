import StatCardsGrid from "@/components/common/cards/StatCardsGrid.tsx";
import useGetDashboardStats from "@/api/dashboard/useGetDashboardStats";
import { ChartPolarIcon, LightningIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";

export default function HomeStatCardsSection() {
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <StatCardsGrid
      className="grid-cols-4"
      isLoading={isLoading || !stats}
      items={[
        { title: "Fragile Projects", icon: WarningIcon, card: stats?.fragile_projects },
        { title: "Knowledge Coverage", icon: ChartPolarIcon, card: stats?.knowledge_coverage },
        { title: "Team Availability", icon: UserIcon, card: stats?.team_availability },
        { title: "Absence Impact", icon: LightningIcon, card: stats?.absence_impact },
      ]}
    />
  );
}
