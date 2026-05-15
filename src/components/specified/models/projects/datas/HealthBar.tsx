import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  value?: number | null;
  empty?: ReactNode;
  error?: ReactNode;
}

function healthColor(v: number) {
  if (v >= 75) return "bg-success";
  if (v >= 55) return "bg-warning";
  return "bg-danger";
}

function healthTextColor(v: number) {
  if (v >= 75) return "text-success";
  if (v >= 55) return "text-warning";
  return "text-danger";
}

export default function HealthBar({ value, empty = "—", error }: HealthBarProps) {
  if (error) {
    return (
      <div className="flex items-center gap-2.5 min-w-[100px]">
        <span className="text-[12px] font-medium text-destructive">{error}</span>
      </div>
    );
  }

  if (value == null) {
    return (
      <div className="flex items-center gap-2.5 min-w-[100px]">
        <span className="text-[12px] font-medium text-muted-foreground">{empty}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="h-1.5 flex-1 rounded-full bg-muted shadow-inner overflow-hidden">
        <div className={cn("h-full rounded-full shadow-sm", healthColor(value))} style={{ width: `${value}%` }} />
      </div>
      <span className={cn("text-[12px] font-semibold tabular-nums w-8 text-right", healthTextColor(value))}>
        {value}
      </span>
    </div>
  );
}

HealthBar.Skeleton = function HealthBarSkeleton() {
  return (
    <div className="flex items-center gap-2.5 min-w-[100px]">
      <Skeleton className="h-1.5 flex-1 rounded-full" />
      <Skeleton className="h-3 w-8" />
    </div>
  );
};
