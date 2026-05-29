import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon, PlusIcon } from "@phosphor-icons/react";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import StatCard from "@/components/common/cards/StatCard.tsx";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumAbsenceCard from "@/components/specified/models/absence/datas/MediumAbsenceCard.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import { cn } from "@/lib/utils.ts";
import { typeCalendarBg, typeDot, typeLabel } from "@/utils/absence/typeStyles.ts";
import { fmtDate } from "@/utils/absence/lifecycle.ts";
import type { StatCardData } from "@/types/dashboard.ts";
import { AbsenceType, ABSENCE_TYPE_LABEL, ABSENCE_TYPE_VALUES, type AbsenceItem } from "@/types/absence";

interface UserAbsencesTabProps {
  userId: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const TYPE_FILTER_OPTIONS: FilterPillOption<AbsenceType | null>[] = [
  { value: null, label: "All" },
  ...ABSENCE_TYPE_VALUES.map((value) => ({ value, label: ABSENCE_TYPE_LABEL[value] })),
];

/* ─── Helpers ────────────────────────────────────────────── */

function daysThisYear(absences: AbsenceItem[]) {
  const year = new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01`).getTime();
  const yearEnd = new Date(`${year}-12-31`).getTime();
  return absences.reduce((sum, a) => {
    const start = Math.max(new Date(a.start_date).getTime(), yearStart);
    const end = Math.min(new Date(a.end_date).getTime(), yearEnd);
    if (end < start) return sum;
    return sum + Math.round((end - start) / 86_400_000) + 1;
  }, 0);
}

function upcomingCount(absences: AbsenceItem[]) {
  const today = new Date().setHours(0, 0, 0, 0);
  return absences.filter((a) => new Date(a.start_date).getTime() > today).length;
}

/* ─── Stat helpers ───────────────────────────────────────── */

function makeStat(value: number | string, insight?: string | null, severity: Severity = "ok"): StatCardData {
  return {
    value: String(value),
    severity,
    change: "",
    hint: null,
    raw: typeof value === "number" ? value : null,
    insight: insight ?? null,
  };
}

function nextAbsenceLabel(absences: AbsenceItem[]): string | null {
  const today = new Date().setHours(0, 0, 0, 0);
  const future = absences
    .filter((a) => new Date(a.start_date).getTime() > today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  if (!future.length) return null;
  const next = future[0];
  return `next: ${fmtDate(next.start_date)}`;
}

/* ─── Mini calendar ──────────────────────────────────────── */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
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

interface DayCell {
  date: Date;
  inMonth: boolean;
  absence?: AbsenceItem;
}

function buildMonthGrid(year: number, month: number, absences: AbsenceItem[]): DayCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = (firstOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startWeekday);

  const cells: DayCell[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    const ts = d.setHours(12, 0, 0, 0);
    const hit = absences.find((a) => {
      const s = new Date(a.start_date).setHours(0, 0, 0, 0);
      const e = new Date(a.end_date).setHours(23, 59, 59, 999);
      return ts >= s && ts <= e;
    });
    cells.push({ date: new Date(d), inMonth: d.getMonth() === month, absence: hit });
  }
  return cells;
}

function MiniCalendar({
  absences,
  onDayClick,
}: {
  absences: AbsenceItem[];
  onDayClick: (absence: AbsenceItem) => void;
}) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const cells = useMemo(() => buildMonthGrid(cursor.getFullYear(), cursor.getMonth(), absences), [cursor, absences]);

  const todayTs = new Date().setHours(0, 0, 0, 0);
  const presentTypes = useMemo(() => {
    const set = new Set<AbsenceType | null>();
    absences.forEach((a) => set.add(a.type));
    return Array.from(set);
  }, [absences]);

  function shift(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <ComposedCard
      title={
        <span className="text-[14px] font-semibold tabular-nums">
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </span>
      }
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={() => shift(-1)}
            className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-2 h-7 rounded-md text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      }
      headerClassName="mb-3"
      className="h-full"
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 gap-1.5 mb-1">
          {WEEKDAYS.map((d) => (
            <div
              key={d}
              className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-1.5 flex-1 min-h-[200px]">
          {cells.map((cell, i) => {
            const isToday = cell.date.setHours(0, 0, 0, 0) === todayTs;
            const hasAbsence = !!cell.absence;
            return (
              <button
                key={i}
                disabled={!hasAbsence}
                onClick={() => cell.absence && onDayClick(cell.absence)}
                className={cn(
                  "h-full w-full rounded-md flex items-center justify-center text-[12px] font-medium transition-all",
                  !cell.inMonth && "text-muted-foreground/30",
                  cell.inMonth && !hasAbsence && "text-foreground/80",
                  hasAbsence &&
                    cell.inMonth &&
                    cn("ring-1 cursor-pointer hover:scale-105", typeCalendarBg(cell.absence!.type)),
                  hasAbsence &&
                    !cell.inMonth &&
                    cn("ring-1 opacity-40 cursor-pointer", typeCalendarBg(cell.absence!.type)),
                  isToday && "ring-2 ring-primary/70 font-bold",
                )}
              >
                {cell.date.getDate()}
              </button>
            );
          })}
        </div>

        {/* Legend (only types actually present) */}
        {presentTypes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
            {presentTypes.map((t, i) => (
              <span key={t ?? `unk-${i}`} className="flex items-center gap-1.5">
                <span className={cn("size-2 rounded-full", typeDot(t))} />
                {typeLabel(t)}
              </span>
            ))}
          </div>
        )}
      </div>
    </ComposedCard>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function UserAbsencesTab({ userId }: UserAbsencesTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAbsence, setDetailAbsence] = useState<AbsenceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AbsenceType | null>(null);

  const { data: allAbsences, isLoading } = useGetAbsencesForUser(userId, {
    per_page: 100,
    filters: typeFilter ? [{ field: "type", value: typeFilter }] : undefined,
  });

  function openDetail(absence: AbsenceItem) {
    setDetailAbsence(absence);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* ── Top row: stats column + calendar ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-4 items-stretch">
        <div className="flex flex-col gap-3 h-full">
          <StatCard
            title="Total absences"
            icon={CalendarBlankIcon}
            card={makeStat(allAbsences.length, allAbsences.length === 0 ? "no records yet" : "all-time")}
            isLoading={isLoading}
            className="flex-1"
          />
          <StatCard
            title={`Days off — ${new Date().getFullYear()}`}
            icon={SunHorizonIcon}
            card={makeStat(daysThisYear(allAbsences), "year-to-date")}
            isLoading={isLoading}
            className="flex-1"
          />
          <StatCard
            title="Upcoming"
            icon={ClockCountdownIcon}
            card={makeStat(
              upcomingCount(allAbsences),
              nextAbsenceLabel(allAbsences) ?? "none scheduled",
              upcomingCount(allAbsences) > 0 ? "warning" : "ok",
            )}
            isLoading={isLoading}
            className="flex-1"
          />
        </div>

        {isLoading ? (
          <ComposedCard
            title={<Skeleton className="h-5 w-32" />}
            action={<Skeleton className="h-7 w-20 rounded-md" />}
            headerClassName="mb-3"
            className="h-full"
          >
            <div className="grid grid-cols-7 grid-rows-6 gap-1.5 h-full min-h-[200px]">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-full w-full rounded-md" />
              ))}
            </div>
          </ComposedCard>
        ) : (
          <MiniCalendar absences={allAbsences} onDayClick={openDetail} />
        )}
      </div>

      {/* ── Cards list inside ComposedCard ───────────────── */}
      <ComposedCard
        title={
          <div className="flex items-center gap-2">
            <span>All absences</span>
            <span className="text-[12px] font-normal text-muted-foreground tabular-nums">
              ({isLoading ? "…" : allAbsences.length})
            </span>
          </div>
        }
        action={
          <div className="flex items-center gap-2">
            <FilterPillGroup options={TYPE_FILTER_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              disabled={!userId}
              className="gap-1.5 h-9 px-3 text-[12px] font-medium rounded-lg btn-press"
            >
              <PlusIcon className="size-3.5" weight="bold" />
              Add a absence
            </Button>
          </div>
        }
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <MediumAbsenceCard.Skeleton key={i} />
            ))}
          </div>
        ) : allAbsences.length === 0 ? (
          <Feedback
            variant="warning"
            title={typeFilter ? "No absences match your filters." : "No absences recorded for this employee yet."}
            description={
              typeFilter
                ? "Try clearing the type filter or selecting a different category to see more results."
                : "Log an absence to keep planning up to date."
            }
            className="h-64"
            action={
              !typeFilter && (
                <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
                  <PlusIcon className="size-3.5" weight="bold" />
                  Add first absence
                </Button>
              )
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allAbsences.map((absence) => (
              <MediumAbsenceCard key={absence.id} absence={absence} userId={userId} />
            ))}
          </div>
        )}
      </ComposedCard>

      <CreateAbsenceSheet open={createOpen} onOpenChange={setCreateOpen} userId={userId} />
      {detailAbsence ? (
        <AbsenceDetailSheet
          absence={detailAbsence}
          open={detailOpen}
          onOpenChange={(v) => {
            setDetailOpen(v);
            if (!v) setDetailAbsence(null);
          }}
          userId={userId}
        />
      ) : (
        <AbsenceDetailSheet.Skeleton open={detailOpen} onOpenChange={setDetailOpen} />
      )}
    </div>
  );
}
