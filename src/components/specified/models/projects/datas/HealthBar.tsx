import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getTrajectoryTier } from "@/lib/theme/scoring";
import { TONE_BG, TONE_TEXT } from "@/lib/theme/tone.ts";

interface TrajectoryBarProps {
  value?: number | null;
  empty?: ReactNode;
  error?: ReactNode;
}

export default function HealthBar({ value, empty = "—", error }: TrajectoryBarProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2.5 min-w-[140px]">
        <span className="text-[12px] font-medium text-destructive">{error}</span>
      </div>
    );
  }

  if (value == null) {
    return (
      <div className="flex items-center gap-2.5 min-w-[140px]">
        <span className="text-[12px] font-medium text-muted-foreground">{empty}</span>
      </div>
    );
  }

  const tier = getTrajectoryTier(value);
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted shadow-inner overflow-hidden">
        <div className={cn("h-full rounded-full shadow-sm", TONE_BG[tier.tone])} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-[11px] font-semibold whitespace-nowrap", TONE_TEXT[tier.tone])}>
        {tier.label}
        <span className="ml-1 tabular-nums opacity-70">{value}</span>
      </span>
    </div>
  );
}

HealthBar.Skeleton = function TrajectoryBarSkeleton() {
  return (
    <div className="flex items-center gap-2.5 min-w-[140px]">
      <Skeleton className="h-1.5 flex-1 rounded-full" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
};
