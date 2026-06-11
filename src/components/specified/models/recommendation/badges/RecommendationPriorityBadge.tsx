import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";
import { type Tone, TONE_SOLID_BADGE } from "@/lib/theme/tone.ts";

type RecommendationPriority = "high" | "medium" | "low";

interface RecommendationPriorityBadgeProps {
  priority: RecommendationPriority;
  className?: string;
}

const PRIORITY_TONE: Record<RecommendationPriority, Tone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

export default function RecommendationPriorityBadge({ priority, className }: RecommendationPriorityBadgeProps) {
  return <Badge className={cn(TONE_SOLID_BADGE[PRIORITY_TONE[priority]], className)}>{capitalize(priority)}</Badge>;
}
