import { type ReactNode, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  event?: T;
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
    const hit = events.find((e) => {
      const { start, end } = getRange(e);
      const s = new Date(start).setHours(0, 0, 0, 0);
      const eTs = new Date(end).setHours(23, 59, 59, 999);
      return ts >= s && ts <= eTs;
    });
    cells.push({ date: new Date(d), inMonth: d.getMonth() === month, event: hit });
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
            <ChevronLeft className="size-4" />
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
            <ChevronRight className="size-4" />
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
            const hasEvent = !!cell.event;
            const eventClass = hasEvent && getCellClassName ? getCellClassName(cell.event as T) : undefined;
            const dayClass = !hasEvent && cell.inMonth && getDayClassName ? getDayClassName(cell.date) : undefined;

            return (
              <button
                key={hasEvent ? `${getKey(cell.event as T)}-${i}` : i}
                disabled={!hasEvent}
                onClick={() => cell.event && onEventClick?.(cell.event)}
                className={cn(
                  "h-full w-full rounded-lg flex items-center justify-center text-[12px] font-medium transition-all",
                  !cell.inMonth && "text-muted-foreground/30",
                  cell.inMonth && !hasEvent && !dayClass && "text-foreground/80",
                  hasEvent && !eventClass && "text-background bg-success border border-success cursor-pointer",
                  hasEvent && !eventClass && !cell.inMonth && "opacity-40",
                  hasEvent && eventClass && cn("cursor-pointer", eventClass),
                  dayClass,
                  isToday && "ring-2 ring-primary font-bold",
                )}
              >
                {cell.date.getDate()}
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
