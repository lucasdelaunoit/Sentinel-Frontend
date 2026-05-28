import { useEffect, useMemo, useState } from "react";
import { Plus, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon, HourglassIcon, AirplaneTiltIcon, FirstAidKitIcon } from "@phosphor-icons/react";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import { TablePagination } from "@/components/common/table/TablePagination.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import { useTablePagination } from "@/hooks/useTablePagination.ts";
import { cn } from "@/lib/utils.ts";
import type { AbsenceItem, AbsenceType, AbsenceStatus } from "@/types/dashboard.ts";

interface UserAbsencesTabProps {
  userId: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

const ABSENCE_TYPE_STYLES: Record<AbsenceType, string> = {
  vacation: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60",
  sick: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
  conference: "bg-violet-50 text-violet-700 ring-1 ring-violet-200/60",
};
const ABSENCE_TYPE_LABELS: Record<AbsenceType, string> = {
  vacation: "Vacation",
  sick: "Sick leave",
  conference: "Conference",
};
const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  vacation: "bg-blue-500",
  sick: "bg-rose-500",
  conference: "bg-violet-500",
};
const ABSENCE_TYPE_CALENDAR_BG: Record<AbsenceType, string> = {
  vacation: "bg-blue-500/15 text-blue-700 ring-blue-300/60",
  sick: "bg-rose-500/15 text-rose-700 ring-rose-300/60",
  conference: "bg-violet-500/15 text-violet-700 ring-violet-300/60",
};
const ABSENCE_STATUS_STYLES: Record<AbsenceStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60",
  rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
};
const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function absenceDuration(start: string, end: string) {
  const days = Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
  return `${days}d`;
}

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

function pendingCount(absences: AbsenceItem[]) {
  return absences.filter((a) => a.status === "pending").length;
}

function daysByTypeYTD(absences: AbsenceItem[], type: AbsenceType) {
  const year = new Date().getFullYear();
  const yearStart = new Date(`${year}-01-01`).getTime();
  const yearEnd = new Date(`${year}-12-31`).getTime();
  return absences
    .filter((a) => a.type === type)
    .reduce((sum, a) => {
      const start = Math.max(new Date(a.start_date).getTime(), yearStart);
      const end = Math.min(new Date(a.end_date).getTime(), yearEnd);
      if (end < start) return sum;
      return sum + Math.round((end - start) / 86_400_000) + 1;
    }, 0);
}

/* ─── Stat chip ──────────────────────────────────────────── */

function StatChip({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-card border border-border/60 p-4 shadow-sm flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted/50 border border-border/40">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">{label}</p>
        {loading ? (
          <Skeleton className="h-5 w-10 mt-1" />
        ) : (
          <p className="text-[18px] font-bold text-foreground leading-tight mt-0.5">{value}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Mini calendar ──────────────────────────────────────── */

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

  const cells = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth(), absences),
    [cursor, absences],
  );

  const todayTs = new Date().setHours(0, 0, 0, 0);

  function shift(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
  }

  return (
    <ComposedCard
      title={`${MONTH_NAMES[cursor.getMonth()]} ${cursor.getFullYear()}`}
      action={
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => shift(-1)}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
            className="px-2 h-7 rounded-lg text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => shift(1)}
            className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      }
      headerClassName="mb-4"
    >
      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          const isToday = cell.date.setHours(0, 0, 0, 0) === todayTs;
          const hasAbsence = !!cell.absence;
          return (
            <button
              key={i}
              disabled={!hasAbsence}
              onClick={() => cell.absence && onDayClick(cell.absence)}
              className={cn(
                "size-7 mx-auto rounded-md flex items-center justify-center text-[11px] font-medium transition-all relative",
                !cell.inMonth && "text-muted-foreground/30",
                cell.inMonth && !hasAbsence && "text-foreground",
                hasAbsence && cell.inMonth && cn("ring-1 cursor-pointer hover:scale-105", ABSENCE_TYPE_CALENDAR_BG[cell.absence!.type]),
                hasAbsence && !cell.inMonth && cn("ring-1 opacity-50 cursor-pointer", ABSENCE_TYPE_CALENDAR_BG[cell.absence!.type]),
                isToday && "ring-2 ring-primary/60 font-bold",
              )}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {(Object.keys(ABSENCE_TYPE_DOT) as AbsenceType[]).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", ABSENCE_TYPE_DOT[t])} />
            {ABSENCE_TYPE_LABELS[t]}
          </span>
        ))}
      </div>
    </ComposedCard>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function UserAbsencesTab({ userId }: UserAbsencesTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAbsence, setDetailAbsence] = useState<AbsenceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { page, setPage, perPage, setPerPage } = useTablePagination(8, [debouncedSearch]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: absences, total, lastPage, from, to, isLoading, isError } = useGetAbsencesForUser(userId, {
    page,
    per_page: perPage,
    search: debouncedSearch || undefined,
  });

  const { data: allAbsences, isLoading: allLoading } = useGetAbsencesForUser(userId, { per_page: 100 });

  function openDetail(absence: AbsenceItem) {
    setDetailAbsence(absence);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* ── Top row: stats (left) + calendar (right) ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        <div className="grid grid-cols-2 gap-4">
          <StatChip icon={CalendarBlankIcon} label="Total Absences" value={total} loading={isLoading} />
          <StatChip
            icon={SunHorizonIcon}
            label={`Days absent — ${new Date().getFullYear()}`}
            value={daysThisYear(allAbsences)}
            loading={allLoading}
          />
          <StatChip
            icon={ClockCountdownIcon}
            label="Upcoming"
            value={upcomingCount(allAbsences)}
            loading={allLoading}
          />
          <StatChip
            icon={HourglassIcon}
            label="Pending approval"
            value={pendingCount(allAbsences)}
            loading={allLoading}
          />
          <StatChip
            icon={AirplaneTiltIcon}
            label="Vacation days YTD"
            value={daysByTypeYTD(allAbsences, "vacation")}
            loading={allLoading}
          />
          <StatChip
            icon={FirstAidKitIcon}
            label="Sick days YTD"
            value={daysByTypeYTD(allAbsences, "sick")}
            loading={allLoading}
          />
        </div>

        <div>
          {allLoading ? (
            <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 42 }).map((_, i) => (
                  <Skeleton key={i} className="size-7 mx-auto rounded-md" />
                ))}
              </div>
            </div>
          ) : (
            <MiniCalendar absences={allAbsences} onDayClick={openDetail} />
          )}
        </div>
      </div>

      {/* ── Full-width table ───────────────────────────────── */}
      <ComposedCard
          title="All absences"
          action={
            <>
              {!isLoading && (
                <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
                  {total}
                </span>
              )}
              <div className="flex-1" />
              <SearchBar value={search} onChange={setSearch} placeholder="Search…" size="sm" />
              <Button size="xs" variant="outline" className="gap-1.5 text-[10px]" onClick={() => setCreateOpen(true)}>
                <Plus className="size-3" />
                Add Absence
              </Button>
            </>
          }
          className="p-0 overflow-hidden"
          headerClassName="px-6 pt-5 pb-4 border-b border-border/60"
        >
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-b border-t border-border/60 bg-muted/30 hover:bg-muted/30">
                <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Type
                </TableHead>
                <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Period
                </TableHead>
                <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Duration
                </TableHead>
                <TableHead className="px-5 py-3.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Status
                </TableHead>
                <TableHead className="w-12 px-5 py-3.5" />
              </TableRow>
            </TableHeader>
            <TableBody className="[&_tr]:border-border/40">
              {isLoading ? (
                Array.from({ length: Math.min(perPage, 5) }).map((_, i) => (
                  <TableRow key={i} className="border-border/40">
                    <TableCell className="px-5 py-4"><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                    <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-44" /></TableCell>
                    <TableCell className="px-5 py-4"><Skeleton className="h-3.5 w-8" /></TableCell>
                    <TableCell className="px-5 py-4"><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                    <TableCell className="px-5 py-4"><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                    Failed to load absences. Check API connection.
                  </TableCell>
                </TableRow>
              ) : absences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-10 text-center">
                    <CalendarBlankIcon className="size-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[13px] text-muted-foreground">
                      {debouncedSearch ? "No absences match your search." : "No absences recorded."}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                absences.map((absence) => (
                  <TableRow
                    key={absence.id}
                    className="hover:bg-muted/20 transition-colors border-border/40 cursor-pointer"
                    onClick={() => openDetail(absence)}
                  >
                    <TableCell className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", ABSENCE_TYPE_STYLES[absence.type])}>
                        {ABSENCE_TYPE_LABELS[absence.type]}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] text-foreground whitespace-nowrap">
                      {fmtDate(absence.start_date)}
                      <span className="text-muted-foreground/50 mx-1.5">→</span>
                      {fmtDate(absence.end_date)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5 text-[12px] font-medium text-muted-foreground tabular-nums">
                      {absenceDuration(absence.start_date, absence.end_date)}
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", ABSENCE_STATUS_STYLES[absence.status])}>
                        {ABSENCE_STATUS_LABELS[absence.status]}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-3.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground/60 hover:text-primary h-7 w-7 p-0 rounded-lg hover:bg-primary/5"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDetail(absence);
                        }}
                      >
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!isLoading && !isError && total > 0 && (
            <TablePagination
              page={page}
              lastPage={lastPage}
              perPage={perPage}
              total={total}
              from={from}
              to={to}
              onPageChange={setPage}
              onPerPageChange={setPerPage}
            />
          )}
        </ComposedCard>

      <CreateAbsenceSheet open={createOpen} onOpenChange={setCreateOpen} userId={userId} />
      <AbsenceDetailSheet
        absence={detailAbsence}
        open={detailOpen}
        onOpenChange={(v) => {
          setDetailOpen(v);
          if (!v) setDetailAbsence(null);
        }}
        userId={userId}
      />
    </div>
  );
}
