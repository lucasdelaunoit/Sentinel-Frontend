import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_BADGE, SEVERITY_LABEL } from "@/lib/theme/severity.ts";

interface SeverityBadgeProps {
  severity: Severity;
  /** Overrides the default severity label (Safe / Warning / Critical). */
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function SeverityBadge({ severity, label, className, size = "sm" }: SeverityBadgeProps) {
  return (
    <Badge
      className={cn(
        "rounded-full font-semibold",
        size === "sm" ? "text-[10px]" : "h-auto px-2.5 py-1 text-[11px]",
        SEVERITY_BADGE[severity],
        className,
      )}
    >
      {label ?? SEVERITY_LABEL[severity]}
    </Badge>
  );
}
