import { CodeIcon, KanbanIcon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";
import StatCardsGrid, { type StatCardsGridItem } from "@/components/common/cards/StatCardsGrid.tsx";

interface UserStatsSectionProps {
  stats: UserStats;
}

function items(stats?: UserStats): StatCardsGridItem[] {
  return [
    { title: "Criticality", icon: ShieldWarningIcon, card: stats?.criticality },
    { title: "Bus Factor in Org", icon: UsersIcon, card: stats?.bus_factor_in_org },
    { title: "Skills", icon: CodeIcon, card: stats?.skills },
    { title: "Active Projects", icon: KanbanIcon, card: stats?.active_projects },
  ];
}

export default function UserStatsSection({ stats }: UserStatsSectionProps) {
  return <StatCardsGrid items={items(stats)} />;
}

UserStatsSection.Skeleton = function UserStatsSectionSkeleton() {
  return <StatCardsGrid items={items()} isLoading />;
};
