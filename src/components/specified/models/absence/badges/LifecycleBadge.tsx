import { type AbsenceLifecycle } from "@/utils/absence/lifecycle.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { capitalize } from "@/utils/formatters/string.ts";
import { cn } from "@/lib/utils.ts";

interface LifecycleBadgeProps {
  lifecycle: AbsenceLifecycle;
  className?: string;
}

const LIFECYCLE_STYLE: Record<AbsenceLifecycle, string> = {
  upcoming: "text-background bg-warning",
  ongoing: "text-background bg-success",
  past: "text-background bg-neutral",
};

export default function LifecycleBadge({ lifecycle, className }: LifecycleBadgeProps) {
  return <Badge className={cn(LIFECYCLE_STYLE[lifecycle], className)}>{capitalize(lifecycle)}</Badge>;
}
