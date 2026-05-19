import StatCard from "@/components/common/cards/StatCard";
import useGetUsersStats from "@/api/users/useGetUsersStats.ts";
import { CalendarCheckIcon, ShieldWarningIcon, UserCircleIcon, UsersIcon } from "@phosphor-icons/react";

export default function UsersStatCardsSection() {
  const { data: stats, isLoading } = useGetUsersStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats && (
        <>
          <StatCard title="Total" icon={UsersIcon} card={stats.total} isLoading={isLoading || !stats} />
          <StatCard title="Available" icon={CalendarCheckIcon} card={stats.available} isLoading={isLoading || !stats} />
          <StatCard
            title="Critical Users"
            icon={ShieldWarningIcon}
            card={stats.critical_users}
            isLoading={isLoading || !stats}
          />
          <StatCard
            title="Unique Skill Holders"
            icon={UserCircleIcon}
            card={stats.unique_skill_holders}
            isLoading={isLoading || !stats}
          />
        </>
      )}
    </div>
  );
}
