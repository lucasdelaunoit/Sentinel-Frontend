import { ArrowRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import StatCard from "@/components/common/cards/StatCard";
import useGetUsersStats from "@/api/users/useGetUsersStats.ts";
import { ChartPolarIcon, ScalesIcon, ShieldWarningIcon, UsersIcon } from "@phosphor-icons/react";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning: "text-amber-500",
  ok: "text-emerald-600",
};

export default function UsersStatCardsSection() {
  const { data: stats, isLoading: statsLoading } = useGetUsersStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Total Employees"
        value={stats ? String(stats.total_employees.value).padStart(2, "0") : "—"}
        icon={UsersIcon}
        isLoading={statsLoading}
        comment={
          <div
            className={cn(
              "text-sm flex items-center gap-1",
              stats ? SEVERITY_COLOR[stats.total_employees.severity] : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            <span className="font-semibold">{stats?.total_employees.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Critical Employees"
        value={stats ? String(stats.critical_employees.value).padStart(2, "0") : "—"}
        icon={ShieldWarningIcon}
        isLoading={statsLoading}
        comment={
          <div
            className={cn(
              "text-sm flex items-center gap-1",
              stats ? SEVERITY_COLOR[stats.critical_employees.severity] : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            <span className="font-semibold">{stats?.critical_employees.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Skill Coverage"
        value={stats ? `${stats.skill_coverage.value}%` : "—"}
        icon={ChartPolarIcon}
        isLoading={statsLoading}
        comment={
          <div
            className={cn(
              "text-sm flex items-center gap-1",
              stats ? SEVERITY_COLOR[stats.skill_coverage.severity] : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            <span className="font-semibold">{stats?.skill_coverage.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Department Balance"
        value={stats ? stats.department_balance.value : "—"}
        icon={ScalesIcon}
        isLoading={statsLoading}
        comment={
          <div
            className={cn(
              "text-sm flex items-center gap-1",
              stats ? SEVERITY_COLOR[stats.department_balance.severity] : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            <span className="font-semibold">{stats?.department_balance.insight ?? "Unavailable"}</span>
          </div>
        }
      />
    </div>
  );
}
