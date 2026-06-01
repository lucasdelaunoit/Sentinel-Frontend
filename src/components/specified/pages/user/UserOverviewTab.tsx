import type { ElementType } from "react";
import { ShieldAlert, AlertTriangle, GitBranch, Layers, Lightbulb, Users, Briefcase } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon } from "@phosphor-icons/react";
import useGetUserStats from "@/api/users/useGetUserStats.ts";
import useGetUserRecommendations from "@/api/users/useGetUserRecommendations.ts";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import useGetUserAbsenceStats from "@/api/absences/useGetUserAbsenceStats.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import StatCard from "@/components/common/cards/StatCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import MediumAbsenceCard from "@/components/specified/models/absence/datas/MediumAbsenceCard.tsx";
import { cn } from "@/lib/utils.ts";
import type { StatCardData, UserRecommendation, UserRecommendationIcon } from "@/types/dashboard";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";

interface UserOverviewTabProps {
  userId: string;
  onViewAbsences?: () => void;
}

/* ─── Constants ──────────────────────────────────────────── */

const RECOMMENDATION_ICONS: Record<UserRecommendationIcon, ElementType> = {
  "shield-alert": ShieldAlert,
  "alert-triangle": AlertTriangle,
  "git-branch": GitBranch,
  users: Users,
  lightbulb: Lightbulb,
};

const SEVERITY_TONE: Record<Severity, { color: string; bg: string; border: string }> = {
  critical: { color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
  warning: { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
  ok: { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
};

/* ─── Helpers ────────────────────────────────────────────── */

function critLabel(score: number) {
  if (score >= 70)
    return { label: "High Criticality", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  if (score >= 40)
    return { label: "Medium Criticality", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
  return { label: "Low Criticality", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function isUpcomingOrOngoing(a: Absence) {
  const today = new Date().setHours(0, 0, 0, 0);
  return new Date(a.end_date).getTime() >= today;
}

function sortByStart(a: Absence, b: Absence) {
  return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
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

/* ─── RecommendationRow ──────────────────────────────────── */

interface RecommendationRowProps {
  recommendation: UserRecommendation;
}

function RecommendationRow({ recommendation }: RecommendationRowProps) {
  const Icon = RECOMMENDATION_ICONS[recommendation.icon] ?? Lightbulb;
  const tone = SEVERITY_TONE[recommendation.severity];

  return (
    <div className="flex gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", tone.bg, tone.border)}>
        <Icon className={cn("size-3.5", tone.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[12px] font-semibold text-foreground leading-snug">{recommendation.title}</p>
          {recommendation.priority === "high" && (
            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 ring-1 ring-rose-200/60 rounded px-1.5 py-0.5 shrink-0">
              High
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{recommendation.description}</p>
      </div>
    </div>
  );
}

RecommendationRow.Skeleton = function RecommendationRowSkeleton() {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
      <Skeleton className="size-8 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
};

/* ─── MiniStat ───────────────────────────────────────────── */

interface MiniStatProps {
  icon: ElementType;
  label: string;
  value: string | number;
}

function MiniStat({ icon: Icon, label, value }: MiniStatProps) {
  return (
    <div className="rounded-xl border border-border/60 px-3.5 py-3 bg-card">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-[20px] font-bold text-foreground leading-tight mt-1 tabular-nums">{value}</p>
    </div>
  );
}

MiniStat.Skeleton = function MiniStatSkeleton({ icon: Icon, label }: Pick<MiniStatProps, "icon" | "label">) {
  return (
    <div className="rounded-xl border border-border/60 px-3.5 py-3 bg-card">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
      <Skeleton className="h-6 w-10 mt-1.5" />
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────── */

export default function UserOverviewTab({ userId, onViewAbsences }: UserOverviewTabProps) {
  const { data: stats, isLoading: statsLoading } = useGetUserStats(userId);
  const { data: recommendations = [], isLoading: recsLoading } = useGetUserRecommendations(userId);
  const {
    data: absencesList,
    total: absencesTotal,
    isLoading: absencesLoading,
  } = useGetAbsencesForUser(userId, { per_page: 100 });
  const { data: absenceStats, isLoading: absenceStatsLoading } = useGetUserAbsenceStats(userId);

  const upcoming = (absencesList ?? []).filter(isUpcomingOrOngoing).sort(sortByStart);
  const upcomingPreview = upcoming.slice(0, 4);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* ── Left column ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Criticality Profile */}
        <ComposedCard title="Criticality Profile" headerClassName="mb-5">
          <div className="space-y-4">
            {statsLoading || !stats ? (
              <CriticalityHeadline.Skeleton />
            ) : (
              <CriticalityHeadline card={stats.criticality} />
            )}

            <div className="grid grid-cols-3 gap-3">
              <StatCard title="Bus factor" icon={GitBranch} card={stats?.bus_factor_in_org} isLoading={statsLoading} />
              <StatCard title="Skills" icon={Layers} card={stats?.skills} isLoading={statsLoading} />
              <StatCard
                title="Active projects"
                icon={Briefcase}
                card={stats?.active_projects}
                isLoading={statsLoading}
              />
            </div>
          </div>
        </ComposedCard>

        {/* Recommendations */}
        <ComposedCard title="Recommendations">
          <div className="space-y-2.5">
            {recsLoading ? (
              <>
                <RecommendationRow.Skeleton />
                <RecommendationRow.Skeleton />
              </>
            ) : (
              recommendations.map((rec) => <RecommendationRow key={rec.id} recommendation={rec} />)
            )}
          </div>
        </ComposedCard>
      </div>

      {/* ── Right column ─────────────────────────────────── */}
      <ComposedCard
        title={
          <div className="flex items-center gap-2">
            <span>Absences</span>
            <CountDisplay isLoading={absencesLoading} count={absencesTotal} />
          </div>
        }
        className="flex flex-col"
      >
        <div className="flex flex-col justify-between h-full">
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {absenceStatsLoading || !absenceStats ? (
              <>
                <MiniStat.Skeleton icon={SunHorizonIcon} label="Days off YTD" />
                <MiniStat.Skeleton icon={ClockCountdownIcon} label="Upcoming" />
              </>
            ) : (
              <>
                <MiniStat
                  icon={SunHorizonIcon}
                  label="Days off YTD"
                  value={absenceStats.days_off.value_raw ?? absenceStats.days_off.raw ?? 0}
                />
                <MiniStat
                  icon={ClockCountdownIcon}
                  label="Upcoming"
                  value={absenceStats.upcoming.value_raw ?? absenceStats.upcoming.raw ?? 0}
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
            ) : upcomingPreview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarBlankIcon className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-[12px] text-muted-foreground">No upcoming absences</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingPreview.map((absence) => (
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
