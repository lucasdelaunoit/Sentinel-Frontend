import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { TONE_SOFT_BORDER, RISK_TONE, type Tone, type RiskLevel } from "@/lib/scoring.ts";
import { Badge } from "@/components/ui/badge.tsx";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const TONE_SOFT_BG: Record<Tone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export default function RiskBadge({ level }: RiskBadgeProps) {
  const tone = RISK_TONE[level];
  return (
    <Badge className={cn(TONE_SOFT_BG[tone], TONE_SOFT_BORDER[tone], "text-background")}>{RISK_LABEL[level]}</Badge>
  );
}

RiskBadge.Skeleton = function RiskBadgeSkeleton({ size = "md" }: Pick<RiskBadgeProps, "size">) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-14" : "h-5 w-16")} />;
};
