import { cn } from "@/lib/utils.ts";

type DurationSeverity = "info" | "warning" | "danger";

const SEVERITY_STYLE: Record<DurationSeverity, string> = {
  info: "bg-info-foreground text-info",
  warning: "bg-warning-foreground text-warning",
  danger: "bg-danger-foreground text-danger",
};

function durationSeverity(days: number): DurationSeverity {
  if (days <= 3) return "info";
  if (days <= 7) return "warning";
  return "danger";
}

interface DurationBadgeProps {
  days: number;
  className?: string;
}

export default function DurationBadge({ days, className }: DurationBadgeProps) {
  const severity = durationSeverity(days);
  return (
    <span
      className={cn(
        "rounded-md px-2.5 py-1.5 text-[13px] font-bold tabular-nums leading-none",
        SEVERITY_STYLE[severity],
        className,
      )}
    >
      {days}d
    </span>
  );
}
