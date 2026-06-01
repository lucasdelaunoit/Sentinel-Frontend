import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge.tsx";

const FRAGILITY_COLORS_TIERS: Record<Severity, string> = {
  critical: "bg-danger",
  warning: "bg-warning",
  ok: "bg-success",
};

interface FragilityBadgeProps {
  fragility: MetricResult;
}

export default function FragilityBadge({ fragility }: FragilityBadgeProps) {
  return <Badge className={FRAGILITY_COLORS_TIERS[fragility.severity]}>{fragility.value}</Badge>;
}

FragilityBadge.Skeleton = function FragilityBadgeSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-16" : "h-5 w-20")} />;
};
