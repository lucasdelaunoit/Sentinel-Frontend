import { useState } from "react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon, PlusIcon } from "@phosphor-icons/react";
import useGetAbsencesForUser from "@/api/absence/useGetAbsencesForUser.ts";
import useGetUserAbsenceStats from "@/api/absence/useGetUserAbsenceStats.ts";
import { Button } from "@/components/ui/button.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import StatCard from "@/components/common/cards/StatCard.tsx";
import FilterPillGroup, { type FilterPillOption } from "@/components/common/filters/FilterPillGroup.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumAbsenceCard from "@/components/specified/models/absence/datas/MediumAbsenceCard.tsx";
import CreateAbsenceSheet from "@/components/specified/models/absence/sheets/CreateAbsenceSheet.tsx";
import AbsenceDetailSheet from "@/components/specified/models/absence/sheets/AbsenceDetailSheet.tsx";
import MediumCalendar from "@/components/common/calendar/MediumCalendar.tsx";
import { ABSENCE_TYPE_LABEL, ABSENCE_TYPE_VALUES } from "@/utils/absence/absenceType.ts";
import { dayCoverage } from "@/utils/absence/halfDay.ts";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";

interface UserAbsencesTabProps {
  userId: string;
}

/* ─── Constants ──────────────────────────────────────────── */

const TYPE_FILTER_OPTIONS: FilterPillOption<AbsenceType | null>[] = [
  { value: null, label: "All" },
  ...ABSENCE_TYPE_VALUES.map((value) => ({ value, label: ABSENCE_TYPE_LABEL[value] })),
];

/* ─── Main component ─────────────────────────────────────── */

export default function UserAbsencesTab({ userId }: UserAbsencesTabProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [detailAbsence, setDetailAbsence] = useState<Absence | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<AbsenceType | null>(null);

  const { data: allAbsences, isLoading } = useGetAbsencesForUser(userId, {
    per_page: 100,
    filters: typeFilter ? [{ field: "type", value: typeFilter }] : undefined,
  });

  const { data: stats, isLoading: isStatsLoading } = useGetUserAbsenceStats(userId);

  function openDetail(absence: Absence) {
    setDetailAbsence(absence);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* ── Top row: stats column + calendar ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(240px,300px)_1fr] gap-4 items-stretch">
        <div className="flex flex-col gap-3 h-full">
          {isStatsLoading || !stats ? (
            <>
              <StatCard.Skeleton title="Total absences" icon={CalendarBlankIcon} className="flex-1" />
              <StatCard.Skeleton
                title={`Days off — ${new Date().getFullYear()}`}
                icon={SunHorizonIcon}
                className="flex-1"
              />
              <StatCard.Skeleton title="Upcoming" icon={ClockCountdownIcon} className="flex-1" />
            </>
          ) : (
            <>
              <StatCard
                title="Total absences"
                icon={CalendarBlankIcon}
                card={stats.total_absences}
                className="flex-1"
              />
              <StatCard
                title={`Days off — ${new Date().getFullYear()}`}
                icon={SunHorizonIcon}
                card={stats.days_off}
                className="flex-1"
              />
              <StatCard title="Upcoming" icon={ClockCountdownIcon} card={stats.upcoming} className="flex-1" />
            </>
          )}
        </div>

        {isLoading ? (
          <MediumCalendar.Skeleton />
        ) : (
          <MediumCalendar
            events={allAbsences}
            getKey={(a) => a.id}
            getRange={(a) => ({ start: a.start_date, end: a.end_date })}
            getDayCoverage={(a, date) => dayCoverage(a, date) ?? "full"}
            onEventClick={openDetail}
          />
        )}
      </div>

      {/* ── Cards list inside ComposedCard ───────────────── */}
      <ComposedCard
        title={
          <div className="flex items-center gap-2">
            <span>All absences</span>
            {isLoading ? <CountDisplay.Skeleton /> : <CountDisplay count={allAbsences.length} />}
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
