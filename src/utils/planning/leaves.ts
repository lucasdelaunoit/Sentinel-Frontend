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

export function hasLeaveOverlap(
  user: PlanningUser,
  startDay: number,
  endDay: number,
  viewYear: number,
  viewMonth: number,
): boolean {
  return getViewLeaves(user, viewYear, viewMonth).some((l) => l.start <= endDay && l.end >= startDay);
}

export function clampDrawEnd(
  user: PlanningUser,
  anchorDay: number,
  anchorHalf: Half,
  targetDay: number,
  targetHalf: Half,
  viewYear: number,
  viewMonth: number,
  daysInMonth: number,
): { day: number; half: Half } {
  const leaves = getViewLeaves(user, viewYear, viewMonth);
  const anchorH = toHalves(anchorDay, anchorHalf);
  const targetH = toHalves(targetDay, targetHalf);
  if (anchorH <= targetH) {
    const blocking = leaves
      .filter((l) => l.start <= targetDay && l.end >= anchorDay)
      .sort((a, b) => a.start - b.start)[0];
    if (!blocking) return { day: targetDay, half: targetHalf };
    return fromHalves(Math.max(anchorH, toHalves(blocking.start, 0) - 1), daysInMonth);
  }
  const blocking = leaves
    .filter((l) => l.start <= anchorDay && l.end >= targetDay)
    .sort((a, b) => b.end - a.end)[0];
  if (!blocking) return { day: targetDay, half: targetHalf };
  return fromHalves(Math.min(anchorH, toHalves(blocking.end, 1) + 1), daysInMonth);
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
