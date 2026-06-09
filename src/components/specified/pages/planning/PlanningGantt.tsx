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
  countWorkingHalves,
  drawDisplayRange,
  getBlockDisplayRange,
  getDayLabel,
  getDaysInMonth,
  getFirstDayOfWeek,
  halvesLabel,
  makeDateStr,
  toX,
  workingSegments,
} from "@/utils/planning/calendar";
import { getViewLeaves } from "@/utils/planning/leaves";
import { absenceTheme, simColor } from "@/utils/planning/theme";
import PlanningCapacityStrip from "./PlanningCapacityStrip";
import PlanningLegend from "./PlanningLegend";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import { Skeleton } from "@/components/ui/skeleton";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Button } from "@/components/ui/button";
import { CaretLeftIcon, CaretRightIcon, ShieldWarningIcon, WarningIcon } from "@phosphor-icons/react";
import { PlusIcon } from "@phosphor-icons/react";
import { GripVertical } from "lucide-react";

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

  // Simulated absences are future-only: first day in this view strictly after today.
  // Equals daysInMonth + 1 when the whole month is today-or-past (nothing drawable).
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
          {/* Header */}
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
                const holiday = holidayByDay.get(d);
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

          <PlanningCapacityStrip
            days={days}
            users={users}
            simBlocks={simBlocks}
            viewYear={viewYear}
            viewMonth={viewMonth}
            isClosedDay={isClosedDay}
            perDayLoad={perDayLoad}
          />

          {users.map((emp) => {
            const viewLeaves = getViewLeaves(emp, viewYear, viewMonth);
            const empBlocksInView = simBlocks
              .filter((b) => b.userId === emp.id)
              .map((b) => ({ block: b, range: getBlockDisplayRange(b, viewYear, viewMonth) }))
              .filter((x) => x.range !== null) as {
              block: SimBlock;
              range: NonNullable<ReturnType<typeof getBlockDisplayRange>>;
            }[];
            const impact = mode === "simulate" ? perUserImpact[emp.id]?.level : undefined;

            return (
              <div
                key={emp.id}
                className="flex border-b border-border/40 hover:bg-muted/10 transition-colors group last:border-b-0"
                style={{ minHeight: ROW_HEIGHT }}
              >
                <div
                  className="shrink-0 sticky left-0 z-10 bg-card border-r border-border/40 flex items-center px-5 gap-2.5"
                  style={{ width: NAME_COL_WIDTH }}
                >
                  <UserAvatar firstname={emp.firstname} lastname={emp.lastname} variant={emp.status} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-[13px] whitespace-nowrap truncate">
                      {emp.firstname} {emp.lastname}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{emp.department?.name ?? emp.title}</p>
                  </div>
                  {impact && impact !== "safe" && (
                    <div
                      className={cn(
                        "flex shrink-0 size-5 items-center justify-center rounded-full",
                        impact === "critical"
                          ? "bg-danger/15 text-destructive-foreground"
                          : "bg-warning/15 text-warning",
                      )}
                    >
                      {impact === "critical" ? (
                        <ShieldWarningIcon className="size-3" />
                      ) : (
                        <WarningIcon className="size-3" />
                      )}
                    </div>
                  )}
                </div>

                <div
                  className="relative"
                  style={{
                    width: totalDaysWidth,
                    height: ROW_HEIGHT,
                    cursor: mode === "simulate" && !dragState && !drawState ? "crosshair" : undefined,
                  }}
                  onMouseDown={(e) => startDraw(e, emp)}
                >
                  {mode === "simulate" && firstFutureDay > 1 && (
                    <div
                      className="absolute inset-y-0 border-r border-border/60"
                      style={{
                        left: 0,
                        width: Math.min(firstFutureDay - 1, daysInMonth) * DAY_COL_WIDTH,
                        cursor: "not-allowed",
                        backgroundColor: "color-mix(in srgb, var(--muted) 30%, transparent)",
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent 0 6px, color-mix(in srgb, var(--muted-foreground) 10%, transparent) 6px 7px)",
                      }}
                      title="Absences can only be simulated in the future"
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  )}

                  {todayDay !== null && (
                    <div
                      className="absolute inset-y-0 pointer-events-none bg-primary/5"
                      style={{ left: toX(todayDay), width: DAY_COL_WIDTH }}
                    />
                  )}

                  {days.map((d) =>
                    isClosedDay(d) && !(mode === "simulate" && d < firstFutureDay) ? (
                      <div
                        key={d}
                        className="absolute inset-y-0 pointer-events-none"
                        style={{
                          left: toX(d),
                          width: DAY_COL_WIDTH,
                          backgroundColor: "color-mix(in srgb, var(--muted) 35%, transparent)",
                          backgroundImage:
                            "repeating-linear-gradient(45deg, transparent 0 5px, color-mix(in srgb, var(--muted-foreground) 9%, transparent) 5px 6px)",
                        }}
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

                  {days.map((d) => (
                    <div
                      key={`h${d}`}
                      className="absolute inset-y-0 border-r border-dashed border-border/10 pointer-events-none"
                      style={{ left: toX(d) + DAY_COL_WIDTH / 2 - 1, width: 1 }}
                    />
                  ))}

                  {viewLeaves.map((lr, i) => {
                    // In simulate mode, confirmed leaves are greyed so user-added sim blocks stand out.
                    const simulating = mode === "simulate";
                    const theme = absenceTheme(lr.type);
                    const segs = workingSegments(lr.start, 0, lr.end, 1, daysInMonth, isClosedDay);
                    const list = segs.length
                      ? segs
                      : [{ startDay: lr.start, startHalf: 0 as Half, endDay: lr.end, endHalf: 1 as Half }];
                    return list.map((s, j) => {
                      const left = toX(s.startDay, s.startHalf);
                      const width = toX(s.endDay, s.endHalf) + DAY_COL_WIDTH / 2 - left;
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={cn(
                            "absolute rounded-lg border",
                            simulating
                              ? "border-muted-foreground/30"
                              : cn(theme.bg, theme.border, "cursor-pointer transition hover:brightness-95"),
                            !segs.length && "opacity-50",
                          )}
                          style={{
                            left: left + 2,
                            width: width - 4,
                            top: 10,
                            height: 34,
                            // Opaque so the locked-past hatch can't show through greyed leaves.
                            ...(simulating
                              ? { background: "color-mix(in srgb, var(--muted-foreground) 15%, var(--card))" }
                              : {}),
                          }}
                          onMouseDown={simulating ? undefined : (e) => e.stopPropagation()}
                          onClick={simulating ? undefined : () => onSelectAbsence(emp.id, lr.id)}
                        />
                      );
                    });
                  })}

                  {drawState?.userId === emp.id &&
                    (() => {
                      const { startDay, startHalf, endDay, endHalf } = drawDisplayRange(drawState);
                      const segs = workingSegments(startDay, startHalf, endDay, endHalf, daysInMonth, isClosedDay);
                      const list = segs.length ? segs : [{ startDay, startHalf, endDay, endHalf }];
                      return list.map((s, j) => {
                        const left = toX(s.startDay, s.startHalf);
                        const right = toX(s.endDay, s.endHalf) + DAY_COL_WIDTH / 2;
                        const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                        return (
                          <div
                            key={j}
                            className={cn(
                              "absolute rounded-xl border-2 border-dashed border-planned bg-planned/15 pointer-events-none",
                              !segs.length && "opacity-50",
                            )}
                            style={{ left: left + 2, width: width - 4, top: 6, height: 44, zIndex: 30 }}
                          />
                        );
                      });
                    })()}

                  {empBlocksInView.map(({ block, range }) => {
                    const color = simColor(block.colorIdx);
                    const isDragging = dragState?.blockId === block.id;
                    const isSelected = selectedBlockId === block.id;
                    const segs = workingSegments(
                      range.startDay,
                      range.startHalf,
                      range.endDay,
                      range.endHalf,
                      daysInMonth,
                      isClosedDay,
                    );
                    const ghost = segs.length === 0;
                    const list = ghost
                      ? [
                          {
                            startDay: range.startDay,
                            startHalf: range.startHalf,
                            endDay: range.endDay,
                            endHalf: range.endHalf,
                          },
                        ]
                      : segs;
                    const workingHalves = countWorkingHalves(
                      range.startDay,
                      range.startHalf,
                      range.endDay,
                      range.endHalf,
                      daysInMonth,
                      isClosedDay,
                    );
                    const label = halvesLabel(workingHalves);

                    return list.map((s, i) => {
                      const isFirst = i === 0;
                      const isLast = i === list.length - 1;
                      const left = toX(s.startDay, s.startHalf);
                      const right = toX(s.endDay, s.endHalf) + DAY_COL_WIDTH / 2;
                      const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                      const clipLeft = isFirst && range.clippedStart;
                      const clipRight = isLast && range.clippedEnd;
                      const showLeftHandle = isFirst && !range.clippedStart && !ghost;
                      const showRightHandle = isLast && !range.clippedEnd && !ghost;

                      return (
                        <div
                          key={`${block.id}-${i}`}
                          className={cn(
                            "absolute flex items-center rounded-xl border-2 border-dashed select-none transition-shadow duration-100",
                            clipLeft && "rounded-l-none",
                            clipRight && "rounded-r-none",
                            ghost && "opacity-50",
                            isDragging && "shadow-xl opacity-95",
                            isSelected && "ring-2 ring-offset-1 shadow-md",
                          )}
                          style={{
                            left: left + 2,
                            width: width - 4,
                            top: 6,
                            height: 44,
                            zIndex: isDragging ? 20 : isSelected ? 10 : 5,
                            cursor: isDragging ? "grabbing" : "grab",
                            background: color.bg,
                            borderColor: color.border,
                            color: color.fg,
                            // @ts-expect-error -- CSS var passthrough for ring color
                            "--tw-ring-color": color.border,
                          }}
                        >
                          {clipLeft ? (
                            <div
                              className="absolute left-0 inset-y-0 w-5 flex items-center justify-center opacity-60"
                              style={{ color: color.fg }}
                            >
                              <CaretLeftIcon className="size-3" />
                            </div>
                          ) : showLeftHandle ? (
                            <div
                              className="absolute left-0 inset-y-0 w-3.5 rounded-l-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              style={{ background: color.border }}
                              onMouseDown={(e) => startDrag(e, block, "resize-left")}
                            >
                              <GripVertical className="size-2.5 text-white" />
                            </div>
                          ) : null}
                          <div
                            className="flex-1 flex items-center justify-center mx-3.5 overflow-hidden"
                            onMouseDown={(e) => startDrag(e, block, "move")}
                          >
                            {isFirst && width > 50 && (
                              <span className="text-[11px] font-bold truncate" style={{ color: color.fg }}>
                                {label}
                              </span>
                            )}
                          </div>
                          {clipRight ? (
                            <div
                              className="absolute right-0 inset-y-0 w-5 flex items-center justify-center opacity-60"
                              style={{ color: color.fg }}
                            >
                              <CaretRightIcon className="size-3" />
                            </div>
                          ) : showRightHandle ? (
                            <div
                              className="absolute right-0 inset-y-0 w-3.5 rounded-r-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                              style={{ background: color.border }}
                              onMouseDown={(e) => startDrag(e, block, "resize-right")}
                            >
                              <GripVertical className="size-2.5 text-white" />
                            </div>
                          ) : null}
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            );
          })}
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
                return (
                  <div
                    key={d}
                    className={cn(
                      "flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 pb-1.5 pt-2",
                      closed && "bg-muted/40",
                    )}
                    style={{ width: DAY_COL_WIDTH }}
                  >
                    <span
                      className={cn(
                        "text-[9px] font-medium leading-none",
                        closed ? "text-muted-foreground/30" : "text-muted-foreground/60",
                      )}
                    >
                      {getDayLabel(d, firstDayOfWeek)}
                    </span>
                    <span
                      className={cn(
                        "text-[11px] font-bold leading-snug",
                        closed ? "text-muted-foreground/30" : "text-foreground/70",
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
