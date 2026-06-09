import {
  fromHalves,
  getBlockDisplayRange,
  getDaysInMonth,
  makeDateStr,
  parseDateStr,
  toHalves,
} from "./calendar";

export function getViewLeaves(user: PlanningUser, viewYear: number, viewMonth: number): ViewLeave[] {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const viewStart = makeDateStr(viewYear, viewMonth, 1);
  const viewEnd = makeDateStr(viewYear, viewMonth, daysInMonth);

  return user.absences
    .filter((l) => l.end_date >= viewStart && l.start_date <= viewEnd)
    .map((l) => {
      const startParsed = parseDateStr(l.start_date);
      const endParsed = parseDateStr(l.end_date);
      const start = l.start_date < viewStart ? 1 : (startParsed?.day ?? 1);
      const end = l.end_date > viewEnd ? daysInMonth : (endParsed?.day ?? daysInMonth);
      return { id: l.id, start, end, type: l.type };
    });
}

export function isOnRealLeave(user: PlanningUser, day: number, viewYear: number, viewMonth: number): boolean {
  return getViewLeaves(user, viewYear, viewMonth).some((l) => day >= l.start && day <= l.end);
}

/**
 * Half-unit [start, end] intervals occupied by a user, in `toHalves` coordinates: confirmed leaves
 * (full days → AM..PM) plus their sim blocks at half-day precision. Optionally excludes one sim
 * block (the one being dragged). Half precision lets a block end at AM and the next begin that same
 * PM — day-granularity would falsely reserve the whole day and force a one-day gap.
 */
function occupiedHalfIntervals(
  user: PlanningUser,
  blocks: SimBlock[],
  viewYear: number,
  viewMonth: number,
  excludeId?: string,
): { start: number; end: number }[] {
  const leaves = getViewLeaves(user, viewYear, viewMonth).map((l) => ({
    start: toHalves(l.start, 0),
    end: toHalves(l.end, 1),
  }));
  const sims = blocks
    .filter((b) => b.userId === user.id && b.id !== excludeId)
    .map((b) => getBlockDisplayRange(b, viewYear, viewMonth))
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .map((r) => ({ start: toHalves(r.startDay, r.startHalf), end: toHalves(r.endDay, r.endHalf) }));
  return [...leaves, ...sims];
}

/**
 * True when the half-open range [start, end] (day+half each) overlaps the user's confirmed leaves
 * OR any of their other sim blocks. Single half-precise guard for both sources.
 */
export function hasOverlap(
  user: PlanningUser,
  blocks: SimBlock[],
  startDay: number,
  startHalf: Half,
  endDay: number,
  endHalf: Half,
  viewYear: number,
  viewMonth: number,
  excludeId?: string,
): boolean {
  const sH = toHalves(startDay, startHalf);
  const eH = toHalves(endDay, endHalf);
  return occupiedHalfIntervals(user, blocks, viewYear, viewMonth, excludeId).some(
    (iv) => iv.start <= eH && iv.end >= sH,
  );
}

/**
 * Clamp a draw's moving edge so it stops exactly at the half-day border of the nearest blocking
 * leave or sim block — never extending into one, but allowed to butt right against it.
 */
export function clampDrawEnd(
  user: PlanningUser,
  blocks: SimBlock[],
  anchorDay: number,
  anchorHalf: Half,
  targetDay: number,
  targetHalf: Half,
  viewYear: number,
  viewMonth: number,
  daysInMonth: number,
): { day: number; half: Half } {
  const intervals = occupiedHalfIntervals(user, blocks, viewYear, viewMonth);
  const anchorH = toHalves(anchorDay, anchorHalf);
  const targetH = toHalves(targetDay, targetHalf);
  if (anchorH <= targetH) {
    const blocking = intervals
      .filter((iv) => iv.start <= targetH && iv.end >= anchorH)
      .sort((a, b) => a.start - b.start)[0];
    if (!blocking) return { day: targetDay, half: targetHalf };
    return fromHalves(Math.max(anchorH, blocking.start - 1), daysInMonth);
  }
  const blocking = intervals
    .filter((iv) => iv.start <= anchorH && iv.end >= targetH)
    .sort((a, b) => b.end - a.end)[0];
  if (!blocking) return { day: targetDay, half: targetHalf };
  return fromHalves(Math.min(anchorH, blocking.end + 1), daysInMonth);
}

export function isOnSimLeave(
  userId: string,
  day: number,
  blocks: SimBlock[],
  viewYear: number,
  viewMonth: number,
): boolean {
  return blocks.some((b) => {
    if (b.userId !== userId) return false;
    const range = getBlockDisplayRange(b, viewYear, viewMonth);
    if (!range) return false;
    return day >= range.startDay && day <= range.endDay;
  });
}
