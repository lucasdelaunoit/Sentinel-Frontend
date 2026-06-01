import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";

type RecommendationPriority = "high" | "medium" | "low";

interface RecommendationPriorityBadgeProps {
  priority: RecommendationPriority;
  className?: string;
}

const PRIORITY_STYLE: Record<RecommendationPriority, string> = {
  high: "text-background bg-danger",
  medium: "text-background bg-warning",
  low: "text-background bg-neutral",
};

export default function RecommendationPriorityBadge({ priority, className }: RecommendationPriorityBadgeProps) {
  return <Badge className={cn(PRIORITY_STYLE[priority], className)}>{capitalize(priority)}</Badge>;
}
