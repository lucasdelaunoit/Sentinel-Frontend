import StatCard from "@/components/common/cards/StatCard";
import useGetUsersStats from "@/api/users/useGetUsersStats.ts";
import { CalendarCheckIcon, ShieldWarningIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react";

export default function UsersStatCardsSection() {
  const { data: stats, isLoading } = useGetUsersStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-4 gap-4">
        <StatCard.Skeleton title="Total Employees" icon={UsersIcon} />
        <StatCard.Skeleton title="Available" icon={CalendarCheckIcon} />
        <StatCard.Skeleton title="Critical Employees" icon={ShieldWarningIcon} />
        <StatCard.Skeleton title="Unique Skill Holders" icon={UserCircleIcon} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="Total Employees" icon={UsersIcon} card={stats.total} />
      <StatCard title="Available" icon={CalendarCheckIcon} card={stats.available} />
      <StatCard title="Critical Employees" icon={ShieldWarningIcon} card={stats.critical_users} />
      <StatCard title="Unique Skill Holders" icon={UserCircleIcon} card={stats.unique_skill_holders} />
    </div>
  );
}
