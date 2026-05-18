import { cn } from "@/lib/utils";
import StatCard from "@/components/common/cards/StatCard";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import { FoldersIcon, HeartbeatIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react";
import { ArrowRightIcon } from "lucide-react";

import { getTrajectoryTier, TONE_TEXT } from "@/lib/scoring";

function avgTrajectoryColor(value: number) {
  return TONE_TEXT[getTrajectoryTier(value).tone];
}

export default function ProjectsStatCardsSection() {
  const { data: stats, isLoading } = useGetProjectsStats();

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard
        title="Total Projects"
        value={stats ? String(stats.total).padStart(2, "0") : "—"}
        icon={FoldersIcon}
        isLoading={isLoading}
        comment={
          <div className="flex items-center gap-1 text-sm text-secondary-foreground font-semibold">
            <ArrowRightIcon size={13} />
            Active portfolio
          </div>
        }
      />
      <StatCard
        title="Avg Trajectory"
        value={stats ? `${stats.avg_health}` : "—"}
        icon={HeartbeatIcon}
        isLoading={isLoading}
        comment={
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              stats ? avgTrajectoryColor(stats.avg_health) : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            Avg across all projects
          </div>
        }
      />
      <StatCard
        title="Critical"
        value={stats ? String(stats.fragile).padStart(2, "0") : "—"}
        icon={ShieldWarningIcon}
        isLoading={isLoading}
        comment={
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              stats && stats.fragile > 0 ? "text-destructive-foreground" : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            Fragility ≥ 70
          </div>
        }
      />
      <StatCard
        title="Stretched"
        value={stats ? String(stats.at_risk).padStart(2, "0") : "—"}
        icon={WarningIcon}
        isLoading={isLoading}
        comment={
          <div
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              stats && stats.at_risk > 0 ? "text-amber-500" : "text-secondary-foreground",
            )}
          >
            <ArrowRightIcon size={13} />
            Fragility 40–69
          </div>
        }
      />
    </div>
  );
}
