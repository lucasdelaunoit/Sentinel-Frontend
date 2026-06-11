import StatCard from "@/components/common/cards/StatCard";
import useGetDashboardStats from "@/api/dashboard/useGetDashboardStats";
import { ChartPolarIcon, LightningIcon, UserIcon, WarningIcon } from "@phosphor-icons/react";

export default function HomeStatCardsSection() {
  const { data: dashboardStatsData, isLoading } = useGetDashboardStats();

  if (isLoading || !dashboardStatsData) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <StatCard.Skeleton title="Fragile Projects" icon={WarningIcon} />
        <StatCard.Skeleton title="Knowledge Coverage" icon={ChartPolarIcon} />
        <StatCard.Skeleton title="Team Availability" icon={UserIcon} />
        <StatCard.Skeleton title="Absence Impact" icon={LightningIcon} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Fragile Projects" icon={WarningIcon} card={dashboardStatsData.fragile_projects} />
      <StatCard title="Knowledge Coverage" icon={ChartPolarIcon} card={dashboardStatsData.knowledge_coverage} />
      <StatCard title="Team Availability" icon={UserIcon} card={dashboardStatsData.team_availability} />
      <StatCard title="Absence Impact" icon={LightningIcon} card={dashboardStatsData.absence_impact} />
    </div>
  );
}
