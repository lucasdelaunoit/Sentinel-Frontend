import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";
import { formatDelta } from "@/utils/formatters/number.ts";

interface MetricBoxProps {
  label: string;
  before: number;
  after: number;
  delta?: number;
  worseWhen?: "up" | "down";
  suffix?: string;
}

export default function MetricBox({ label, before, after, delta, worseWhen = "down", suffix = "" }: MetricBoxProps) {
  const resolvedDelta = delta ?? after - before;
  const worse = worseWhen === "up" ? resolvedDelta > 0 : resolvedDelta < 0;
  const better = worseWhen === "up" ? resolvedDelta < 0 : resolvedDelta > 0;
  const chipTone = worse
    ? "bg-danger text-background"
    : better
      ? "bg-success text-background"
      : "bg-muted text-muted-foreground";

  return (
    <div className="rounded-lg bg-muted/40 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 flex items-center gap-1.5 text-[14px] font-bold tabular-nums">
        <span className="text-muted-foreground">
          {before}
          {suffix}
        </span>
        <ArrowRight className="size-3 text-muted-foreground/50" />
        <span className={cn(worse && "text-danger", better && "text-success")}>
          {after}
          {suffix}
        </span>
        {resolvedDelta !== 0 && (
          <span className={cn("ml-auto rounded px-1.5 py-0.5 text-[10px] font-bold", chipTone)}>
            {formatDelta(resolvedDelta)}
            {suffix}
          </span>
        )}
      </p>
    </div>
  );
}

MetricBox.Skeleton = function MetricBoxSkeleton() {
  return <Skeleton className="h-12 w-full rounded-lg" />;
};
