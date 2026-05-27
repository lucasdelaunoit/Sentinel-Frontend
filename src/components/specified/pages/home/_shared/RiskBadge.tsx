import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { TONE_TEXT, TONE_SOFT_BG, TONE_SOFT_BORDER } from "@/lib/scoring.ts";
import { RISK_LABEL, RISK_TONE, type RiskLevel } from "@/data/dashboard.ts";

interface RiskBadgeProps {
  level: RiskLevel;
  /** Optional numeric score rendered alongside the label. */
  score?: number;
  size?: "sm" | "md";
}

export default function RiskBadge({ level, score, size = "md" }: RiskBadgeProps) {
  const tone = RISK_TONE[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-semibold uppercase tracking-wide",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        TONE_SOFT_BG[tone],
        TONE_SOFT_BORDER[tone],
        TONE_TEXT[tone],
      )}
    >
      {RISK_LABEL[level]}
      {score != null && <span className="font-bold tabular-nums opacity-70">{score}</span>}
    </span>
  );
}

RiskBadge.Skeleton = function RiskBadgeSkeleton({ size = "md" }: Pick<RiskBadgeProps, "size">) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-14" : "h-5 w-16")} />;
};
