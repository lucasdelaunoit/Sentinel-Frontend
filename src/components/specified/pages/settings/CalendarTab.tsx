import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import ComposedCard from "@/components/common/cards/ComposedCard";
import { Plus, Trash2, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import useUpdateCalendarSettings from "@/api/calendar/useUpdateCalendarSettings";
import useGetWorkingDays from "@/api/organization/useGetWorkingDays";
import useGetCompanyHolidays from "@/api/company-holidays/useGetCompanyHolidays";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday";
import CreateCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/CreateCompanyHolidaySheet";

// ISO weekday index: 0 = Mon, 6 = Sun. Matches backend working_days + preview.weekday.
const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SHORT_DOW = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" });
}

function todayIsoDate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function CalendarTab() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: workdays, isLoading: workdaysLoading } = useGetWorkingDays();
  const { data: allHolidays, isLoading: holidaysLoading } = useGetCompanyHolidays();
  const updateSettings = useUpdateCalendarSettings();
  const deleteHoliday = useDeleteCompanyHoliday();

  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);

  const workingDays = workdays?.working_days;
  const holidaysAll = allHolidays ?? [];

  const preview = useMemo<CalendarPreviewDay[]>(() => {
    if (!workingDays) return [];
    const daysInMonth = new Date(year, month, 0).getDate();
    const mm = String(month).padStart(2, "0");
    // Map month/day → holiday for fast lookup. Recurring matches any year.
    const holidayByMd = new Map<string, CompanyHoliday>();
    const holidayByDate = new Map<string, CompanyHoliday>();
    holidaysAll.forEach((h) => {
      const d = new Date(h.date);
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (h.recurring) holidayByMd.set(key, h);
      else holidayByDate.set(h.date, h);
    });
    const out: CalendarPreviewDay[] = [];
    for (let day = 1; day <= daysInMonth; day += 1) {
      const dd = String(day).padStart(2, "0");
      const date = `${year}-${mm}-${dd}`;
      const js = new Date(year, month - 1, day).getDay(); // 0=Sun..6=Sat
      const weekday = (js + 6) % 7; // 0=Mon..6=Sun
      const md = `${mm}-${dd}`;
      const isHoliday = holidayByDate.has(date) || holidayByMd.has(md);
      const status: CalendarDayStatus = isHoliday
        ? "holiday"
        : workingDays[weekday] === 1
          ? "working"
          : "off";
      out.push({ date, day, weekday, status });
    }
    return out;
  }, [workingDays, holidaysAll, year, month]);

  const workingDaysPerWeek = useMemo(
    () => (workingDays ? workingDays.reduce((a, b) => a + b, 0) : 0),
    [workingDays],
  );

  function shiftMonth(delta: number) {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setYear(y);
    setMonth(m);
  }

  function toggleWorkingDay(isoIndex: number) {
    if (!workingDays) return;
    const next = workingDays.map((bit, i) => (i === isoIndex ? (bit ? 0 : 1) : bit));
    updateSettings.mutate({ working_days: next });
  }

  if (workdaysLoading || holidaysLoading || !workingDays) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card h-72 animate-pulse" />
          <div className="rounded-2xl border border-border/60 bg-card h-72 animate-pulse" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-card h-32 animate-pulse" />
      </div>
    );
  }

  const monthLabel = formatMonthYear(year, month);
  const today = todayIsoDate();

  const holidays = holidaysAll;

  // Build 6×7 grid: pad leading nulls so column index matches ISO weekday of day 1.
  const firstWeekday = preview[0]?.weekday ?? 0;
  const cells: (CalendarPreviewDay | null)[] = Array(firstWeekday).fill(null);
  preview.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (CalendarPreviewDay | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <ComposedCard
          title={`${monthLabel} Preview`}
          action={
            <div className="flex items-center gap-1">
              <Button onClick={() => shiftMonth(-1)} size="sm" variant="ghost" className="size-7 p-0">
                <ChevronLeft className="size-4" />
              </Button>
              <Button onClick={() => shiftMonth(1)} size="sm" variant="ghost" className="size-7 p-0">
                <ChevronRight className="size-4" />
              </Button>
            </div>
          }
          headerClassName="mb-2"
        >
          <FieldDescription className="mb-3">Non-working days are dimmed.</FieldDescription>
          <div className="grid grid-cols-7 mb-1">
            {SHORT_DOW.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-muted-foreground/50 pb-1">
                {d}
              </div>
            ))}
          </div>
          <div className="space-y-1">
            {weeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 gap-0.5">
                {week.map((cell, di) => {
                  if (!cell) return <div key={di} />;
                  const isToday = cell.date === today;
                  return (
                    <div
                      key={di}
                      className={cn(
                        "h-7 flex items-center justify-center rounded-lg text-[11px] font-medium",
                        isToday && "ring-2 ring-primary",
                        cell.status === "holiday"
                          ? "bg-amber-100 text-amber-600 line-through"
                          : cell.status === "working"
                            ? "bg-muted/40 text-foreground"
                            : "text-muted-foreground/30",
                      )}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-muted/40" />
              <span className="text-[10px] text-muted-foreground">Working</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm bg-amber-100" />
              <span className="text-[10px] text-muted-foreground">Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2.5 rounded-sm border border-muted-foreground/20" />
              <span className="text-[10px] text-muted-foreground">Off</span>
            </div>
          </div>
        </ComposedCard>
        <ComposedCard
          title="Company Holidays"
          action={
            <>
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                {holidays.length}
              </span>
              <div className="flex-1" />
              <Button onClick={() => setHolidaySheetOpen(true)} className="gap-1.5">
                <Plus className="size-3.5" />
                Add Holiday
              </Button>
            </>
          }
          headerClassName="mb-4"
        >
          <FieldDescription className="mb-4">
            All company-wide days off. Blocked in the Leave Calendar and excluded from working-day counts.
          </FieldDescription>
          {holidays.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No holidays configured</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Add a company-specific day off to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40 border border-border/40 rounded-xl overflow-hidden">
              {holidays.map((h) => {
                const d = new Date(h.date);
                const dayNum = d.getDate();
                const dateLabel = h.recurring
                  ? `${d.toLocaleString("en-US", { month: "long", day: "numeric" })} (yearly)`
                  : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                const weekdayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
                return (
                  <div key={h.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/20 transition-colors">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 border border-amber-200 shrink-0">
                      <span className="text-[13px] font-bold text-amber-700">{dayNum}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">{h.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {dateLabel} · {weekdayLabel}
                      </p>
                    </div>
                    {h.recurring && (
                      <span className="text-[10px] font-medium bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        Recurring
                      </span>
                    )}
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      Day off
                    </span>
                    <Button
                      onClick={() => deleteHoliday.mutate(h.id)}
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground/50 hover:text-rose-500 h-7 w-7 p-0"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ComposedCard>
      </div>

      <ComposedCard title="Working Week" headerClassName="mb-2">
        <FieldDescription className="mb-4">Select which days are regular working days.</FieldDescription>
        <div className="flex gap-2 flex-wrap">
          {DOW_LABELS.map((label, i) => {
            const active = workingDays[i] === 1;
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleWorkingDay(i)}
                disabled={updateSettings.isPending}
                className={cn(
                  "size-11 rounded-xl text-[13px] font-semibold border-2 transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground border-transparent hover:border-border/60 hover:bg-muted",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted-foreground mt-3">
          {workingDaysPerWeek} working day{workingDaysPerWeek !== 1 ? "s" : ""} per week
        </p>
      </ComposedCard>

      <CreateCompanyHolidaySheet open={holidaySheetOpen} onOpenChange={setHolidaySheetOpen} />
    </div>
  );
}
