import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { TONE_BG, TONE_SOFT_BORDER } from "@/lib/theme/tone.ts";
import { RISK_LABEL, RISK_TONE, type RiskLevel } from "@/lib/theme/riskLevel.ts";
import { Badge } from "@/components/ui/badge.tsx";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const tone = RISK_TONE[level];
  return (
    <Badge className={cn(TONE_BG[tone], TONE_SOFT_BORDER[tone], "text-background")}>{RISK_LABEL[level]}</Badge>
  );
}

RiskBadge.Skeleton = function RiskBadgeSkeleton({ size = "md" }: Pick<RiskBadgeProps, "size">) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-14" : "h-5 w-16")} />;
};
