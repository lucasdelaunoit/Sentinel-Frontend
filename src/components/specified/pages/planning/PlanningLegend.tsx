import { cn } from "@/lib/utils";
import { ABSENCE_THEME } from "@/utils/planning/theme";
import { ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";

interface PlanningLegendProps {
  variant?: "row" | "stack";
  showSimulation?: boolean;
  showToday?: boolean;
  holidayText?: string;
  className?: string;
}

export default function PlanningLegend({
  variant = "row",
  showSimulation = false,
  showToday = false,
  holidayText,
  className,
}: PlanningLegendProps) {
  return (
    <div
      className={cn(
        variant === "row"
          ? "flex flex-wrap items-center gap-5 px-5 py-3 border-t border-border/60 bg-muted/10"
          : "flex flex-col gap-2",
        className,
      )}
    >
      {ABSENCE_TYPE_VALUES.map((t) => {
        const meta = ABSENCE_THEME[t];
        return (
          <div key={t} className="flex items-center gap-2">
            <span className={cn("size-2 rounded-full", meta.dot)} />
            <span className="text-[11px] text-muted-foreground">{meta.label}</span>
          </div>
        );
      })}
      {showSimulation && (
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded border-2 border-dashed border-planned bg-planned/15" />
          <span className="text-[11px] text-muted-foreground">Simulation block · drag to adjust</span>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        <div className="size-3 rounded bg-muted" />
        <span className="text-[11px] text-muted-foreground">Weekend / Holiday</span>
      </div>
      {showToday && (
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded bg-primary/10 border border-primary/30" />
          <span className="text-[11px] text-muted-foreground">Today</span>
        </div>
      )}
      {holidayText && <span className="text-[10px] text-muted-foreground/60 ml-auto truncate">{holidayText}</span>}
    </div>
  );
}
