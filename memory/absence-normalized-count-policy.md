---
name: absence-normalized-count-policy
description: How absence working-day count reacts to calendar config changes (working week / holidays)
metadata:
  type: project
---

Absences carry two counts: **total_days** (raw calendar span, e.g. Mon→next Mon) and **normalized_days** (working days only — closed weekdays + company holidays removed).

Counting policy = **HYBRID** (chosen by user, an HR-correctness decision, not just code):
- While an absence is **upcoming / pending**, normalized_days is **live-recomputed** from the *current* calendar config (working week + holidays in effect for the absence's dates). Editing the working week or adding a holiday before the leave is taken re-counts it.
- Once the absence **starts or is approved**, a **snapshot** is frozen; later calendar edits never change that record.

**Why:** matches real leave systems — a not-yet-taken leave should reflect current policy; an already-taken/approved leave is a settled deal.

**Calendar-change confirmation (IMPLEMENTED):** When the working week or a holiday changes (workweek toggle, holiday create, holiday edit — NOT delete), the frontend first POSTs `/api/settings/calendar/impact` (`CalendarImpactService::previewForChange`) to list FUTURE fluid absences whose working-day count would change (before→after). A modal (`CalendarImpactDialog`, driven by `useCalendarChangeGuard`) lets the user pick per-absence **Recount** (follow new calendar) or **Keep** (freeze at current), with All-recount/All-keep bulk buttons. On apply, the kept ids go as `freeze_absence_ids` to the mutation; the manager calls `CalendarImpactService::freeze()` (snapshot at pre-change count) BEFORE persisting the change, inside the transaction. Recounted ones stay fluid → live recompute.

**How to apply:** IMPLEMENTED. Backend: `absences.normalized_days` (decimal snapshot) + `normalized_frozen_at` columns; `App\Services\AbsenceNormalizer` (singleton) resolves hybrid — live `compute()` while upcoming, freeze on first read once started; `App\Services\CalendarService::countWorkingHalfDays()` does the half-aware working-day math; `AbsenceResource` exposes `total_days` + `normalized_days`. Frontend `Absence` type carries both; Planning Gantt computes normalized live from real settings ([[planning-closed-days-source]]). NOTE: no approval column exists, so "freeze" trigger is purely time-based (start_date <= today).
