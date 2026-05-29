import { cn } from "@/lib/utils.ts";

interface DurationBadgeProps {
  days: number;
  className?: string;
}

export default function DurationBadge({ days, className }: DurationBadgeProps) {
  return (
    <span className={cn("rounded-md px-3 py-1.5 text-[13px] font-bold tabular-nums bg-border", className)}>
      {days}d
    </span>
  );
}
