import { useMemo } from "react";
import useGetWorkingDays from "@/api/settings/organization/useGetWorkingDays";
import useGetCompanyHolidaysForMonth from "@/api/settings/companyHoliday/useGetCompanyHolidaysForMonth";
import { getDayOfWeekForDay, getDaysInMonth, getFirstDayOfWeek } from "@/utils/planning/calendar";
import { holidayRangeForYear } from "@/utils/holidays";

export interface PlanningHoliday {
  day: number;
  label: string;
}

/** Default working week while settings load: Mon–Fri (ISO Mon=0 … Sun=6). */
const FALLBACK_WORKING_DAYS = [1, 1, 1, 1, 1, 0, 0];

/**
 * Closed-day source of truth for the Planning Gantt — real backend working week
 * + company holidays for the viewed month (NOT the localStorage mock).
 * working_days is ISO indexed: index 0 = Monday … 6 = Sunday, 1 = working.
 */
export function usePlanningCalendar(viewYear: number, viewMonth: number) {
  const { data: workdays } = useGetWorkingDays();
  const monthDate = useMemo(() => new Date(viewYear, viewMonth - 1, 1), [viewYear, viewMonth]);
  const { data: holidays } = useGetCompanyHolidaysForMonth(monthDate);

  const workingDays = workdays?.working_days ?? FALLBACK_WORKING_DAYS;

  const holidayDays = useMemo<PlanningHoliday[]>(() => {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const result: PlanningHoliday[] = [];
    for (const h of holidays) {
      const { start, end } = holidayRangeForYear(h, viewYear);
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(viewYear, viewMonth - 1, d);
        if (date >= start && date <= end) result.push({ day: d, label: h.name });
      }
    }
    return result;
  }, [holidays, viewYear, viewMonth]);

  const holidayByDay = useMemo(() => {
    const m = new Map<number, string>();
    for (const h of holidayDays) if (!m.has(h.day)) m.set(h.day, h.label);
    return m;
  }, [holidayDays]);

  const firstDayOfWeek = getFirstDayOfWeek(viewYear, viewMonth);

  const isClosedDay = useMemo(() => {
    return (day: number): boolean => {
      const jsDow = getDayOfWeekForDay(day, firstDayOfWeek); // 0 = Sun … 6 = Sat
      const iso = (jsDow + 6) % 7; // Mon = 0 … Sun = 6
      if (workingDays[iso] !== 1) return true;
      return holidayByDay.has(day);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workingDays.join(","), firstDayOfWeek, holidayByDay]);

  return { isClosedDay, holidays: holidayDays, holidayByDay, workingDays };
}
