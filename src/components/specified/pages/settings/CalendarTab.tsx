import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FieldDescription } from "@/components/ui/field";
import ComposedCard from "@/components/common/cards/ComposedCard";
import MediumCalendar from "@/components/common/calendar/MediumCalendar";
import { Plus } from "lucide-react";
import Feedback from "@/components/common/feedbacks/Feedback";
import MediumCompanyHolidayRow from "@/components/specified/models/companyHoliday/datas/MediumCompanyHolidayRow";
import useUpdateCalendarSettings from "@/api/calendar/useUpdateCalendarSettings";
import useGetWorkingDays from "@/api/organization/useGetWorkingDays";
import useGetCompanyHolidays from "@/api/company-holidays/useGetCompanyHolidays";
import CreateCompanyHolidaySheet from "@/components/specified/models/companyHoliday/sheets/CreateCompanyHolidaySheet";
import CompanyHolidayDetailSheet from "@/components/specified/models/companyHoliday/sheets/CompanyHolidayDetailSheet";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import DataPagination from "@/components/common/pagination/DataPagination";

const DOW_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOLIDAYS_PER_PAGE = 8;

interface HolidayEvent {
  holiday: CompanyHoliday;
  start: Date;
  end: Date;
}

export default function CalendarTab() {
  const { data: workdays, isLoading: workdaysLoading } = useGetWorkingDays();
  const { data: allHolidays, total: holidaysTotal, isLoading: holidaysLoading } = useGetCompanyHolidays();
  const updateSettings = useUpdateCalendarSettings();

  const [holidaySheetOpen, setHolidaySheetOpen] = useState(false);
  const [detailHoliday, setDetailHoliday] = useState<CompanyHoliday | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [holidaysPage, setHolidaysPage] = useState(1);
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const workingDays = workdays?.working_days;
  const holidaysAll = allHolidays ?? [];

  const holidayEvents = useMemo<HolidayEvent[]>(() => {
    const year = cursor.getFullYear();
    return holidaysAll.map((h) => {
      const srcStart = new Date(h.start_date);
      const srcEnd = new Date(h.end_date);
      const startY = h.recurring ? year : srcStart.getFullYear();
      const endY = h.recurring ? year + (srcEnd.getFullYear() - srcStart.getFullYear()) : srcEnd.getFullYear();
      const start = new Date(startY, srcStart.getMonth(), srcStart.getDate());
      const end = new Date(endY, srcEnd.getMonth(), srcEnd.getDate());
      return { holiday: h, start, end };
    });
  }, [holidaysAll, cursor]);

  const workingDaysPerWeek = useMemo(() => (workingDays ? workingDays.reduce((a, b) => a + b, 0) : 0), [workingDays]);

  function openHolidayDetail(event: HolidayEvent) {
    setDetailHoliday(event.holiday);
    setDetailOpen(true);
  }

  function toggleWorkingDay(isoIndex: number) {
    if (!workingDays) return;
    const next = workingDays.map((bit, i) => (i === isoIndex ? (bit ? 0 : 1) : bit));
    updateSettings.mutate({ working_days: next });
  }

  function dayClassName(date: Date): string | undefined {
    if (!workingDays) return undefined;
    const weekday = (date.getDay() + 6) % 7;
    return workingDays[weekday] === 1 ? "bg-tertiary text-foreground" : "text-muted-foreground/30";
  }

  const holidaysTotalPages = Math.max(1, Math.ceil(holidaysAll.length / HOLIDAYS_PER_PAGE));
  const safeHolidaysPage = Math.min(holidaysPage, holidaysTotalPages);
  const holidaysPageStart = (safeHolidaysPage - 1) * HOLIDAYS_PER_PAGE;
  const holidays = holidaysAll.slice(holidaysPageStart, holidaysPageStart + HOLIDAYS_PER_PAGE);

  if (workdaysLoading || holidaysLoading || !workingDays) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <MediumCalendar.Skeleton />
          <ComposedCard
            title={
              <div className="flex items-center gap-2">
                <span>Company Holidays</span>
                <CountDisplay isLoading count={0} />
              </div>
            }
            action={<Button disabled className="gap-1.5 opacity-60"><Plus className="size-3.5" />Add Holiday</Button>}
            className="min-h-[500px]"
          >
            <div className="space-y-4 p-0.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <MediumCompanyHolidayRow.Skeleton key={i} />
              ))}
            </div>
          </ComposedCard>
        </div>
        <ComposedCard
          title="Working Week"
          action={<Skeleton className="h-4 w-16" />}
        >
          <FieldDescription className="mb-4 mt-2">Select which days are regular working days.</FieldDescription>
          <div className="flex flex-wrap gap-2">
            {DOW_LABELS.map((label) => (
              <Skeleton key={label} className="h-8 w-12 rounded-lg" />
            ))}
          </div>
        </ComposedCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <MediumCalendar<HolidayEvent>
          events={holidayEvents}
          getKey={(e) => e.holiday.id}
          getRange={(e) => ({ start: e.start, end: e.end })}
          getCellClassName={() => "bg-success text-background font-bold"}
          getDayClassName={dayClassName}
          month={cursor}
          onMonthChange={setCursor}
          onEventClick={openHolidayDetail}
          footer={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-tertiary border border-border" />
                <span className="text-[10px] text-muted-foreground">Working</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="size-2.5 rounded-sm bg-success" />
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
          className="min-h-[500px]"
        >
          {holidays.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <Feedback
                variant="neutral"
                title="No holidays configured"
                description="Add a company-specific day off to get started."
              />
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="space-y-4 p-0.5 flex-1">
                {holidays.map((h) => (
                  <MediumCompanyHolidayRow
                    key={h.id}
                    holiday={h}
                    onClick={() => {
                      setDetailHoliday(h);
                      setDetailOpen(true);
                    }}
                  />
                ))}
              </div>
              <DataPagination
                page={safeHolidaysPage}
                totalPages={holidaysTotalPages}
                onPageChange={setHolidaysPage}
              />
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
      >
        <FieldDescription className="mb-4 mt-2">Select which days are regular working days.</FieldDescription>
        <div className="flex flex-wrap gap-2">
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
                  "h-8 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 ring-1 ring-primary/40 hover:bg-primary/90"
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
      {detailHoliday ? (
        <CompanyHolidayDetailSheet
          holiday={detailHoliday}
          open={detailOpen}
          onOpenChange={(v) => {
            setDetailOpen(v);
            if (!v) setDetailHoliday(null);
          }}
        />
      ) : (
        <CompanyHolidayDetailSheet.Skeleton open={detailOpen} onOpenChange={setDetailOpen} />
      )}
    </div>
  );
}
