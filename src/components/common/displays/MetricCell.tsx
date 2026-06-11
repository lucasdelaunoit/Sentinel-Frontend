import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { SEVERITY_BG, SEVERITY_TEXT } from "@/lib/theme/severity.ts";

interface MetricCellProps {
  metric?: MetricResult | null;
  /** How to render `value_raw` next to the value: subtle inline number, parenthesized, or hidden. */
  raw?: "inline" | "paren" | "none";
  empty?: string;
}

/** Severity dot + tone-colored value, for metric columns in tables. */
export default function MetricCell({ metric, raw = "none", empty = "—" }: MetricCellProps) {
  if (!metric) return <span className="text-[13px] text-muted-foreground">{empty}</span>;
  return (
    <div className="flex items-center gap-1.5" title={metric.insight ?? undefined}>
      <div className={cn("size-1.5 rounded-full shrink-0 shadow-sm", SEVERITY_BG[metric.severity])} />
      <span className={cn("text-[13px] font-semibold whitespace-nowrap", SEVERITY_TEXT[metric.severity])}>
        {metric.value}
        {raw !== "none" && metric.value_raw != null && (
          <span className="ml-1 tabular-nums opacity-70">
            {raw === "paren" ? `(${metric.value_raw})` : metric.value_raw}
          </span>
        )}
      </span>
    </div>
  );
}

MetricCell.Skeleton = function MetricCellSkeleton() {
  return (
    <div className="flex items-center gap-1.5">
      <Skeleton className="size-1.5 rounded-full" />
      <Skeleton className="h-4 w-14" />
    </div>
  );
};
