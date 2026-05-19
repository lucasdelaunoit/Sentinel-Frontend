import StatCardView from "@/components/common/cards/StatCardView";
import useGetUsersStats from "@/api/users/useGetUsersStats.ts";
import {
  CalendarCheckIcon,
  ScalesIcon,
  ShieldWarningIcon,
  UserCircleIcon,
  UsersIcon,
} from "@phosphor-icons/react";

export default function UsersStatCardsSection() {
  const { data: stats, isLoading } = useGetUsersStats();

  return (
    <div className="grid grid-cols-5 gap-4">
      <StatCardView title="Total" icon={UsersIcon} card={stats?.total} isLoading={isLoading} />
      <StatCardView title="Available" icon={CalendarCheckIcon} card={stats?.available} isLoading={isLoading} />
      <StatCardView
        title="Critical Users"
        icon={ShieldWarningIcon}
        card={stats?.critical_users}
        isLoading={isLoading}
      />
      <StatCardView
        title="Unique Skill Holders"
        icon={UserCircleIcon}
        card={stats?.unique_skill_holders}
        isLoading={isLoading}
      />
      <StatCardView title="Departments" icon={ScalesIcon} card={stats?.departments} isLoading={isLoading} />
    </div>
  );
}
