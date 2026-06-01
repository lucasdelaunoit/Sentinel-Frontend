import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import ComposedCard from "@/components/common/cards/ComposedCard";
import MediumCalendar from "@/components/common/calendar/MediumCalendar";
import { Plus, CalendarDays } from "lucide-react";
import MediumCompanyHolidayRow from "@/components/specified/models/companyHoliday/datas/MediumCompanyHolidayRow";
import useUpdateCalendarSettings from "@/api/calendar/useUpdateCalendarSettings";
import useGetWorkingDays from "@/api/organization/useGetWorkingDays";
import useGetCompanyHolidays from "@/api/company-holidays/useGetCompanyHolidays";
import useDeleteCompanyHoliday from "@/api/company-holidays/useDeleteCompanyHoliday";
import CreateCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/CreateCompanyHolidaySheet";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface HolidayEvent {
  holiday: CompanyHoliday;
  start: Date;
  end: Date;
}

export default function CalendarTab() {
  const { data: workdays, isLoading: workdaysLoading } = useGetWorkingDays();
  const { data: allHolidays, total: holidaysTotal, isLoading: holidaysLoading } = useGetCompanyHolidays();
  const updateSettings = useUpdateCalendarSettings();
  const deleteHoliday = useDeleteCompanyHoliday();

  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const workingDays = workdays?.working_days;
  const holidaysAll = allHolidays ?? [];

  const holidayEvents = useMemo<HolidayEvent[]>(() => {
    const year = cursor.getFullYear();
    return holidaysAll.map((h) => {
      const src = new Date(h.date);
      const y = h.recurring ? year : src.getFullYear();
      const date = new Date(y, src.getMonth(), src.getDate());
      return { holiday: h, start: date, end: date };
    });
  }, [holidaysAll, cursor]);

  const workingDaysPerWeek = useMemo(() => (workingDays ? workingDays.reduce((a, b) => a + b, 0) : 0), [workingDays]);

  function toggleWorkingDay(isoIndex: number) {
    if (!workingDays) return;
    const next = workingDays.map((bit, i) => (i === isoIndex ? (bit ? 0 : 1) : bit));
    updateSettings.mutate({ working_days: next });
  }

  function dayClassName(date: Date): string | undefined {
    if (!workingDays) return undefined;
    const weekday = (date.getDay() + 6) % 7;
    return workingDays[weekday] === 1 ? "bg-muted/40 text-foreground" : "text-muted-foreground/30";
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

  const holidays = holidaysAll;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <MediumCalendar<HolidayEvent>
          events={holidayEvents}
          getKey={(e) => e.holiday.id}
          getRange={(e) => ({ start: e.start, end: e.end })}
          getCellClassName={() => "bg-amber-100 text-amber-600 line-through border border-amber-200"}
          getDayClassName={dayClassName}
          month={cursor}
          onMonthChange={setCursor}
          footer={
            <div className="flex items-center gap-4">
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
          }
        />
        <ComposedCard
          title={
            <div className="flex items-center gap-2">
              <span>Company Holidays</span>
              <CountDisplay isLoading={holidaysLoading} count={holidaysTotal} />
            </div>
          }
          action={
            <Button onClick={() => setHolidaySheetOpen(true)} className="gap-1.5">
              <Plus className="size-3.5" />
              Add Holiday
            </Button>
          }
        >
          {holidays.length === 0 ? (
            <div className="py-10 text-center">
              <CalendarDays className="size-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-[13px] text-muted-foreground">No holidays configured</p>
              <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                Add a company-specific day off to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-0.5">
              {holidays.map((h) => (
                <MediumCompanyHolidayRow key={h.id} holiday={h} onDelete={(id) => deleteHoliday.mutate(id)} />
              ))}
            </div>
          )}
        </ComposedCard>
      </div>

      <ComposedCard
        title="Working Week"
        action={
          <span className="text-xs text-secondary-foreground ml-auto">
            <span className="font-semibold tabular-nums">{workingDaysPerWeek}</span> / 7 active
          </span>
        }
        headerClassName="mb-2"
      >
        <FieldDescription className="mb-5">Select which days are regular working days.</FieldDescription>
        <div className="grid grid-cols-7 gap-2">
          {DOW_LABELS.map((label, i) => {
            const active = workingDays[i] === 1;
            const isWeekend = i >= 5;
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleWorkingDay(i)}
                disabled={updateSettings.isPending}
                className={cn(
                  "h-14 rounded-2xl text-[13px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary/40 hover:bg-primary/90"
                    : cn(
                        "bg-transparent border border-dashed hover:bg-muted/40 hover:text-foreground",
                        isWeekend
                          ? "border-border/40 text-muted-foreground/50"
                          : "border-border/70 text-muted-foreground",
                      ),
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </ComposedCard>

      <CreateCompanyHolidaySheet open={holidaySheetOpen} onOpenChange={setHolidaySheetOpen} />
    </div>
  );
}
