export const DAY_COL_WIDTH = 44;
export const ROW_HEIGHT = 56;
export const NAME_COL_WIDTH = 192;
export const CAPACITY_ROW_HEIGHT = 36;

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES = [
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

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function makeDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseDateStr(dateStr: string): { year: number; month: number; day: number } | null {
  const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return { year: parseInt(m[1], 10), month: parseInt(m[2], 10), day: parseInt(m[3], 10) };
}

/** "12 Jun" | "12–18 Jun" | "28 Jun – 2 Jul" from a start/end YYYY-MM-DD pair. */
export function formatRange(start: string, end: string): string | null {
  const a = parseDateStr(start);
  const b = parseDateStr(end);
  if (!a || !b) return null;
  const mon = (m: number) => MONTH_NAMES[m - 1].slice(0, 3);
  if (start === end) return `${a.day} ${mon(a.month)}`;
  if (a.month === b.month) return `${a.day}–${b.day} ${mon(b.month)}`;
  return `${a.day} ${mon(a.month)} – ${b.day} ${mon(b.month)}`;
}

export function getDayOfWeekForDay(day: number, firstDayOfWeek: number): number {
  return (firstDayOfWeek + day - 1) % 7;
}

export function getDayLabel(day: number, firstDayOfWeek: number): string {
  return DAY_NAMES[getDayOfWeekForDay(day, firstDayOfWeek)].slice(0, 2);
}

export function toHalves(day: number, half: Half): number {
  return (day - 1) * 2 + half;
}

export function fromHalves(h: number, daysInMonth: number): { day: number; half: Half } {
  const c = Math.max(0, Math.min(daysInMonth * 2 - 1, h));
  return { day: Math.floor(c / 2) + 1, half: (c % 2) as Half };
}

export function toX(day: number, half: Half = 0): number {
  return (day - 1) * DAY_COL_WIDTH + half * (DAY_COL_WIDTH / 2);
}

export function formatHalfDate(dateStr: string, half: Half): string {
  const parsed = parseDateStr(dateStr);
  if (!parsed) return `${dateStr} ${half === 0 ? "AM" : "PM"}`;
  const monthAbbr = MONTH_NAMES[parsed.month - 1].slice(0, 3);
  return `${monthAbbr} ${parsed.day} ${half === 0 ? "AM" : "PM"}`;
}

export function blockDurationLabel(b: SimBlock): string {
  const days =
    Math.round(
      (new Date(b.endDate + "T12:00:00").getTime() - new Date(b.startDate + "T12:00:00").getTime()) / 86400000,
    ) + 1;
  const halves = days * 2 - b.startHalf - (1 - b.endHalf);
  if (halves === 1) return "½ day";
  if (halves === 2) return "1 day";
  return `${halves / 2} days`;
}

export function getBlockDisplayRange(
  block: SimBlock,
  viewYear: number,
  viewMonth: number,
): BlockDisplayRange | null {
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const viewStart = makeDateStr(viewYear, viewMonth, 1);
  const viewEnd = makeDateStr(viewYear, viewMonth, daysInMonth);

  if (block.endDate < viewStart || block.startDate > viewEnd) return null;

  const clippedStart = block.startDate < viewStart;
  const clippedEnd = block.endDate > viewEnd;

  let startDay: number;
  let startHalf: Half;
  if (clippedStart) {
    startDay = 1;
    startHalf = 0;
  } else {
    const parsed = parseDateStr(block.startDate);
    startDay = parsed ? parsed.day : 1;
    startHalf = block.startHalf;
  }

  let endDay: number;
  let endHalf: Half;
  if (clippedEnd) {
    endDay = daysInMonth;
    endHalf = 1;
  } else {
    const parsed = parseDateStr(block.endDate);
    endDay = parsed ? parsed.day : daysInMonth;
    endHalf = block.endHalf;
  }

  return { startDay, endDay, startHalf, endHalf, clippedStart, clippedEnd };
}

export interface WorkingSegment {
  startDay: number;
  startHalf: Half;
  endDay: number;
  endHalf: Half;
}

/**
 * Split a half-resolution range into contiguous runs of WORKING halves,
 * dropping closed days (weekends / holidays). Each run becomes a visual segment
 * so one logical absence renders as multiple pills with gaps over closed days.
 */
export function workingSegments(
  startDay: number,
  startHalf: Half,
  endDay: number,
  endHalf: Half,
  daysInMonth: number,
  isClosedDay: (day: number) => boolean,
): WorkingSegment[] {
  const a = toHalves(startDay, startHalf);
  const b = toHalves(endDay, endHalf);
  const segs: WorkingSegment[] = [];
  let cur: WorkingSegment | null = null;
  for (let h = a; h <= b; h++) {
    const { day, half } = fromHalves(h, daysInMonth);
    if (isClosedDay(day)) {
      if (cur) {
        segs.push(cur);
        cur = null;
      }
      continue;
    }
    if (!cur) cur = { startDay: day, startHalf: half, endDay: day, endHalf: half };
    else {
      cur.endDay = day;
      cur.endHalf = half;
    }
  }
  if (cur) segs.push(cur);
  return segs;
}

/** Count of working halves in a range (closed days excluded). */
export function countWorkingHalves(
  startDay: number,
  startHalf: Half,
  endDay: number,
  endHalf: Half,
  daysInMonth: number,
  isClosedDay: (day: number) => boolean,
): number {
  const a = toHalves(startDay, startHalf);
  const b = toHalves(endDay, endHalf);
  let n = 0;
  for (let h = a; h <= b; h++) {
    if (!isClosedDay(fromHalves(h, daysInMonth).day)) n++;
  }
  return n;
}

/** Human label from a count of halves: 1 → "½ day", 2 → "1 day", n → "x days". */
export function halvesLabel(halves: number): string {
  if (halves <= 0) return "0 days";
  if (halves === 1) return "½ day";
  if (halves === 2) return "1 day";
  return `${halves / 2} days`;
}

export interface DrawRange {
  startDay: number;
  startHalf: Half;
  endDay: number;
  endHalf: Half;
}

export function drawDisplayRange(draw: {
  anchorDay: number;
  anchorHalf: Half;
  currentDay: number;
  currentHalf: Half;
}): DrawRange {
  const anchorH = toHalves(draw.anchorDay, draw.anchorHalf);
  const currH = toHalves(draw.currentDay, draw.currentHalf);
  if (anchorH <= currH) {
    return { startDay: draw.anchorDay, startHalf: draw.anchorHalf, endDay: draw.currentDay, endHalf: draw.currentHalf };
  }
  return { startDay: draw.currentDay, startHalf: draw.currentHalf, endDay: draw.anchorDay, endHalf: draw.anchorHalf };
}
