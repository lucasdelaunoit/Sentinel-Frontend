import { Activity, CalendarCheck, ShieldAlert, Users } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";

interface PlanningStatsSectionProps {
  availableToday: number | null;
  onLeaveToday: number | null;
  workingDaysLeft: number;
  atRiskProjects: number | null;
  isLoading: boolean;
}

function pad(n: number | null): string {
  return n === null ? "—" : String(n).padStart(2, "0");
}

export default function PlanningStatsSection({
  availableToday,
  onLeaveToday,
  workingDaysLeft,
  atRiskProjects,
  isLoading,
}: PlanningStatsSectionProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Available Today"
        value={pad(availableToday)}
        icon={Users}
        isLoading={isLoading}
        comment={null}
      />
      <StatCard
        title="On Leave Today"
        value={pad(onLeaveToday)}
        icon={CalendarCheck}
        isLoading={isLoading}
        comment={null}
      />
      <StatCard
        title="Working Days Left"
        value={String(workingDaysLeft).padStart(2, "0")}
        icon={Activity}
        isLoading={isLoading}
        comment={null}
      />
      <StatCard
        title="Projects at Risk"
        value={atRiskProjects === null ? "—" : pad(atRiskProjects)}
        icon={ShieldAlert}
        isLoading={isLoading}
        comment={null}
      />
    </div>
  );
}
