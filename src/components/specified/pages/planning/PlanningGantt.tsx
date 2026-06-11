import { type Dispatch, type SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { usePlanningCalendar } from "@/hooks/usePlanningCalendar";
import { useGanttGestures } from "@/hooks/useGanttGestures";
import {
  CAPACITY_ROW_HEIGHT,
  DAY_COL_WIDTH,
  MONTH_NAMES,
  NAME_COL_WIDTH,
  ROW_HEIGHT,
  getDaysInMonth,
  getFirstDayOfWeek,
  makeDateStr,
  toX,
} from "@/utils/planning/calendar";
import PlanningCapacityStrip from "./PlanningCapacityStrip";
import PlanningLegend from "./PlanningLegend";
import GanttHeader from "./GanttHeader";
import GanttEmployeeRow from "./GanttEmployeeRow";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { PlusIcon } from "@phosphor-icons/react";

interface PlanningGanttProps {
  mode: PlanningMode;
  users: PlanningUser[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  setSimBlocks: Dispatch<SetStateAction<SimBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  onCreateBlock: (empId: string, startDate: string, startHalf: Half, endDate: string, endHalf: Half) => void;
  onOpenAddSheet: () => void;
  navigateMonth: (delta: number) => void;
  onSelectAbsence: (userId: string, absenceId: number) => void;
  perUserImpact: Record<string, UserImpact>;
  perDayLoad?: DayLoad[];
}

/** Title-bar action shared by the live card and its skeleton, so month nav + Add absence
 *  stay visible (and usable) while a new month loads. */
function PlanningCardAction({
  mode,
  viewYear,
  viewMonth,
  navigateMonth,
  onOpenAddSheet,
}: {
  mode: PlanningMode;
  viewYear: number;
  viewMonth: number;
  navigateMonth: (delta: number) => void;
  onOpenAddSheet: () => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <div className="flex items-center text-muted-foreground">
        <Button size="icon" variant="ghost" onClick={() => navigateMonth(-1)}>
          <CaretLeftIcon className="size-4" />
        </Button>
        <span className="text-[13px] font-semibold text-foreground min-w-[85px] text-center">
          {MONTH_NAMES[viewMonth - 1]} {viewYear}
        </span>
        <Button size="icon" variant="ghost" onClick={() => navigateMonth(1)}>
          <CaretRightIcon className="size-4" />
        </Button>
      </div>
      {mode === "simulate" && (
        <Button className="bg-planned hover:bg-planned/80" onClick={onOpenAddSheet}>
          <PlusIcon weight="bold" />
          Add absence
        </Button>
      )}
    </div>
  );
}

export default function PlanningGantt({
  mode,
  users,
  simBlocks,
  viewYear,
  viewMonth,
  setSimBlocks,
  selectedBlockId,
  setSelectedBlockId,
  onCreateBlock,
  onOpenAddSheet,
  navigateMonth,
  onSelectAbsence,
  perUserImpact,
  perDayLoad,
}: PlanningGanttProps) {
  const { isClosedDay, holidays, holidayByDay } = usePlanningCalendar(viewYear, viewMonth);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalDaysWidth = daysInMonth * DAY_COL_WIDTH;

  const today = new Date();
  const todayInView = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? today.getDate() : null;

  const todayStr = makeDateStr(today.getFullYear(), today.getMonth() + 1, today.getDate());
  let firstFutureDay = daysInMonth + 1;
  for (let d = 1; d <= daysInMonth; d++) {
    if (makeDateStr(viewYear, viewMonth, d) > todayStr) {
      firstFutureDay = d;
      break;
    }
  }

  const { dragState, drawState, startDrag, startDraw } = useGanttGestures({
    mode,
    users,
    simBlocks,
    setSimBlocks,
    selectedBlockId,
    setSelectedBlockId,
    onCreateBlock,
    viewYear,
    viewMonth,
    daysInMonth,
    firstFutureDay,
    isClosedDay,
  });

  const holidayText = holidays.length
    ? holidays.map((h) => `${MONTH_NAMES[viewMonth - 1].slice(0, 3)} ${h.day} (${h.label})`).join(" · ")
    : undefined;

  return (
    <ComposedCard
      title="Planning"
      action={
        <PlanningCardAction
          mode={mode}
          viewYear={viewYear}
          viewMonth={viewMonth}
          navigateMonth={navigateMonth}
          onOpenAddSheet={onOpenAddSheet}
        />
      }
      className="p-0"
      headerClassName="px-6 pt-4"
    >
      {mode === "simulate" && (
        <div className="flex items-center gap-1.5 px-6 py-2 text-[11px] font-medium text-planned border-b border-border/40 bg-planned/5">
          <PlusIcon weight="bold" className="size-3" />
          <span>
            Drag across future days on a person&apos;s row to simulate an absence. Today and past days are locked.
          </span>
        </div>
      )}
      <div
        className="overflow-x-auto select-none"
        style={{ cursor: dragState ? "grabbing" : drawState ? "crosshair" : "default" }}
      >
        <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
          <GanttHeader
            days={days}
            firstDayOfWeek={firstDayOfWeek}
            totalDaysWidth={totalDaysWidth}
            isClosedDay={isClosedDay}
            holidayByDay={holidayByDay}
            todayDay={todayDay}
          />

          <PlanningCapacityStrip
            days={days}
            users={users}
            simBlocks={simBlocks}
            viewYear={viewYear}
            viewMonth={viewMonth}
            isClosedDay={isClosedDay}
            perDayLoad={perDayLoad}
          />

          {users.map((emp) => (
            <GanttEmployeeRow
              key={emp.id}
              emp={emp}
              mode={mode}
              viewYear={viewYear}
              viewMonth={viewMonth}
              days={days}
              daysInMonth={daysInMonth}
              firstFutureDay={firstFutureDay}
              todayDay={todayDay}
              totalDaysWidth={totalDaysWidth}
              isClosedDay={isClosedDay}
              simBlocks={simBlocks}
              dragState={dragState}
              drawState={drawState}
              selectedBlockId={selectedBlockId}
              impact={mode === "simulate" ? perUserImpact[emp.id]?.severity : undefined}
              startDraw={startDraw}
              startDrag={startDrag}
              onSelectAbsence={onSelectAbsence}
            />
          ))}
        </div>
      </div>

      <PlanningLegend
        variant="row"
        showSimulation={mode === "simulate"}
        showToday={todayDay !== null}
        holidayText={holidayText}
      />
    </ComposedCard>
  );
}

const CLOSED_DAY_STYLE = {
  backgroundColor: "color-mix(in srgb, var(--muted) 35%, transparent)",
  backgroundImage:
    "repeating-linear-gradient(45deg, transparent 0 5px, color-mix(in srgb, var(--muted-foreground) 9%, transparent) 5px 6px)",
} as const;

PlanningGantt.Skeleton = function PlanningGanttSkeleton({
  mode,
  viewYear,
  viewMonth,
  navigateMonth,
  onOpenAddSheet,
  rows = 6,
}: {
  mode: PlanningMode;
  viewYear: number;
  viewMonth: number;
  navigateMonth: (delta: number) => void;
  onOpenAddSheet: () => void;
  rows?: number;
}) {
  const { isClosedDay } = usePlanningCalendar(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalDaysWidth = daysInMonth * DAY_COL_WIDTH;

  return (
    <ComposedCard
      title="Planning"
      action={
        <PlanningCardAction
          mode={mode}
          viewYear={viewYear}
          viewMonth={viewMonth}
          navigateMonth={navigateMonth}
          onOpenAddSheet={onOpenAddSheet}
        />
      }
      className="p-0"
      headerClassName="px-6 pt-4"
    >
      <div className="overflow-x-auto">
        <div style={{ minWidth: NAME_COL_WIDTH + totalDaysWidth }}>
          {/* Header — real dates, frame is known before data loads */}
          <GanttHeader
            days={days}
            firstDayOfWeek={firstDayOfWeek}
            totalDaysWidth={totalDaysWidth}
            isClosedDay={isClosedDay}
          />

          {/* Capacity strip */}
          <div className="flex border-b border-border/40 pt-1">
            <div
              className="shrink-0 sticky left-0 z-20 bg-card border-r border-border/40 flex items-center px-5"
              style={{ width: NAME_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
            >
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">Capacity</span>
            </div>
            <div className="flex" style={{ width: totalDaysWidth }}>
              {days.map((d) => {
                const closed = isClosedDay(d);
                return (
                  <div
                    key={d}
                    className={cn(
                      "border-r border-border/10 last:border-r-0 flex flex-col items-center justify-end pb-1",
                      closed && "bg-muted/40",
                    )}
                    style={{ width: DAY_COL_WIDTH, height: CAPACITY_ROW_HEIGHT }}
                  >
                    {!closed && <Skeleton className="w-[18px]" style={{ height: 6 + ((d * 5) % 12) }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Employee rows */}
          {Array.from({ length: rows }).map((_, r) => {
            const barStart = 1 + ((r * 5) % Math.max(1, daysInMonth - 6));
            const barDays = 2 + (r % 4);
            return (
              <div key={r} className="flex border-b border-border/40 last:border-b-0" style={{ minHeight: ROW_HEIGHT }}>
                <div
                  className="shrink-0 sticky left-0 z-10 bg-card border-r border-border/40 flex items-center px-5 gap-2.5"
                  style={{ width: NAME_COL_WIDTH }}
                >
                  <UserAvatar.Skeleton />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <div className="relative" style={{ width: totalDaysWidth, height: ROW_HEIGHT }}>
                  {days.map((d) =>
                    isClosedDay(d) ? (
                      <div
                        key={d}
                        className="absolute inset-y-0 pointer-events-none"
                        style={{ left: toX(d), width: DAY_COL_WIDTH, ...CLOSED_DAY_STYLE }}
                      />
                    ) : null,
                  )}
                  {days.map((d) => (
                    <div
                      key={`b${d}`}
                      className="absolute inset-y-0 border-r border-border/10 pointer-events-none"
                      style={{ left: toX(d) + DAY_COL_WIDTH - 1, width: 1 }}
                    />
                  ))}
                  <Skeleton
                    className="absolute rounded-xl"
                    style={{ left: toX(barStart) + 2, width: DAY_COL_WIDTH * barDays - 4, top: 10, height: 34 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ComposedCard>
  );
};
