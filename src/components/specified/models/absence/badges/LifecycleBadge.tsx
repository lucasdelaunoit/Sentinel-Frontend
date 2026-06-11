import { type AbsenceLifecycle } from "@/utils/absence/lifecycle.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";
import { type Tone, TONE_SOLID_BADGE } from "@/lib/theme/tone.ts";

interface LifecycleBadgeProps {
  lifecycle: AbsenceLifecycle;
  className?: string;
}

const LIFECYCLE_TONE: Record<AbsenceLifecycle, Tone> = {
  upcoming: "warning",
  ongoing: "success",
  past: "neutral",
};

export default function LifecycleBadge({ lifecycle, className }: LifecycleBadgeProps) {
  return <Badge className={cn(TONE_SOLID_BADGE[LIFECYCLE_TONE[lifecycle]], className)}>{capitalize(lifecycle)}</Badge>;
}
