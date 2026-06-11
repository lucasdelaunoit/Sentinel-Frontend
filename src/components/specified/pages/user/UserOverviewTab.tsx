import { ShieldAlert } from "lucide-react";
import {
  SunHorizonIcon,
  ClockCountdownIcon,
  ShieldWarningIcon,
  WarningIcon,
  GitBranchIcon,
  UsersThreeIcon,
  LightbulbIcon,
  type Icon,
} from "@phosphor-icons/react";
import useGetUserRecommendations from "@/api/user/useGetUserRecommendations.ts";
import useGetAbsencesForUser from "@/api/absence/useGetAbsencesForUser.ts";
import useGetUserAbsenceStats from "@/api/absence/useGetUserAbsenceStats.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import MediumAbsenceCard from "@/components/specified/models/absence/datas/MediumAbsenceCard.tsx";
import MediumRecommendationRow from "@/components/specified/models/recommendation/datas/MediumRecommendationRow.tsx";
import DataDisplay from "@/components/common/data/DataDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { cn } from "@/lib/utils.ts";
import type { StatCardData, UserRecommendationIcon } from "@/types/dashboard";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";

interface UserOverviewTabProps {
  userId: string;
  onViewAbsences?: () => void;
}

/* ─── Constants ──────────────────────────────────────────── */

const RECOMMENDATION_ICONS: Record<UserRecommendationIcon, Icon> = {
  "shield-alert": ShieldWarningIcon,
  "alert-triangle": WarningIcon,
  "git-branch": GitBranchIcon,
  users: UsersThreeIcon,
  lightbulb: LightbulbIcon,
};

/* ─── Helpers ────────────────────────────────────────────── */

function critLabel(score: number) {
  if (score >= 70)
    return { label: "High Criticality", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  if (score >= 40)
    return { label: "Medium Criticality", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Low Criticality", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
}

/* ─── CriticalityHeadline ────────────────────────────────── */

interface CriticalityHeadlineProps {
  card: StatCardData;
}

function CriticalityHeadline({ card }: CriticalityHeadlineProps) {
  const score = card.value_raw ?? card.raw ?? 0;
  const tone = critLabel(score);

  return (
    <div className={cn("rounded-xl border px-5 py-4", tone.bg, tone.border)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className={cn("size-4 shrink-0", tone.color)} />
          <div>
            <p className={cn("text-[13px] font-semibold", tone.color)}>{tone.label}</p>
            <p className="text-[11px] text-muted-foreground">Composite criticality score</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={cn("text-[32px] font-bold tabular-nums leading-none", tone.color)}>{score}</span>
          <span className="text-[11px] text-muted-foreground/70 font-medium">/100</span>
        </div>
      </div>
      {card.insight && <p className={cn("mt-3 text-[11px] font-medium", tone.color)}>{card.insight}</p>}
    </div>
  );
}

CriticalityHeadline.Skeleton = function CriticalityHeadlineSkeleton() {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-4 rounded" />
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="mt-3 h-3 w-40" />
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */

export default function UserOverviewTab({ userId, onViewAbsences }: UserOverviewTabProps) {
  const { data: recommendations = [], isLoading: recsLoading } = useGetUserRecommendations(userId);
  const {
    data: upcomingAbsences,
    total: upcomingTotal,
    isLoading: absencesLoading,
  } = useGetAbsencesForUser(userId, {
    per_page: 4,
    filters: [{ field: "upcoming", value: true }],
    sorts: [{ field: "start_date", direction: "asc" }],
  });
  const { data: absenceStats, isLoading: absenceStatsLoading } = useGetUserAbsenceStats(userId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* ── Left column ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Recommendations */}
        <ComposedCard title="Recommendations">
          <div className="space-y-2.5">
            {recsLoading ? (
              <>
                <MediumRecommendationRow.Skeleton />
                <MediumRecommendationRow.Skeleton />
              </>
            ) : (
              recommendations.map((rec) => (
                <MediumRecommendationRow
                  key={rec.id}
                  icon={RECOMMENDATION_ICONS[rec.icon] ?? LightbulbIcon}
                  title={rec.title}
                  recommendation={rec.description}
                  severity={rec.severity}
                  priority={rec.priority}
                />
              ))
            )}
          </div>
        </ComposedCard>
      </div>

      {/* ── Right column ─────────────────────────────────── */}
      <ComposedCard
        title={
          <div className="flex items-center gap-2">
            <span>Absences</span>
            {absencesLoading ? <CountDisplay.Skeleton /> : <CountDisplay count={upcomingTotal} />}
          </div>
        }
        className="flex flex-col"
      >
        <div className="flex flex-col justify-between h-full">
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {absenceStatsLoading || !absenceStats ? (
              <>
                <DataDisplay.Skeleton icon={SunHorizonIcon} label="Days off YTD" />
                <DataDisplay.Skeleton icon={ClockCountdownIcon} label="Upcoming" />
              </>
            ) : (
              <>
                <DataDisplay
                  icon={SunHorizonIcon}
                  label="Days off YTD"
                  value={String(absenceStats.days_off.value_raw ?? absenceStats.days_off.raw ?? 0)}
                />
                <DataDisplay
                  icon={ClockCountdownIcon}
                  label="Upcoming"
                  value={String(absenceStats.upcoming.value_raw ?? absenceStats.upcoming.raw ?? 0)}
                />
              </>
            )}
          </div>

          {/* List */}
          <div className="flex-1 mb-4">
            {absencesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <MediumAbsenceCard.Skeleton key={i} />
                ))}
              </div>
            ) : upcomingAbsences.length === 0 ? (
              <Feedback
                variant="neutral"
                title="No upcoming absences"
                description="This employee has no planned time off."
                className="py-10"
              />
            ) : (
              <div className="space-y-3">
                {upcomingAbsences.map((absence) => (
                  <MediumAbsenceCard key={absence.id} absence={absence} userId={userId} />
                ))}
              </div>
            )}
          </div>

          <SecondaryButton onClick={onViewAbsences}>View all absences →</SecondaryButton>
        </div>
      </ComposedCard>
    </div>
  );
}
