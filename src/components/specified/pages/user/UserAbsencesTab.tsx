import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon, PlusIcon } from "@phosphor-icons/react";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Button } from "@/components/ui/button.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import StatCard from "@/components/common/cards/StatCard.tsx";
import SearchBar from "@/components/common/inputs/SearchBar.tsx";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import { cn } from "@/lib/utils.ts";
import type { AbsenceItem, AbsenceType, StatCardData } from "@/types/dashboard.ts";

interface UserAbsencesTabProps {
  userId: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const TYPE_FILTER_OPTIONS: FilterPillOption<AbsenceType | null>[] = [
  { value: null, label: "All" },
  { value: "vacation", label: "Vacation" },
  { value: "sick", label: "Sick" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  vacation: "bg-blue-500",
  sick: "bg-rose-500",
  conference: "bg-violet-500",
  personal: "bg-amber-500",
  other: "bg-slate-500",
};

const ABSENCE_TYPE_LABEL: Record<AbsenceType, string> = {
  vacation: "Vacation",
  sick: "Sick leave",
  conference: "Conference",
  personal: "Personal",
  other: "Other",
};

const ABSENCE_TYPE_CALENDAR_BG: Record<AbsenceType, string> = {
  vacation: "bg-blue-500/15 text-blue-700 ring-blue-300/60",
  sick: "bg-rose-500/15 text-rose-700 ring-rose-300/60",
  conference: "bg-violet-500/15 text-violet-700 ring-violet-300/60",
  personal: "bg-amber-500/15 text-amber-700 ring-amber-300/60",
  other: "bg-slate-500/15 text-slate-700 ring-slate-300/60",
};

const ABSENCE_TYPE_PILL_BG: Record<AbsenceType, string> = {
  vacation: "bg-blue-100",
  sick: "bg-rose-100",
  conference: "bg-violet-100",
  personal: "bg-amber-100",
  other: "bg-slate-100",
};

const ABSENCE_TYPE_DOT_BG: Record<AbsenceType, string> = {
  vacation: "bg-blue-500",
  sick: "bg-rose-500",
  conference: "bg-violet-500",
  personal: "bg-amber-500",
  other: "bg-slate-500",
};

const ABSENCE_TYPE_TEXT: Record<AbsenceType, string> = {
  vacation: "text-blue-700",
  sick: "text-rose-700",
  conference: "text-violet-700",
  personal: "text-amber-700",
  other: "text-slate-700",
};

/* ─── Helpers ────────────────────────────────────────────── */

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function absenceDuration(start: string, end: string) {
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86_400_000) + 1);
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
    const set = new Set<AbsenceType>();
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
    >
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
      <div className="grid grid-cols-7 gap-1.5">
        {cells.map((cell, i) => {
          const isToday = cell.date.setHours(0, 0, 0, 0) === todayTs;
          const hasAbsence = !!cell.absence;
          return (
            <button
              key={i}
              disabled={!hasAbsence}
              onClick={() => cell.absence && onDayClick(cell.absence)}
              className={cn(
                "h-9 mx-auto w-full rounded-md flex items-center justify-center text-[12px] font-medium transition-all",
                !cell.inMonth && "text-muted-foreground/30",
                cell.inMonth && !hasAbsence && "text-foreground/80",
                hasAbsence &&
                  cell.inMonth &&
                  cn("ring-1 cursor-pointer hover:scale-105", ABSENCE_TYPE_CALENDAR_BG[cell.absence!.type]),
                hasAbsence &&
                  !cell.inMonth &&
                  cn("ring-1 opacity-40 cursor-pointer", ABSENCE_TYPE_CALENDAR_BG[cell.absence!.type]),
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
          {presentTypes.map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span className={cn("size-2 rounded-full", ABSENCE_TYPE_DOT[t])} />
              {ABSENCE_TYPE_LABEL[t]}
            </span>
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

/* ─── Absence list card ──────────────────────────────────── */

const LIFECYCLE_PILL: Record<"upcoming" | "ongoing" | "past", string> = {
  upcoming: "border-amber-300 text-amber-700 bg-amber-50",
  ongoing: "border-emerald-300 text-emerald-700 bg-emerald-50",
  past: "border-border text-muted-foreground bg-muted/40",
};

function lifecycleKey(start: string, end: string): "upcoming" | "ongoing" | "past" {
  const today = new Date().setHours(0, 0, 0, 0);
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  if (today < s) return "upcoming";
  if (today > e) return "past";
  return "ongoing";
}

function shortDateLabel(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function dateRelativeLabel(date: string, kind: "upcoming" | "ongoing" | "past"): string {
  const today = new Date().setHours(0, 0, 0, 0);
  const t = new Date(date).setHours(0, 0, 0, 0);
  const diffDays = Math.round((t - today) / 86_400_000);
  if (kind === "ongoing") return "Today";
  if (kind === "upcoming") {
    if (diffDays === 1) return "Tomorrow";
    if (diffDays <= 7) return `In ${diffDays}d`;
    return `In ${diffDays}d`;
  }
  const past = Math.abs(diffDays);
  if (past <= 7) return `${past}d ago`;
  return `${past}d ago`;
}

function AbsenceListCard({ absence, onClick }: { absence: AbsenceItem; onClick: () => void }) {
  const days = absenceDuration(absence.start_date, absence.end_date);
  const lk = lifecycleKey(absence.start_date, absence.end_date);
  const anchorDate = lk === "past" ? absence.end_date : absence.start_date;
  const bullets: string[] = [];

  bullets.push(`${days} calendar day${days > 1 ? "s" : ""} of ${ABSENCE_TYPE_LABEL[absence.type].toLowerCase()}`);
  if (lk !== "past") {
    const back = new Date(absence.end_date);
    back.setDate(back.getDate() + 1);
    bullets.push(`Returns on ${fmtDate(back.toISOString())}`);
  }
  if (absence.reason) bullets.push(absence.reason);

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-stretch overflow-hidden rounded-xl border border-border/60 bg-card text-left transition-all",
        "hover:border-border hover:shadow-md",
      )}
    >
      {/* Left date strip */}
      <div className="flex flex-col items-center justify-center gap-1 px-5 py-5 shrink-0 bg-muted/40 border-r border-border/60 min-w-[96px]">
        <span className="text-[15px] font-bold text-foreground tabular-nums leading-none whitespace-nowrap">
          {shortDateLabel(anchorDate)}
        </span>
        <span className="text-[11px] text-muted-foreground leading-none">{dateRelativeLabel(anchorDate, lk)}</span>
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0 px-5 py-4 flex flex-col gap-2">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className={cn("text-[15px] font-bold leading-tight", ABSENCE_TYPE_TEXT[absence.type])}>
              {ABSENCE_TYPE_LABEL[absence.type]}
            </h4>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              {absence.reason ? absence.reason : "No reason provided"}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              LIFECYCLE_PILL[lk],
            )}
          >
            {lk}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Period</span>
          <span className="text-[14px] font-semibold tabular-nums text-foreground">{fmtDate(absence.start_date)}</span>
          <ArrowRight className="size-3.5 text-muted-foreground/60" />
          <span className="text-[14px] font-semibold tabular-nums text-foreground">{fmtDate(absence.end_date)}</span>
          <span
            className={cn(
              "ml-1 inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-bold tabular-nums",
              ABSENCE_TYPE_PILL_BG[absence.type],
              ABSENCE_TYPE_TEXT[absence.type],
            )}
          >
            +{days}d
          </span>
        </div>

        {/* Bullets */}
        <ul className="space-y-1 mt-0.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-[12.5px] text-foreground/85">
              <span className={cn("mt-1.5 size-1.5 rounded-full shrink-0", ABSENCE_TYPE_DOT_BG[absence.type])} />
              <span className="leading-snug">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
}

function AbsenceListCardSkeleton() {
  return (
    <div className="flex items-stretch overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="px-5 py-5 shrink-0 bg-muted/40 border-r border-border/60 min-w-[96px] flex flex-col items-center justify-center gap-1.5">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="flex-1 px-5 py-4 space-y-2.5">
        <div className="flex justify-between items-start gap-3">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-4 w-64" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3 w-72" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

export default function UserAbsencesTab({ userId }: UserAbsencesTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAbsence, setDetailAbsence] = useState<AbsenceItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AbsenceType | null>(null);

  const { data: allAbsences, isLoading } = useGetAbsencesForUser(userId, { per_page: 100 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allAbsences.filter((a) => {
      if (typeFilter && a.type !== typeFilter) return false;
      if (q && !(a.reason ?? "").toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allAbsences, search, typeFilter]);

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
          >
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 42 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-md" />
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
              ({isLoading ? "…" : filtered.length})
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
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <AbsenceListCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Feedback
            variant="warning"
            title={
              search || typeFilter ? "No absences match your filters." : "No absences recorded for this employee yet."
            }
            description={search || typeFilter ? undefined : "Log an absence to keep planning up to date."}
            className="h-64"
            action={
              !search && !typeFilter ? (
                <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 btn-press">
                  <PlusIcon className="size-3.5" weight="bold" />
                  Add first absence
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((absence) => (
              <AbsenceListCard key={absence.id} absence={absence} onClick={() => openDetail(absence)} />
            ))}
          </div>
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
