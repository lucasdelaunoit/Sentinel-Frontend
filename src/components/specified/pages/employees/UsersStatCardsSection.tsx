import StatCardsGrid from "@/components/common/cards/StatCardsGrid.tsx";
import useGetUsersStats from "@/api/user/useGetUsersStats.ts";
import { CalendarCheckIcon, ShieldWarningIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react";

export default function UsersStatCardsSection() {
  const { data: stats, isLoading } = useGetUsersStats();

  return (
    <StatCardsGrid
      className="grid-cols-4"
      isLoading={isLoading || !stats}
      items={[
        { title: "Total Employees", icon: UsersIcon, card: stats?.total },
        { title: "Available", icon: CalendarCheckIcon, card: stats?.available },
        { title: "Critical Employees", icon: ShieldWarningIcon, card: stats?.critical_users },
        { title: "Unique Skill Holders", icon: UserCircleIcon, card: stats?.unique_skill_holders },
      ]}
    />
  );
}
