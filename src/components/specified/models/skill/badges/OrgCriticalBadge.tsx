import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";

/** Marks a skill flagged as critical for the organization (`is_critical_for_org`). */
export default function OrgCriticalBadge({ className }: { className?: string }) {
  return (
    <Badge variant="secondary" className={cn("bg-border", className)}>
      Org-critical
    </Badge>
  );
}
