import { cn } from "@/lib/utils";
import type { PlanningUser, SimBlock } from "@/types/planning";
import {
  CAPACITY_ROW_HEIGHT,
  DAY_COL_WIDTH,
  NAME_COL_WIDTH,
} from "@/utils/planning/calendar";
import { isOnRealLeave, isOnSimLeave } from "@/utils/planning/leaves";
import { capacityToneClass } from "@/utils/planning/theme";

interface PlanningCapacityStripProps {
  days: number[];
  users: PlanningUser[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  isClosedDay: (d: number) => boolean;
}

export default function PlanningCapacityStrip({
  days,
  users,
  simBlocks,
  viewYear,
  viewMonth,
  isClosedDay,
}: PlanningCapacityStripProps) {
  const total = users.length;

  function availability(day: number): number {
    if (isClosedDay(day)) return -1;
    if (total === 0) return 0;
    const absent = users.filter(
      (u) =>
        isOnRealLeave(u, day, viewYear, viewMonth) || isOnSimLeave(u.id, day, simBlocks, viewYear, viewMonth),
    ).length;
    return (total - absent) / total;
  }

  return (
    <div className="flex border-b border-border/40">
      <div
        className="shrink-0 sticky left-0 z-20 bg-card border-r border-border/40 flex items-center px-5"
        style={{ width: NAME_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
      >
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
          Capacity
        </span>
      </div>
      <div className="flex" style={{ width: days.length * DAY_COL_WIDTH }}>
        {days.map((d) => {
          const ratio = availability(d);
          const closed = ratio === -1;
          return (
            <div
              key={d}
              className={cn(
                "border-r border-border/10 last:border-r-0 flex flex-col items-center justify-end pb-1 gap-1",
                closed && "bg-muted/40",
              )}
              style={{ width: DAY_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
            >
              {!closed && (
                <>
                  <div
                    className={cn("rounded-sm w-[18px] transition-all", capacityToneClass(ratio))}
                    style={{ height: Math.max(3, Math.round(ratio * 18)) }}
                    title={`${Math.round(ratio * 100)}% available`}
                  />
                  <span className="text-[7px] font-medium text-muted-foreground/50">
                    {Math.round(ratio * 100)}
                  </span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
