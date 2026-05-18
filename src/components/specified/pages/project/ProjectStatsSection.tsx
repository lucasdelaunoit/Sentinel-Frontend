import { ShieldAlert, AlertTriangle, Brain, Users, ArrowRightIcon } from "lucide-react";
import StatCard from "@/components/common/cards/StatCard";
import { cn } from "@/lib/utils";
import type { ProjectStats } from "@/types/dashboard";
import { getFragilityTier, getTrajectoryTier, TONE_TEXT } from "@/lib/scoring";

function busColor(v: number) {
  if (v <= 1) return "text-danger";
  if (v <= 2) return "text-warning";
  return "text-success";
}

function busLabel(v: number) {
  if (v <= 1) return "Critical — 1 person";
  if (v <= 2) return "Low — 2 people";
  return "Acceptable";
}

interface ProjectStatsSectionProps {
  stats: ProjectStats;
}

export default function ProjectStatsSection({ stats }: ProjectStatsSectionProps) {
  const { risk_score, bus_factor, health_score, team } = stats;
  const fragility = getFragilityTier(risk_score);
  const trajectory = getTrajectoryTier(health_score);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        title="Fragility"
        icon={ShieldAlert}
        isLoading={false}
        value={
          <span className={TONE_TEXT[fragility.tone]}>
            {fragility.label}
            <span className="text-[14px] opacity-60 ml-1.5 tabular-nums">{risk_score}</span>
          </span>
        }
        comment={<span className="text-[12px] text-muted-foreground">Structural fragility right now</span>}
      />
      <StatCard
        title="Bus Factor"
        icon={AlertTriangle}
        isLoading={false}
        value={<span className={busColor(bus_factor)}>{bus_factor}</span>}
        comment={<span className="text-[12px] text-muted-foreground">{busLabel(bus_factor)}</span>}
      />
      <StatCard
        title="Trajectory"
        icon={Brain}
        isLoading={false}
        value={
          <span className={TONE_TEXT[trajectory.tone]}>
            {trajectory.label}
            <span className="text-[14px] opacity-60 ml-1.5 tabular-nums">{health_score}</span>
          </span>
        }
        comment={<span className="text-[12px] text-muted-foreground">Fragility + progress combined</span>}
      />
      <StatCard
        title="Team"
        icon={Users}
        isLoading={false}
        value={team.total}
        comment={
          <div className={cn("flex items-center gap-1 text-sm text-secondary-foreground font-semibold")}>
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
