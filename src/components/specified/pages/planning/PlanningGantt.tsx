import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, GripVertical, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalendarSettings } from "@/hooks/useCalendarSettings";
import type { Half, ImpactLevel, PlanningMode, PlanningUser, SimBlock } from "@/types/planning";
import {
  DAY_COL_WIDTH,
  MONTH_NAMES,
  NAME_COL_WIDTH,
  ROW_HEIGHT,
  blockDurationLabel,
  drawDisplayRange,
  fromHalves,
  getBlockDisplayRange,
  getDayLabel,
  getDayOfWeekForDay,
  getDaysInMonth,
  getFirstDayOfWeek,
  makeDateStr,
  toHalves,
  toX,
} from "@/utils/planning/calendar";
import {
  clampDrawEnd,
  getViewLeaves,
  hasLeaveOverlap,
  isOnRealLeave,
} from "@/utils/planning/leaves";
import { ABSENCE_THEME, simColor } from "@/utils/planning/theme";
import PlanningCapacityStrip from "./PlanningCapacityStrip";
import PlanningLegend from "./PlanningLegend";

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
  perUserImpact: Record<string, ImpactLevel>;
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
}: PlanningGanttProps) {
  const { settings } = useCalendarSettings();
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

  function isClosedDay(day: number): boolean {
    const dow = getDayOfWeekForDay(day, firstDayOfWeek);
    return !settings.workingDays.includes(dow) || settings.holidays.some((h) => h.day === day);
  }

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

  const holidayText = settings.holidays.length
    ? settings.holidays.map((h) => `${MONTH_NAMES[viewMonth - 1].slice(0, 3)} ${h.day} (${h.label})`).join(" · ")
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                Employee
              </span>
            </div>
            <div className="flex" style={{ width: totalDaysWidth }}>
              {days.map((d) => {
                const closed = isClosedDay(d);
                const holiday = settings.holidays.find((h) => h.day === d);
                const isToday = d === todayDay;
                return (
                  <div
                    key={d}
                    className={cn(
                      "flex flex-col items-center justify-end border-r border-border/20 last:border-r-0 pb-1.5 pt-2 relative",
                      closed && "bg-muted/40",
                    )}
                    style={{ width: DAY_COL_WIDTH }}
                    title={holiday?.label}
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
            const impact = mode === "simulate" ? perUserImpact[emp.id] : undefined;

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
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg text-[9px] font-bold text-white shadow-sm",
                      emp.color,
                    )}
                  >
                    {emp.initials}
                  </div>
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
                        impact === "critical" ? "bg-danger/15 text-destructive-foreground" : "bg-warning/15 text-warning",
                      )}
                    >
                      {impact === "critical" ? <ShieldAlert className="size-3" /> : <AlertTriangle className="size-3" />}
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
                        className="absolute inset-y-0 bg-muted/30 pointer-events-none"
                        style={{ left: toX(d), width: DAY_COL_WIDTH }}
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
                    const theme = ABSENCE_THEME[lr.type];
                    const left = toX(lr.start);
                    const width = toX(lr.end + 1) - left;
                    return (
                      <div
                        key={i}
                        className={cn(
                          "absolute rounded-lg flex items-center justify-center border",
                          theme.bg,
                          theme.border,
                        )}
                        style={{ left: left + 2, width: width - 4, top: 10, height: 34 }}
                      >
                        <div className={cn("size-1.5 rounded-full", theme.dot)} />
                      </div>
                    );
                  })}

                  {drawState?.userId === emp.id &&
                    (() => {
                      const { startDay, startHalf, endDay, endHalf } = drawDisplayRange(drawState);
                      const left = toX(startDay, startHalf);
                      const right = toX(endDay, endHalf) + DAY_COL_WIDTH / 2;
                      const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                      return (
                        <div
                          className="absolute rounded-xl border-2 border-dashed border-planned bg-planned/15 pointer-events-none"
                          style={{ left: left + 2, width: width - 4, top: 6, height: 44, zIndex: 30 }}
                        />
                      );
                    })()}

                  {empBlocksInView.map(({ block, range }) => {
                    const color = simColor(block.colorIdx);
                    const left = toX(range.startDay, range.startHalf);
                    const right = toX(range.endDay, range.endHalf) + DAY_COL_WIDTH / 2;
                    const width = Math.max(right - left, DAY_COL_WIDTH / 2);
                    const isDragging = dragState?.blockId === block.id;
                    const isSelected = selectedBlockId === block.id;

                    return (
                      <div
                        key={block.id}
                        className={cn(
                          "absolute flex items-center rounded-xl border-2 border-dashed select-none transition-shadow duration-100",
                          range.clippedStart && "rounded-l-none opacity-90",
                          range.clippedEnd && "rounded-r-none opacity-90",
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
                        onMouseUp={() => {
                          if (!didMoveRef.current) setSelectedBlockId(block.id === selectedBlockId ? null : block.id);
                          didMoveRef.current = false;
                        }}
                      >
                        {range.clippedStart ? (
                          <div
                            className="absolute left-0 inset-y-0 w-5 flex items-center justify-center opacity-60"
                            style={{ color: color.fg }}
                          >
                            <ArrowLeft className="size-3" />
                          </div>
                        ) : (
                          <div
                            className="absolute left-0 inset-y-0 w-3.5 rounded-l-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            style={{ background: color.border }}
                            onMouseDown={(e) => startDrag(e, block, "resize-left")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>
                        )}
                        <div
                          className="flex-1 flex items-center justify-center mx-3.5 overflow-hidden"
                          onMouseDown={(e) => startDrag(e, block, "move")}
                        >
                          {width > 50 && (
                            <span className="text-[11px] font-bold truncate" style={{ color: color.fg }}>
                              {blockDurationLabel(block)}
                            </span>
                          )}
                        </div>
                        {range.clippedEnd ? (
                          <div
                            className="absolute right-0 inset-y-0 w-5 flex items-center justify-center opacity-60"
                            style={{ color: color.fg }}
                          >
                            <ArrowRight className="size-3" />
                          </div>
                        ) : (
                          <div
                            className="absolute right-0 inset-y-0 w-3.5 rounded-r-xl cursor-ew-resize flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                            style={{ background: color.border }}
                            onMouseDown={(e) => startDrag(e, block, "resize-right")}
                          >
                            <GripVertical className="size-2.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
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
