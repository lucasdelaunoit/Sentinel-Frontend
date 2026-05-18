import { cn } from "@/lib/utils.ts";
import { ArrowRightIcon } from "@phosphor-icons/react";

export default function MetricRow({
  label,
  before,
  after,
  invertColors,
  suffix,
  flash,
}: {
  label: string;
  before: number;
  after: number;
  invertColors?: boolean;
  suffix?: string;
  flash?: boolean;
}) {
  const delta = after - before;
  const worsened = invertColors ? delta < 0 : delta > 0;
  const improved = invertColors ? delta > 0 : delta < 0;
  const deltaColor = delta === 0 ? "text-muted-foreground" : worsened ? "text-danger" : improved ? "text-success" : "";
  return (
    <div
      key={flash ? after : undefined}
      className={cn("flex flex-col gap-0.5 rounded-md px-1.5 -mx-1.5 py-0.5", flash && "value-flash-bg")}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xs text-muted-foreground tabular-nums">
          {before}
          {suffix}
        </span>
        <ArrowRightIcon className="text-muted-foreground" size={10} weight="bold" />
        <span className={cn("text-sm font-semibold tabular-nums inline-block", deltaColor, flash && "value-flash")}>
          {after}
          {suffix}
        </span>
      </div>
    </div>
  );
}
