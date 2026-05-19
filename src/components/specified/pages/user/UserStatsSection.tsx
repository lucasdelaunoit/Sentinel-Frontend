import { ShieldAlert, Users, Code2, FolderKanban } from "lucide-react";
import StatCardView from "@/components/common/cards/StatCardView";
import type { UserStats } from "@/types/dashboard";

interface UserStatsSectionProps {
  stats: UserStats;
}

export default function UserStatsSection({ stats }: UserStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardView title="Criticality" icon={ShieldAlert} card={stats.criticality} />
      <StatCardView title="Bus Factor in Org" icon={Users} card={stats.bus_factor_in_org} />
      <StatCardView title="Skills" icon={Code2} card={stats.skills} />
      <StatCardView title="Active Projects" icon={FolderKanban} card={stats.active_projects} />
    </div>
  );
}

UserStatsSection.Skeleton = function UserStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCardView.Skeleton title="Criticality" icon={ShieldAlert} />
      <StatCardView.Skeleton title="Bus Factor in Org" icon={Users} />
      <StatCardView.Skeleton title="Skills" icon={Code2} />
      <StatCardView.Skeleton title="Active Projects" icon={FolderKanban} />
    </div>
  );
};
