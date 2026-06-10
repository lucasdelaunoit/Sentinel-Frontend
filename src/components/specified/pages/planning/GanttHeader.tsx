import { cn } from "@/lib/utils";
import { DAY_COL_WIDTH, NAME_COL_WIDTH, getDayLabel } from "@/utils/planning/calendar";

interface GanttHeaderProps {
  days: number[];
  firstDayOfWeek: number;
  totalDaysWidth: number;
  isClosedDay: (day: number) => boolean;
  /** Live-card only — drives holiday tooltips/strikethrough. Omitted by the skeleton. */
  holidayByDay?: Map<number, string>;
  /** Live-card only — highlights the current day column. Omitted by the skeleton. */
  todayDay?: number | null;
}

/** The Gantt day-column header. Shared by the live card and its skeleton; holiday/today
 *  decorations only render when the corresponding props are provided. */
export default function GanttHeader({
  days,
  firstDayOfWeek,
  totalDaysWidth,
  isClosedDay,
  holidayByDay,
  todayDay = null,
}: GanttHeaderProps) {
  return (
    <div className="flex border-b border-border/60 bg-muted">
      <div
        className="shrink-0 sticky left-0 z-20 bg-muted border-r border-border/40 flex items-end px-5 pb-2 pt-3"
        style={{ width: NAME_COL_WIDTH }}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Employee</span>
      </div>
      <div className="flex" style={{ width: totalDaysWidth }}>
        {days.map((d) => {
          const closed = isClosedDay(d);
          const holiday = holidayByDay?.get(d);
          const isToday = d === todayDay;
          return (
            <div
              key={d}
              className={cn(
                "flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 pb-1.5 pt-2 relative",
                closed && "bg-muted/40",
              )}
              style={{ width: DAY_COL_WIDTH }}
              title={holiday}
            >
              {isToday && <div className="absolute top-0 inset-x-0 h-0.5 bg-primary rounded-b" />}
              <span
                className={cn(
                  "text-[9px] font-medium leading-none",
                  closed
                    ? "text-muted-foreground/30"
                    : isToday
                      ? "text-primary font-bold"
                      : "text-muted-foreground/60",
                )}
              >
                {getDayLabel(d, firstDayOfWeek)}
              </span>
              <span
                className={cn(
                  "text-[11px] font-bold leading-snug",
                  closed ? "text-muted-foreground/30" : isToday ? "text-primary" : "text-foreground/70",
                  holiday && "line-through",
                )}
              >
                {d}
              </span>
              <div className="flex w-full px-px mt-0.5">
                <div className="flex-1 text-center text-[7px] text-muted-foreground/30">am</div>
                <div className="w-px self-stretch bg-border/20" />
                <div className="flex-1 text-center text-[7px] text-muted-foreground/30">pm</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
