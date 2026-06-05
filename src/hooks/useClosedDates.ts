import { useMemo } from "react";
import useGetWorkingDays from "@/api/organization/useGetWorkingDays";
import useGetCompanyHolidays from "@/api/company-holidays/useGetCompanyHolidays";

const FALLBACK_WORKING_DAYS = [1, 1, 1, 1, 1, 0, 0]; // ISO Mon=0 … Sun=6

/** Parse "YYYY-MM-DD" into a local Date (no timezone shift). */
function parseISO(value: string): Date {
  const [y, m, d] = value.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Strip time so range comparisons are day-precise. */
function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Date-level closed-day check sourced from the real backend calendar
 * (working week + company holidays). Works for any month/year — recurring
 * holidays are projected onto the checked date's year. Mirrors the backend's
 * CalendarService so the picker can't offer a day the API will reject.
 */
export function useClosedDates() {
  const { data: workdays } = useGetWorkingDays();
  const { data: holidays } = useGetCompanyHolidays({ per_page: 200 });

  const workingDays = workdays?.working_days ?? FALLBACK_WORKING_DAYS;

  const isClosedDate = useMemo(() => {
    const wd = workingDays;
    const list = holidays ?? [];

    return (date: Date): boolean => {
      const iso = (date.getDay() + 6) % 7; // Mon=0 … Sun=6
      if (wd[iso] !== 1) return true;

      const target = atMidnight(date);
      const year = date.getFullYear();

      for (const h of list) {
        const src = parseISO(h.start_date);
        const srcEnd = parseISO(h.end_date);
        let start: Date;
        let end: Date;
        if (h.recurring) {
          start = new Date(year, src.getMonth(), src.getDate());
          end = new Date(year + (srcEnd.getFullYear() - src.getFullYear()), srcEnd.getMonth(), srcEnd.getDate());
        } else {
          start = atMidnight(src);
          end = atMidnight(srcEnd);
        }
        if (target >= start && target <= end) return true;
      }
      return false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingDays.join(","), holidays]);

  return { isClosedDate };
}
