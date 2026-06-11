import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getTrajectoryTier } from "@/lib/theme/scoring";
import { TONE_TEXT, TONE_SOFT_BG, TONE_SOFT_BORDER } from "@/lib/theme/tone.ts";

interface TrajectoryBadgeProps {
  value?: number | null;
  empty?: ReactNode;
  error?: ReactNode;
  showScore?: boolean;
  size?: "sm" | "md";
}

export default function TrajectoryBadge({
  value,
  empty = "—",
  error,
  showScore = true,
  size = "md",
}: TrajectoryBadgeProps) {
  if (error) {
    return <span className="text-[12px] font-medium text-destructive">{error}</span>;
  }
  if (value == null) {
    return <span className="text-[12px] font-medium text-muted-foreground">{empty}</span>;
  }
  const tier = getTrajectoryTier(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        TONE_SOFT_BG[tier.tone],
        TONE_SOFT_BORDER[tier.tone],
        TONE_TEXT[tier.tone],
      )}
    >
      {tier.label}
      {showScore && (
        <span className="font-bold tabular-nums opacity-70">{value}</span>
      )}
    </span>
  );
}

TrajectoryBadge.Skeleton = function TrajectoryBadgeSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-16" : "h-5 w-20")} />;
};
