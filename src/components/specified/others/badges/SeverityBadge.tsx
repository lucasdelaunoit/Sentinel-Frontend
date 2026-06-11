import { cn } from "@/lib/utils.ts";
import { SEVERITY_BADGE, SEVERITY_LABEL } from "@/lib/theme/severity.ts";

interface SeverityBadgeProps {
  severity: Severity;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export default function SeverityBadge({ severity, className, size = "sm" }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        SEVERITY_BADGE[severity],
        className,
      )}
    >
      <span>{SEVERITY_LABEL[severity]}</span>
    </span>
  );
}
