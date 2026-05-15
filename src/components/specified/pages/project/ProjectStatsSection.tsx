import { ShieldAlert, AlertTriangle, Brain, Users } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import { cn } from "@/lib/utils";
import type { ProjectDetailResponse } from "@/types/dashboard";

/* ─── Helpers ─────────────────────────────────────────────── */

function riskColor(v: number) {
  if (v >= 20) return "text-danger";
  if (v >= 12) return "text-amber-500";
  return "text-success";
}

function busColor(v: number) {
  if (v <= 1) return "text-danger";
  if (v <= 2) return "text-amber-500";
  return "text-success";
}

function healthColor(v: number) {
  if (v >= 75) return "text-success";
  if (v >= 55) return "text-amber-500";
  return "text-danger";
}

/* ─── Component ───────────────────────────────────────────── */

interface ProjectStatsSectionProps {
  project: ProjectDetailResponse;
}

export default function ProjectStatsSection({ project }: ProjectStatsSectionProps) {
  const team = project.users ?? [];
  const teamSize = team.length || project.users_count || 0;
  const awayCount = team.filter((u) => u.status === "away").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Risk Score"
        icon={ShieldAlert}
        isLoading={false}
        value={<span className={riskColor(project.risk_score)}>{project.risk_score}/100</span>}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {project.risk_score >= 20 ? "High risk" : project.risk_score >= 12 ? "Moderate" : "Low risk"}
          </span>
        }
      />
      <StatCard
        title="Bus Factor"
        icon={AlertTriangle}
        isLoading={false}
        value={<span className={busColor(project.bus_factor)}>{project.bus_factor}</span>}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {project.bus_factor <= 1
              ? "Critical — 1 person"
              : project.bus_factor <= 2
                ? "Low — 2 people"
                : "Acceptable"}
          </span>
        }
      />
      <StatCard
        title="Health Score"
        icon={Brain}
        isLoading={false}
        value={<span className={healthColor(project.health)}>{project.health}/100</span>}
        comment={
          <span className="text-[12px] text-muted-foreground">
            {project.health >= 75 ? "Healthy" : project.health >= 55 ? "Degraded" : "Critical"}
          </span>
        }
      />
      <StatCard
        title="Team"
        icon={Users}
        isLoading={false}
        value={teamSize}
        comment={
          <span className={cn("text-[12px]", awayCount > 0 ? "text-amber-500" : "text-muted-foreground")}>
            {awayCount > 0 ? `${awayCount} away` : "All available"}
          </span>
        }
      />
    </div>
  );
}

ProjectStatsSection.Skeleton = function ProjectStatsSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard title="" value={null} comment={null} icon={ShieldAlert} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={AlertTriangle} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={Brain} isLoading={true} />
      <StatCard title="" value={null} comment={null} icon={Users} isLoading={true} />
    </div>
  );
};
