import StatCard from "@/components/common/cards/StatCard.tsx";
import useGetDashboardStats from "@/hooks/useGetDashboardStats";
import { Activity, AlertTriangle, ArrowRightIcon, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils.ts";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "text-destructive-foreground",
  warning:  "text-amber-500",
  ok: "text-emerald-600",
};

export default function HomeStatCardsSection() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Projects at Risk"
        value={stats ? String(stats.projects_at_risk.value) : "—"}
        icon={AlertTriangle}
        //onClick={() => setModalOpen("risk")}
        isLoading={statsLoading}
        comment={
          <div className={cn("text-sm flex items-center gap-1", stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : "text-secondary-foreground")}>
            <ArrowRightIcon size={13} /> <span className="font-semibold">{stats?.projects_at_risk.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Knowledge Coverage"
        value={stats ? `${stats.knowledge_coverage.value}%` : "—"}
        icon={Activity}
        //onClick={() => setModalOpen("coverage")}
        isLoading={statsLoading}
        comment={
          <div className={cn("text-sm flex items-center gap-1", stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : "text-secondary-foreground")}>
            <ArrowRightIcon size={13} /> <span className="font-semibold">{stats?.knowledge_coverage.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Team Availability"
        value={stats ? stats.team_availability.value : "—"}
        icon={Users}
        //onClick={() => setModalOpen("availability")}
        isLoading={statsLoading}
        comment={
          <div className={cn("text-sm flex items-center gap-1", stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : "text-secondary-foreground")}>
            <ArrowRightIcon size={13} /> <span className="font-semibold">{stats?.team_availability.insight ?? "Unavailable"}</span>
          </div>
        }
      />
      <StatCard
        title="Absence Impact"
        value={stats ? String(stats.absence_impact.value) : "—"}
        icon={Zap}
        //onClick={() => setModalOpen("impact")}
        isLoading={statsLoading}
        comment={
          <div className={cn("text-sm flex items-center gap-1", stats ? SEVERITY_COLOR[stats.projects_at_risk.severity] : "text-secondary-foreground")}>
            <ArrowRightIcon size={13} /> <span className="font-semibold">{stats?.absence_impact.insight ?? "Unavailable"}</span>
          </div>
        }
      />
    </div>
  )
}