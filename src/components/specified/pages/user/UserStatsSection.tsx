import { CodeIcon, KanbanIcon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";
import StatCard from "@/components/common/cards/StatCard";

interface UserStatsSectionProps {
  stats: UserStats;
}

export default function UserStatsSection({ stats }: UserStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Criticality" icon={ShieldWarningIcon} card={stats.criticality} />
      <StatCard title="Bus Factor in Org" icon={UsersIcon} card={stats.bus_factor_in_org} />
      <StatCard title="Skills" icon={CodeIcon} card={stats.skills} />
      <StatCard title="Active Projects" icon={KanbanIcon} card={stats.active_projects} />
    </div>
  );
}

UserStatsSection.Skeleton = function UserStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard.Skeleton title="Criticality" icon={ShieldWarningIcon} />
      <StatCard.Skeleton title="Bus Factor in Org" icon={UsersIcon} />
      <StatCard.Skeleton title="Skills" icon={CodeIcon} />
      <StatCard.Skeleton title="Active Projects" icon={KanbanIcon} />
    </div>
  );
};
