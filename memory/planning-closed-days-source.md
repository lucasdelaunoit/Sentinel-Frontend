---
name: planning-closed-days-source
description: Planning Gantt must read closed-days (weekend/holiday) from real backend settings, not local mock
metadata:
  type: project
---

The Planning page Gantt (`src/components/specified/pages/planning/PlanningGantt.tsx`) originally read working-week + holidays from `src/hooks/useCalendarSettings.ts` — a **localStorage mock** defaulting to Mon–Fri + a fake holiday (day 21). That is why changing the working week (e.g. making Sat a working day, or adding Fri as off) did NOT reflect in the planning calendar.

Real source of truth (same as Settings → CalendarTab):
- `useGetWorkingDays()` → `working_days`: 7 bits, **ISO indexed Mon=0 … Sun=6**, 1 = working.
- `useGetCompanyHolidaysForMonth(Date)` → `CompanyHoliday[]` with `start_date`/`end_date`/`recurring` (recurring maps the year like CalendarTab does).

Closed-day = working_days[iso]!==1 OR date falls in a holiday range. JS dow→ISO: `(jsDow + 6) % 7`.

Closed days render as a light hatch BEHIND blocks; absence blocks **split into working-only segments** so gaps fall on closed columns (one logical absence, rendered multi-segment). See [[absence-normalized-count-policy]].
