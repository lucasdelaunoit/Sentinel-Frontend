import { type MouseEvent as ReactMouseEvent } from "react";
import { cn } from "@/lib/utils";
import {
  DAY_COL_WIDTH,
  NAME_COL_WIDTH,
  ROW_HEIGHT,
  countWorkingHalves,
  drawDisplayRange,
  getBlockDisplayRange,
  halvesLabel,
  toX,
  workingSegments,
} from "@/utils/planning/calendar";
import { getViewLeaves } from "@/utils/planning/leaves";
import { absenceTheme, simColor } from "@/utils/planning/theme";
import { TONE_SOFT_BADGE } from "@/lib/theme/tone.ts";
import UserAvatar from "@/components/specified/models/user/avatars/UserAvatar.tsx";
import { CaretLeftIcon, CaretRightIcon, ShieldWarningIcon, WarningIcon, DotsSixVerticalIcon } from "@phosphor-icons/react";
import type { DragMode, DragState, DrawState } from "@/hooks/useGanttGestures";

interface GanttEmployeeRowProps {
  emp: PlanningUser;
  mode: PlanningMode;
  viewYear: number;
  viewMonth: number;
  days: number[];
  daysInMonth: number;
  firstFutureDay: number;
  todayDay: number | null;
  totalDaysWidth: number;
  isClosedDay: (day: number) => boolean;
  simBlocks: SimBlock[];
  dragState: DragState | null;
  drawState: DrawState | null;
  selectedBlockId: string | null;
  /** Simulate-mode severity badge for this employee; undefined hides it. */
  impact?: Severity;
  startDraw: (e: ReactMouseEvent<HTMLDivElement>, user: PlanningUser) => void;
  startDrag: (e: ReactMouseEvent, block: SimBlock, dragMode: DragMode) => void;
  onSelectAbsence: (userId: string, absenceId: number) => void;
}

/** A single employee lane: name cell + day track with locked-past/closed-day overlays,
 *  confirmed leaves, the live draw preview, and draggable/resizable simulation blocks. */
export default function GanttEmployeeRow({
  emp,
  mode,
  viewYear,
  viewMonth,
  days,
  daysInMonth,
  firstFutureDay,
  todayDay,
  totalDaysWidth,
  isClosedDay,
  simBlocks,
  dragState,
  drawState,
  selectedBlockId,
  impact,
  startDraw,
  startDrag,
  onSelectAbsence,
}: GanttEmployeeRowProps) {
  const viewLeaves = getViewLeaves(emp, viewYear, viewMonth);
  const empBlocksInView = simBlocks
    .filter((b) => b.userId === emp.id)
    .map((b) => ({ block: b, range: getBlockDisplayRange(b, viewYear, viewMonth) }))
    .filter((x) => x.range !== null) as {
    block: SimBlock;
    range: NonNullable<ReturnType<typeof getBlockDisplayRange>>;
  }[];

  return (
    <div
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
        {impact && impact !== "ok" && (
          <div
            className={cn(
              "flex shrink-0 size-5 items-center justify-center rounded-full",
              impact === "critical" ? TONE_SOFT_BADGE.danger : TONE_SOFT_BADGE.warning,
            )}
          >
            {impact === "critical" ? <ShieldWarningIcon className="size-3" /> : <WarningIcon className="size-3" />}
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
                  ...(simulating ? { background: "color-mix(in srgb, var(--muted-foreground) 15%, var(--card))" } : {}),
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
                    <DotsSixVerticalIcon className="size-2.5 text-white" />
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
                    <DotsSixVerticalIcon className="size-2.5 text-white" />
                  </div>
                ) : null}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
}
