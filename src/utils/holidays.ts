/** Parse "YYYY-MM-DD" (optionally with a time suffix) into a local midnight Date — no timezone shift. */
export function parseISODateLocal(value: string): Date {
  const [y, m, d] = value.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

interface HolidayRange {
  start_date: string;
  end_date: string;
  recurring: boolean;
}

/**
 * Inclusive local-date range a company holiday occupies in `year`.
 * Recurring holidays are projected onto that year, preserving multi-day
 * spans that cross a year boundary. Mirrors the backend's CalendarService.
 */
export function holidayRangeForYear(holiday: HolidayRange, year: number): { start: Date; end: Date } {
  const src = parseISODateLocal(holiday.start_date);
  const srcEnd = parseISODateLocal(holiday.end_date);
  if (!holiday.recurring) return { start: src, end: srcEnd };
  return {
    start: new Date(year, src.getMonth(), src.getDate()),
    end: new Date(year + (srcEnd.getFullYear() - src.getFullYear()), srcEnd.getMonth(), srcEnd.getDate()),
  };
}
