import type { PropsWithChildren } from "react";
import type { Icon } from "@phosphor-icons/react";
import { type Tone, TONE_TEXT } from "@/lib/scoring.ts";
import { cn } from "@/lib/utils.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";

export type MetricTone = Tone | "neutral";

interface MetricRowProps {
  icon?: Icon;
  label: string;
  value: string | number;
  tone?: MetricTone;
}

function toneClass(tone: MetricTone) {
  return tone === "neutral" ? "text-foreground" : TONE_TEXT[tone];
}

/**
 * A single label → value row with optional leading icon and tone coloring.
 * Compose several inside `MetricRow.List` for a divided metric block.
 */
export default function MetricRow({ icon: Icon, label, value, tone = "neutral" }: MetricRowProps) {
  const colored = toneClass(tone);
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon className={cn("size-4", colored)} />}
        <span className="text-[12px] text-muted-foreground">{label}</span>
      </div>
      <span className={cn("text-[14px] font-bold tabular-nums", colored)}>{value}</span>
    </div>
  );
}

MetricRow.Skeleton = function MetricRowSkeleton({ icon }: Pick<MetricRowProps, "icon">) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div className="flex items-center gap-2.5">
        {icon && <Skeleton className="size-4 rounded" />}
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-8" />
    </div>
  );
};

/** Divided container for `MetricRow` items. `bordered` adds top/bottom rules. */
MetricRow.List = function MetricRowList({ children }: PropsWithChildren) {
  return <div className="divide-y divide-border">{children}</div>;
};
