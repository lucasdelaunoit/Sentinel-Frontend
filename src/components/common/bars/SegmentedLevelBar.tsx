import { cn } from "@/lib/utils";

export type SegmentedLevelSeverity = "ok" | "warning" | "critical" | "neutral";

const FILL_COLOR: Record<SegmentedLevelSeverity, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  critical: "bg-danger",
  neutral: "bg-primary",
};

interface SegmentedLevelBarProps {
  /** Current value (e.g. 3). */
  value: number;
  /** Maximum value of the scale (e.g. 5). */
  max: number;
  /** Total bar segments drawn. Defaults to `max * 2` for a denser look. */
  segments?: number;
  /** Severity override. If omitted, auto-derived from `value / max` (>=0.7 ok, >=0.4 warning, else critical). */
  severity?: SegmentedLevelSeverity;
  /** Empty-segment color. Default `bg-border`. */
  emptyClassName?: string;
  className?: string;
}

function autoSeverity(value: number, max: number): SegmentedLevelSeverity {
  if (max <= 0) return "neutral";
  const ratio = value / max;
  if (ratio >= 0.7) return "ok";
  if (ratio >= 0.4) return "warning";
  return "critical";
}

export default function SegmentedLevelBar({
  value,
  max,
  segments,
  severity,
  emptyClassName = "bg-border",
  className,
}: SegmentedLevelBarProps) {
  const total = segments ?? Math.max(1, max * 2);
  const sev = severity ?? autoSeverity(value, max);
  const filled = max > 0 ? Math.round((value / max) * total) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={cn("h-1.5 flex-1 rounded-sm transition-colors", i < filled ? FILL_COLOR[sev] : emptyClassName)}
          />
        ))}
      </div>
    </div>
  );
}
