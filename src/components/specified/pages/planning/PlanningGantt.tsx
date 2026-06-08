import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, GripVertical, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlanningCalendar } from "@/hooks/usePlanningCalendar";
import type { DayLoad, Half, PlanningMode, PlanningUser, SimBlock, UserImpact } from "@/types/planning";
import {
  CAPACITY_ROW_HEIGHT,
  DAY_COL_WIDTH,
  MONTH_NAMES,
  NAME_COL_WIDTH,
  ROW_HEIGHT,
  countWorkingHalves,
  drawDisplayRange,
  fromHalves,
  getBlockDisplayRange,
  getDayLabel,
  getDaysInMonth,
  getFirstDayOfWeek,
  halvesLabel,
  makeDateStr,
  toHalves,
  toX,
  workingSegments,
} from "@/utils/planning/calendar";
import { clampDrawEnd, getViewLeaves, hasLeaveOverlap, isOnRealLeave } from "@/utils/planning/leaves";
import { absenceTheme, simColor } from "@/utils/planning/theme";
import PlanningCapacityStrip from "./PlanningCapacityStrip";
import PlanningLegend from "./PlanningLegend";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar.tsx";
import { Skeleton } from "@/components/ui/skeleton";

type DragMode = "move" | "resize-left" | "resize-right";

interface DragState {
  blockId: string;
  mode: DragMode;
  startMouseX: number;
  origStartDay: number;
  origStartHalf: Half;
  origEndDay: number;
  origEndHalf: Half;
}

interface DrawState {
  userId: string;
  anchorDay: number;
  anchorHalf: Half;
  currentDay: number;
  currentHalf: Half;
  containerLeft: number;
}

interface PlanningGanttProps {
  mode: PlanningMode;
  users: PlanningUser[];
  simBlocks: SimBlock[];
  viewYear: number;
  viewMonth: number;
  setSimBlocks: React.Dispatch<React.SetStateAction<SimBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  onCreateBlock: (empId: string, startDate: string, startHalf: Half, endDate: string, endHalf: Half) => void;
  perUserImpact: Record<string, UserImpact>;
  perDayLoad?: DayLoad[];
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
  perUserImpact,
  perDayLoad,
}: PlanningGanttProps) {
  const { isClosedDay, holidays, holidayByDay } = usePlanningCalendar(viewYear, viewMonth);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didMoveRef = useRef(false);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);
  const onCreateBlockRef = useRef(onCreateBlock);
  useEffect(() => {
    onCreateBlockRef.current = onCreateBlock;
  }, [onCreateBlock]);

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalDaysWidth = daysInMonth * DAY_COL_WIDTH;

  const today = new Date();
  const todayInView = today.getFullYear() === viewYear && today.getMonth() + 1 === viewMonth;
  const todayDay = todayInView ? today.getDate() : null;

  const usersById = new Map(users.map((u) => [u.id, u]));

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragStateRef.current;
      if (drag) {
        const deltaX = e.clientX - drag.startMouseX;
        if (Math.abs(deltaX) > 4) didMoveRef.current = true;
        if (!didMoveRef.current) return;
        const dH = Math.round(deltaX / (DAY_COL_WIDTH / 2));
        setSimBlocks((prev) =>
          prev.map((b) => {
            if (b.id !== drag.blockId) return b;
            const user = usersById.get(b.userId);
            if (!user) return b;
            if (drag.mode === "move") {
              const os = toHalves(drag.origStartDay, drag.origStartHalf);
              const oe = toHalves(drag.origEndDay, drag.origEndHalf);
              const span = oe - os;
              const ns = Math.max(0, Math.min(daysInMonth * 2 - 1 - span, os + dH));
              const { day: sd, half: sh } = fromHalves(ns, daysInMonth);
              const { day: ed, half: eh } = fromHalves(ns + span, daysInMonth);
              if (hasLeaveOverlap(user, sd, ed, viewYear, viewMonth)) return b;
              return {
                ...b,
                startDate: makeDateStr(viewYear, viewMonth, sd),
                startHalf: sh,
                endDate: makeDateStr(viewYear, viewMonth, ed),
                endHalf: eh,
              };
            }
            if (drag.mode === "resize-left") {
              const oe = toHalves(drag.origEndDay, drag.origEndHalf);
              const ns = Math.max(0, Math.min(oe - 1, toHalves(drag.origStartDay, drag.origStartHalf) + dH));
              const { day: sd, half: sh } = fromHalves(ns, daysInMonth);
              if (hasLeaveOverlap(user, sd, drag.origEndDay, viewYear, viewMonth)) return b;
              return { ...b, startDate: makeDateStr(viewYear, viewMonth, sd), startHalf: sh };
            }
            const os = toHalves(drag.origStartDay, drag.origStartHalf);
            const ne = Math.max(
              os + 1,
              Math.min(daysInMonth * 2 - 1, toHalves(drag.origEndDay, drag.origEndHalf) + dH),
            );
            const { day: ed, half: eh } = fromHalves(ne, daysInMonth);
            if (hasLeaveOverlap(user, drag.origStartDay, ed, viewYear, viewMonth)) return b;
            return { ...b, endDate: makeDateStr(viewYear, viewMonth, ed), endHalf: eh };
          }),
        );
        return;
      }

      const draw = drawStateRef.current;
      if (draw) {
        const user = usersById.get(draw.userId);
        if (!user) return;
        const relX = Math.max(0, e.clientX - draw.containerLeft);
        const halfIdx = Math.max(0, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
        const { day, half } = fromHalves(halfIdx, daysInMonth);
        const clamped = clampDrawEnd(
          user,
          draw.anchorDay,
          draw.anchorHalf,
          day,
          half,
          viewYear,
          viewMonth,
          daysInMonth,
        );
        const updated = { ...draw, currentDay: clamped.day, currentHalf: clamped.half };
        drawStateRef.current = updated;
        setDrawState(updated);
      }
    };

    const onUp = () => {
      const draw = drawStateRef.current;
      if (draw) {
        const { startDay, startHalf, endDay, endHalf } = drawDisplayRange(draw);
        onCreateBlockRef.current(
          draw.userId,
          makeDateStr(viewYear, viewMonth, startDay),
          startHalf,
          makeDateStr(viewYear, viewMonth, endDay),
          endHalf,
        );
        drawStateRef.current = null;
        setDrawState(null);
      }
      dragStateRef.current = null;
      setDragState(null);
      didMoveRef.current = false;
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSimBlocks, viewYear, viewMonth, daysInMonth, users]);

  function startDrag(e: React.MouseEvent, block: SimBlock, dragMode: DragMode) {
    e.preventDefault();
    e.stopPropagation();
    didMoveRef.current = false;
    const range = getBlockDisplayRange(block, viewYear, viewMonth);
    if (!range) return;
    const drag: DragState = {
      blockId: block.id,
      mode: dragMode,
      startMouseX: e.clientX,
      origStartDay: range.startDay,
      origStartHalf: range.startHalf,
      origEndDay: range.endDay,
      origEndHalf: range.endHalf,
    };
    dragStateRef.current = drag;
    setDragState(drag);
  }

  function startDraw(e: React.MouseEvent<HTMLDivElement>, user: PlanningUser) {
    if (mode !== "simulate") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, e.clientX - rect.left);
    const halfIdx = Math.max(0, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
    const { day, half } = fromHalves(halfIdx, daysInMonth);
    if (isOnRealLeave(user, day, viewYear, viewMonth)) return;
    const draw: DrawState = {
      userId: user.id,
      anchorDay: day,
      anchorHalf: half,
      currentDay: day,
      currentHalf: half,
      containerLeft: rect.left,
    };
    drawStateRef.current = draw;
    setDrawState(draw);
  }

  const holidayText = holidays.length
    ? holidays.map((h) => `${MONTH_NAMES[viewMonth - 1].slice(0, 3)} ${h.day} (${h.label})`).join(" · ")
    : undefined;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
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
                        <ShieldAlert className="size-3" />
                      ) : (
                        <AlertTriangle className="size-3" />
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
                  {todayDay !== null && (
                    <div
                      className="absolute inset-y-0 pointer-events-none bg-primary/5"
                      style={{ left: toX(todayDay), width: DAY_COL_WIDTH }}
                    />
                  )}

                  {days.map((d) =>
                    isClosedDay(d) ? (
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
                    const list = segs.length ? segs : [{ startDay: lr.start, startHalf: 0 as Half, endDay: lr.end, endHalf: 1 as Half }];
                    return list.map((s, j) => {
                      const left = toX(s.startDay, s.startHalf);
                      const width = toX(s.endDay, s.endHalf) + DAY_COL_WIDTH / 2 - left;
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={cn(
                            "absolute rounded-lg border",
                            simulating ? "bg-muted-foreground/15 border-muted-foreground/30" : cn(theme.bg, theme.border),
                            !segs.length && "opacity-50",
                          )}
                          style={{ left: left + 2, width: width - 4, top: 10, height: 34 }}
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
                      ? [{ startDay: range.startDay, startHalf: range.startHalf, endDay: range.endDay, endHalf: range.endHalf }]
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

                    const onSelect = () => {
                      if (!didMoveRef.current) setSelectedBlockId(block.id === selectedBlockId ? null : block.id);
                      didMoveRef.current = false;
                    };

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
                          onMouseUp={onSelect}
                        >
                          {clipLeft ? (
                            <div
                              className="absolute left-0 inset-y-0 w-5 flex items-center justify-center opacity-60"
                              style={{ color: color.fg }}
                            >
                              <ArrowLeft className="size-3" />
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
                              <ArrowRight className="size-3" />
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
    </div>
  );
}

const CLOSED_DAY_STYLE = {
  backgroundColor: "color-mix(in srgb, var(--muted) 35%, transparent)",
  backgroundImage:
    "repeating-linear-gradient(45deg, transparent 0 5px, color-mix(in srgb, var(--muted-foreground) 9%, transparent) 5px 6px)",
} as const;

PlanningGantt.Skeleton = function PlanningGanttSkeleton({
  viewYear,
  viewMonth,
  rows = 6,
}: {
  viewYear: number;
  viewMonth: number;
  rows?: number;
}) {
  const { isClosedDay } = usePlanningCalendar(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const totalDaysWidth = daysInMonth * DAY_COL_WIDTH;

  return (
    <div className="rounded-2xl bg-card border border-border overflow-hidden shadow-sm">
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
              <div
                key={r}
                className="flex border-b border-border/40 last:border-b-0"
                style={{ minHeight: ROW_HEIGHT }}
              >
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
    </div>
  );
};
