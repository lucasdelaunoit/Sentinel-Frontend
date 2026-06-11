import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { SEVERITY_BG } from "@/lib/theme/severity.ts";

interface FragilityBadgeProps {
  fragility: MetricResult;
}

export default function FragilityBadge({ fragility }: FragilityBadgeProps) {
  return <Badge className={SEVERITY_BG[fragility.severity]}>{fragility.value}</Badge>;
}

FragilityBadge.Skeleton = function FragilityBadgeSkeleton({ size = "md" }: { size?: "sm" | "md" }) {
  return <Skeleton className={cn("rounded-md", size === "sm" ? "h-4 w-16" : "h-5 w-20")} />;
};
