import { type Dispatch, type MouseEvent as ReactMouseEvent, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";
import {
  DAY_COL_WIDTH,
  countWorkingHalves,
  drawDisplayRange,
  fromHalves,
  getBlockDisplayRange,
  makeDateStr,
  toHalves,
} from "@/utils/planning/calendar";
import { clampDrawEnd, hasOverlap, isOnRealLeave } from "@/utils/planning/leaves";

export type DragMode = "move" | "resize-left" | "resize-right";

export interface DragState {
  blockId: string;
  mode: DragMode;
  startMouseX: number;
  origStartDay: number;
  origStartHalf: Half;
  origEndDay: number;
  origEndHalf: Half;
}

export interface DrawState {
  userId: string;
  anchorDay: number;
  anchorHalf: Half;
  currentDay: number;
  currentHalf: Half;
  containerLeft: number;
}

/**
 * Resolve a drag's new day/half range for all three modes. `move` slides the whole span (clamped
 * so it stays in-month and future), `resize-left`/`resize-right` move one edge while the other
 * stays at its drag-start value. Returns all four coords; the unchanged edge just echoes its
 * original, so the caller can spread a single result regardless of mode.
 */
function nextDragRange(drag: DragState, dH: number, daysInMonth: number, firstFutureDay: number) {
  const minH = toHalves(firstFutureDay, 0);
  const maxH = daysInMonth * 2 - 1;
  const os = toHalves(drag.origStartDay, drag.origStartHalf);
  const oe = toHalves(drag.origEndDay, drag.origEndHalf);
  let ns = os;
  let ne = oe;
  if (drag.mode === "move") {
    const span = oe - os;
    ns = Math.max(minH, Math.min(maxH - span, os + dH));
    ne = ns + span;
  } else if (drag.mode === "resize-left") {
    ns = Math.max(minH, Math.min(oe - 1, os + dH));
  } else {
    ne = Math.max(os + 1, Math.min(maxH, oe + dH));
  }
  const s = fromHalves(ns, daysInMonth);
  const e = fromHalves(ne, daysInMonth);
  return { startDay: s.day, startHalf: s.half, endDay: e.day, endHalf: e.half };
}

interface UseGanttGesturesArgs {
  mode: PlanningMode;
  users: PlanningUser[];
  simBlocks: SimBlock[];
  setSimBlocks: Dispatch<SetStateAction<SimBlock[]>>;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  onCreateBlock: (empId: string, startDate: string, startHalf: Half, endDate: string, endHalf: Half) => void;
  viewYear: number;
  viewMonth: number;
  daysInMonth: number;
  firstFutureDay: number;
  isClosedDay: (day: number) => boolean;
}

/**
 * Mouse-gesture engine for the planning gantt: draw-to-create, drag-to-move, and edge-resize of
 * simulated absence blocks. Owns all the transient drag/draw state and the document-level
 * listeners; the component only reads `dragState`/`drawState` for cursors and the live preview,
 * and wires `startDrag`/`startDraw` to mousedown.
 *
 * Guards (identical across every gesture): future-only (no today/past), in-month bounds, and no
 * overlap with confirmed leaves or other sim blocks.
 */
export function useGanttGestures({
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
}: UseGanttGesturesArgs) {
  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const [dragState, setDragState] = useState<DragState | null>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const didMoveRef = useRef(false);
  const [drawState, setDrawState] = useState<DrawState | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);

  // Latest-value refs so the document listeners can stay subscribed yet never read stale state.
  const onCreateBlockRef = useRef(onCreateBlock);
  const simBlocksRef = useRef(simBlocks);
  const selectedBlockIdRef = useRef(selectedBlockId);
  useEffect(() => {
    onCreateBlockRef.current = onCreateBlock;
  }, [onCreateBlock]);
  useEffect(() => {
    simBlocksRef.current = simBlocks;
  }, [simBlocks]);
  useEffect(() => {
    selectedBlockIdRef.current = selectedBlockId;
  }, [selectedBlockId]);

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
            const r = nextDragRange(drag, dH, daysInMonth, firstFutureDay);
            if (hasOverlap(user, prev, r.startDay, r.startHalf, r.endDay, r.endHalf, viewYear, viewMonth, b.id)) {
              return b;
            }
            // Reject a position that lands entirely on closed days (no working half). Because the
            // candidate is recomputed from the absolute mouse each move, a short block dragged past
            // a weekend simply jumps to the next working day instead of resting on it.
            if (countWorkingHalves(r.startDay, r.startHalf, r.endDay, r.endHalf, daysInMonth, isClosedDay) === 0) {
              return b;
            }
            return {
              ...b,
              startDate: makeDateStr(viewYear, viewMonth, r.startDay),
              startHalf: r.startHalf,
              endDate: makeDateStr(viewYear, viewMonth, r.endDay),
              endHalf: r.endHalf,
            };
          }),
        );
        return;
      }

      const draw = drawStateRef.current;
      if (draw) {
        const user = usersById.get(draw.userId);
        if (!user) return;
        const relX = Math.max(0, e.clientX - draw.containerLeft);
        // Floor at the first future day so the block can't be dragged onto today/past.
        const minHalfIdx = toHalves(firstFutureDay, 0);
        const halfIdx = Math.max(minHalfIdx, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
        const { day, half } = fromHalves(halfIdx, daysInMonth);
        const clamped = clampDrawEnd(
          user,
          simBlocksRef.current,
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
        const user = usersById.get(draw.userId);
        // Defensive: commit only a future, non-overlapping block. The per-move clamp already
        // stops the draw at the border of any block in its path — this is the hard backstop so
        // an overlapping block can never be created even if a clamp edge is missed.
        if (
          startDay >= firstFutureDay &&
          user &&
          !hasOverlap(user, simBlocksRef.current, startDay, startHalf, endDay, endHalf, viewYear, viewMonth) &&
          countWorkingHalves(startDay, startHalf, endDay, endHalf, daysInMonth, isClosedDay) > 0
        ) {
          onCreateBlockRef.current(
            draw.userId,
            makeDateStr(viewYear, viewMonth, startDay),
            startHalf,
            makeDateStr(viewYear, viewMonth, endDay),
            endHalf,
          );
        }
        drawStateRef.current = null;
        setDrawState(null);
      }
      // A move drag that never actually moved is a click → toggle selection (open/close sheet).
      // Lives here (not on the block) so it also fires when the grab started in the row gap
      // above/below the shorter visual pill.
      const drag = dragStateRef.current;
      if (drag && drag.mode === "move" && !didMoveRef.current) {
        setSelectedBlockId(selectedBlockIdRef.current === drag.blockId ? null : drag.blockId);
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
  }, [setSimBlocks, setSelectedBlockId, viewYear, viewMonth, daysInMonth, usersById, firstFutureDay, isClosedDay]);

  function startDrag(e: ReactMouseEvent, block: SimBlock, dragMode: DragMode) {
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

  function startDraw(e: ReactMouseEvent<HTMLDivElement>, user: PlanningUser) {
    if (mode !== "simulate") return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, e.clientX - rect.left);
    const halfIdx = Math.max(0, Math.min(daysInMonth * 2 - 1, Math.floor(relX / (DAY_COL_WIDTH / 2))));
    const { day, half } = fromHalves(halfIdx, daysInMonth);
    if (day < firstFutureDay) return; // future-only: can't start on today or in the past
    if (isOnRealLeave(user, day, viewYear, viewMonth)) return;
    // A mousedown anywhere in an existing block's half-day SPAN (incl. the row gap above/below its
    // shorter visual pill) grabs that block — never spawns an overlapping new draw. This makes the
    // whole row height of a block interactive, and a clean click toggles its detail sheet. Matched
    // at half-day precision so the free PM beside a block ending AM still starts a new draw.
    const hitBlock = simBlocks.find((b) => {
      if (b.userId !== user.id) return false;
      const r = getBlockDisplayRange(b, viewYear, viewMonth);
      return r != null && halfIdx >= toHalves(r.startDay, r.startHalf) && halfIdx <= toHalves(r.endDay, r.endHalf);
    });
    if (hitBlock) {
      startDrag(e, hitBlock, "move");
      return;
    }
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

  return { dragState, drawState, startDrag, startDraw };
}
