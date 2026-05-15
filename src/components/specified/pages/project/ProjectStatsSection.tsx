import { ShieldAlert, AlertTriangle, Brain, Users, ArrowRightIcon } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import { cn } from "@/lib/utils";
import type { ProjectStats } from "@/types/dashboard";

/* ─── Helpers ─────────────────────────────────────────────── */

function riskColor(v: number) {
  if (v >= 70) return "text-danger";
  if (v >= 40) return "text-amber-500";
  return "text-success";
}

function riskLabel(v: number) {
  if (v >= 70) return "High risk";
  if (v >= 40) return "Moderate";
  return "Low risk";
}

function busColor(v: number) {
  if (v <= 1) return "text-danger";
  if (v <= 2) return "text-amber-500";
  return "text-success";
}

function busLabel(v: number) {
  if (v <= 1) return "Critical — 1 person";
  if (v <= 2) return "Low — 2 people";
  return "Acceptable";
}

function healthColor(v: number) {
  if (v >= 75) return "text-success";
  if (v >= 55) return "text-amber-500";
  return "text-danger";
}

function healthLabel(v: number) {
  if (v >= 75) return "Healthy";
  if (v >= 55) return "Degraded";
  return "Critical";
}

/* ─── Component ───────────────────────────────────────────── */

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  const { risk_score, bus_factor, health_score, team } = stats;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Risk Score"
        icon={ShieldAlert}
        isLoading={false}
        value={<span className={riskColor(risk_score)}>{risk_score}/100</span>}
        comment={<span className="text-[12px] text-muted-foreground">{riskLabel(risk_score)}</span>}
      />
      <StatCard
        title="Bus Factor"
        icon={AlertTriangle}
        isLoading={false}
        value={<span className={busColor(bus_factor)}>{bus_factor}</span>}
        comment={<span className="text-[12px] text-muted-foreground">{busLabel(bus_factor)}</span>}
      />
      <StatCard
        title="Health Score"
        icon={Brain}
        isLoading={false}
        value={<span className={healthColor(health_score)}>{health_score}/100</span>}
        comment={<span className="text-[12px] text-muted-foreground">{healthLabel(health_score)}</span>}
      />
      <StatCard
        title="Team"
        icon={Users}
        isLoading={false}
        value={team.total}
        comment={
          <div className="flex items-center gap-1 text-sm text-secondary-foreground font-semibold">
            <ArrowRightIcon size={13} />
            {team.away > 0 ? `${team.away} away` : "All available"}
          </div>
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
