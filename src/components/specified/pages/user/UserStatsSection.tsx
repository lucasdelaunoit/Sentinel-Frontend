import { ShieldAlert, Users, Code2, FolderKanban } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import type { UserStats } from "@/types/dashboard";

interface UserStatsSectionProps {
  stats: UserStats;
}

export default function UserStatsSection({ stats }: UserStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="Criticality" icon={ShieldAlert} card={stats.criticality} />
      <StatCard title="Bus Factor in Org" icon={Users} card={stats.bus_factor_in_org} />
      <StatCard title="Skills" icon={Code2} card={stats.skills} />
      <StatCard title="Active Projects" icon={FolderKanban} card={stats.active_projects} />
    </div>
  );
}

UserStatsSection.Skeleton = function UserStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard.Skeleton title="Criticality" icon={ShieldAlert} />
      <StatCard.Skeleton title="Bus Factor in Org" icon={Users} />
      <StatCard.Skeleton title="Skills" icon={Code2} />
      <StatCard.Skeleton title="Active Projects" icon={FolderKanban} />
    </div>
  );
};
