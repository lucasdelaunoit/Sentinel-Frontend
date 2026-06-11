import { type ReactNode, useMemo, useState } from "react";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { cn } from "@/lib/utils.ts";

/* ─── Constants ──────────────────────────────────────────── */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/* ─── Types ──────────────────────────────────────────────── */

interface MediumCalendarProps<T> {
  events: T[];
  getKey: (event: T) => string | number;
  getRange: (event: T) => { start: string | Date; end: string | Date };
  getCellClassName?: (event: T) => string;
  getDayClassName?: (date: Date) => string | undefined;
  getDayCoverage?: (event: T, date: Date) => "full" | "morning" | "afternoon";
  onEventClick?: (event: T) => void;
  initialMonth?: Date;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
  footer?: ReactNode;
}

interface DayCell<T> {
  date: Date;
  inMonth: boolean;
  events: T[];
}

/* ─── Grid build ─────────────────────────────────────────── */

function buildMonthGrid<T>(
  year: number,
  month: number,
  events: T[],
  getRange: (e: T) => { start: string | Date; end: string | Date },
): DayCell<T>[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells: DayCell<T>[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const ts = d.setHours(12, 0, 0, 0);
    // Keep every event covering the day — a single day may hold two half-day events.
    const hits = events.filter((e) => {
      const { start, end } = getRange(e);
      const s = new Date(start).setHours(0, 0, 0, 0);
      const eTs = new Date(end).setHours(23, 59, 59, 999);
      return ts >= s && ts <= eTs;
    });
    cells.push({ date: new Date(d), inMonth: d.getMonth() === month, events: hits });
  }
  return cells;
}

/* ─── Component ──────────────────────────────────────────── */

export default function MediumCalendar<T>({
  events,
  getKey,
  getRange,
  getCellClassName,
  getDayClassName,
  getDayCoverage,
  onEventClick,
  initialMonth,
  month,
  onMonthChange,
  className,
  footer,
}: MediumCalendarProps<T>) {
  const today = new Date();
  const [internalCursor, setInternalCursor] = useState(
    () => initialMonth ?? new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const cursor = month ?? internalCursor;

  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth(), events, getRange),
    [cursor, events, getRange],
  );

  const todayTs = new Date().setHours(0, 0, 0, 0);

  function setCursor(next: Date) {
    if (onMonthChange) onMonthChange(next);
    else setInternalCursor(next);
  }

  function shift(delta: number) {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  return (
    <ComposedCard
      title={
        <span className="text-[14px] font-semibold tabular-nums">
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
      }
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            className="size-7 cursor-pointer rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Previous month"
          >
            <CaretLeftIcon className="size-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            className="size-7 cursor-pointer rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Next month"
          >
            <CaretRightIcon className="size-4" />
          </button>
        </div>
      }
      headerClassName="mb-3"
      className={cn("h-full", className)}
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-1.5 flex-1 min-h-[200px]">
          {cells.map((cell, i) => {
            const isToday = cell.date.setHours(0, 0, 0, 0) === todayTs;
            const dayEvents = cell.events;
            const hasEvent = dayEvents.length > 0;
            const coverageOf = (e: T) => (getDayCoverage ? getDayCoverage(e, cell.date) : "full");

            // Owner of each half — may be two different absences on the same day.
            const morningEvent = dayEvents.find((e) => coverageOf(e) !== "afternoon");
            const afternoonEvent = dayEvents.find((e) => coverageOf(e) !== "morning");
            const isSplit = !!morningEvent && !!afternoonEvent && morningEvent !== afternoonEvent;

            // Two distinct half-day absences → render as two separate blocks with a gap.
            if (isSplit) {
              return (
                <div
                  key={`split-${i}`}
                  className={cn("relative flex h-full w-full gap-1", isToday && "rounded-lg ring-2 ring-primary")}
                >
                  <button
                    onClick={() => onEventClick?.(morningEvent)}
                    aria-label="Morning absence"
                    className={cn(
                      "h-full flex-1 rounded-md bg-success cursor-pointer transition-all hover:brightness-110",
                      !cell.inMonth && "opacity-40",
                    )}
                  />
                  <button
                    onClick={() => onEventClick?.(afternoonEvent)}
                    aria-label="Afternoon absence"
                    className={cn(
                      "h-full flex-1 rounded-md bg-success cursor-pointer transition-all hover:brightness-110",
                      !cell.inMonth && "opacity-40",
                    )}
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full bg-background text-[11px] font-semibold leading-none text-foreground ring-1 ring-success",
                        isToday && "font-bold",
                      )}
                    >
                      {cell.date.getDate()}
                    </span>
                  </span>
                </div>
              );
            }

            const event = morningEvent ?? afternoonEvent;
            const eventClass = event && getCellClassName ? getCellClassName(event) : undefined;
            const dayClass = !hasEvent && cell.inMonth && getDayClassName ? getDayClassName(cell.date) : undefined;
            const coverage = event ? coverageOf(event) : "full";
            // Default fill (no custom eventClass) renders a lone half-day as a split cell.
            const defaultFill = hasEvent && !eventClass;
            const isHalf = defaultFill && coverage !== "full";

            return (
              <button
                key={event ? `${getKey(event)}-${i}` : i}
                disabled={!hasEvent}
                onClick={() => event && onEventClick?.(event)}
                className={cn(
                  "relative h-full w-full overflow-hidden rounded-lg flex items-center justify-center text-[12px] font-medium transition-all",
                  !cell.inMonth && "text-muted-foreground/30",
                  cell.inMonth && !hasEvent && !dayClass && "text-foreground/80",
                  defaultFill && !isHalf && "text-background bg-success border border-success cursor-pointer",
                  defaultFill && isHalf && "text-foreground bg-success/15 border border-success cursor-pointer",
                  defaultFill && !cell.inMonth && "opacity-40",
                  hasEvent && eventClass && cn("cursor-pointer", eventClass),
                  dayClass,
                  isToday && "ring-2 ring-primary font-bold",
                )}
              >
                {isHalf && (
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 w-1/2 bg-success", coverage === "morning" ? "left-0" : "right-0")}
                  />
                )}
                <span className="relative">{cell.date.getDate()}</span>
              </button>
            );
          })}
        </div>
        {footer && <div className="mt-3 pt-3 border-t border-border/40">{footer}</div>}
      </div>
    </ComposedCard>
  );
}

/* ─── Skeleton ───────────────────────────────────────────── */

MediumCalendar.Skeleton = function MediumCalendarSkeleton({ className }: { className?: string }) {
  return (
    <ComposedCard
      title={<Skeleton className="h-5 w-32" />}
      action={<Skeleton className="h-7 w-20 rounded-md" />}
      headerClassName="mb-3"
      className={cn("h-full", className)}
    >
      <div className="grid grid-cols-7 grid-rows-6 gap-1.5 h-full min-h-[200px]">
        {Array.from({ length: 42 }).map((_, i) => (
          <Skeleton key={i} className="h-full w-full rounded-md" />
        ))}
      </div>
    </ComposedCard>
  );
};
