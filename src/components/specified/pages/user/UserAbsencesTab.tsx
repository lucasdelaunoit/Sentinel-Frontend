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
import AbsenceTypeBadge from "@/components/specified/models/absence/badges/AbsenceTypeBadge.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import { cn } from "@/lib/utils.ts";
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

const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500",
  [AbsenceType.Conference]: "bg-violet-500",
  [AbsenceType.Training]: "bg-amber-500",
  [AbsenceType.Parental]: "bg-emerald-500",
  [AbsenceType.Sabbatical]: "bg-indigo-500",
  [AbsenceType.Other]: "bg-slate-500",
};

const ABSENCE_TYPE_CALENDAR_BG: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500/15 text-blue-700 ring-blue-300/60",
  [AbsenceType.Conference]: "bg-violet-500/15 text-violet-700 ring-violet-300/60",
  [AbsenceType.Training]: "bg-amber-500/15 text-amber-700 ring-amber-300/60",
  [AbsenceType.Parental]: "bg-emerald-500/15 text-emerald-700 ring-emerald-300/60",
  [AbsenceType.Sabbatical]: "bg-indigo-500/15 text-indigo-700 ring-indigo-300/60",
  [AbsenceType.Other]: "bg-slate-500/15 text-slate-700 ring-slate-300/60",
};

const ABSENCE_TYPE_PILL_BG: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-100",
  [AbsenceType.Conference]: "bg-violet-100",
  [AbsenceType.Training]: "bg-amber-100",
  [AbsenceType.Parental]: "bg-emerald-100",
  [AbsenceType.Sabbatical]: "bg-indigo-100",
  [AbsenceType.Other]: "bg-slate-100",
};

const ABSENCE_TYPE_DOT_BG: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500",
  [AbsenceType.Conference]: "bg-violet-500",
  [AbsenceType.Training]: "bg-amber-500",
  [AbsenceType.Parental]: "bg-emerald-500",
  [AbsenceType.Sabbatical]: "bg-indigo-500",
  [AbsenceType.Other]: "bg-slate-500",
};

const ABSENCE_TYPE_TEXT: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "text-blue-700",
  [AbsenceType.Conference]: "text-violet-700",
  [AbsenceType.Training]: "text-amber-700",
  [AbsenceType.Parental]: "text-emerald-700",
  [AbsenceType.Sabbatical]: "text-indigo-700",
  [AbsenceType.Other]: "text-slate-700",
};

const NEUTRAL = {
  dot: "bg-muted-foreground",
  calendarBg: "bg-muted text-muted-foreground ring-border/60",
  pillBg: "bg-muted",
  text: "text-muted-foreground",
  label: "Unspecified",
};

function typeDot(t: AbsenceType | null) { return t ? ABSENCE_TYPE_DOT[t] : NEUTRAL.dot; }
function typeCalendarBg(t: AbsenceType | null) { return t ? ABSENCE_TYPE_CALENDAR_BG[t] : NEUTRAL.calendarBg; }
function typePillBg(t: AbsenceType | null) { return t ? ABSENCE_TYPE_PILL_BG[t] : NEUTRAL.pillBg; }
function typeDotBg(t: AbsenceType | null) { return t ? ABSENCE_TYPE_DOT_BG[t] : NEUTRAL.dot; }
function typeText(t: AbsenceType | null) { return t ? ABSENCE_TYPE_TEXT[t] : NEUTRAL.text; }
function typeLabel(t: AbsenceType | null) { return t ? ABSENCE_TYPE_LABEL[t] : NEUTRAL.label; }

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

  if (lk !== "past") {
    const back = new Date(absence.end_date);
    back.setDate(back.getDate() + 1);
    bullets.push(`Returns on ${fmtDate(back.toISOString())}`);
  }
  if (absence.reason) bullets.push(absence.reason);

  return (
    <button
      onClick={onClick}
      className="group flex w-full gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5 text-left transition-all hover:border-border hover:bg-muted/20"
    >
      {/* Date tile */}
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/40 py-2 text-center">
        <span className="text-[13px] font-bold leading-tight text-foreground whitespace-nowrap">
          {shortDateLabel(anchorDate)}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          {dateRelativeLabel(anchorDate, lk)}
        </span>
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <AbsenceTypeBadge type={absence.type} />
            </div>
            <p className="mt-1 truncate text-[11px] text-muted-foreground">
              {absence.reason ?? "No reason provided"}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              LIFECYCLE_PILL[lk],
            )}
          >
            {lk}
          </span>
        </div>

        {/* Meta row — dates + duration */}
        <div className="mb-1.5 flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Period</span>
          <span className="text-[12px] font-semibold tabular-nums text-foreground">
            {fmtDate(absence.start_date)}
          </span>
          <ArrowRight className="size-3 text-muted-foreground/60" />
          <span className="text-[12px] font-semibold tabular-nums text-foreground">
            {fmtDate(absence.end_date)}
          </span>
          <span
            className={cn(
              "rounded px-1 py-0.5 text-[10px] font-bold tabular-nums",
              typePillBg(absence.type),
              typeText(absence.type),
            )}
          >
            {days}d
          </span>
        </div>

        {/* Bullets */}
        {bullets.length > 0 && (
          <ul className="space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                <span className={cn("mt-1.5 size-1 shrink-0 rounded-full", typeDotBg(absence.type))} />
                <span className="leading-snug">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </button>
  );
}

function AbsenceListCardSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5">
      <Skeleton className="size-14 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
