import { ShieldAlert, AlertTriangle, GitBranch, Layers, Lightbulb, Users, Briefcase } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon } from "@phosphor-icons/react";
import useGetUserStats from "@/api/users/useGetUserStats.ts";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import { cn } from "@/lib/utils.ts";
import { AbsenceType, ABSENCE_TYPE_LABEL, type AbsenceItem } from "@/types/absence";

interface UserOverviewTabProps {
  userId: string;
  onViewAbsences?: () => void;
}

/* ─── Helpers ────────────────────────────────────────────── */

function critLabel(score: number): { label: string; color: string; bg: string; border: string; ring: string } {
  if (score >= 70) return { label: "High Criticality", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", ring: "ring-rose-200/60" };
  if (score >= 40) return { label: "Medium Criticality", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", ring: "ring-amber-200/60" };
  return { label: "Low Criticality", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-200/60" };
}

const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  [AbsenceType.Vacation]: "bg-blue-500",
  [AbsenceType.Conference]: "bg-violet-500",
  [AbsenceType.Training]: "bg-amber-500",
  [AbsenceType.Parental]: "bg-emerald-500",
  [AbsenceType.Sabbatical]: "bg-indigo-500",
  [AbsenceType.Other]: "bg-slate-500",
};

function typeDot(t: AbsenceType | null) { return t ? ABSENCE_TYPE_DOT[t] : "bg-muted-foreground"; }
function typeLabel(t: AbsenceType | null) { return t ? ABSENCE_TYPE_LABEL[t] : "Unspecified"; }

function fmtShort(date: string) {
  return new Date(date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function daysBetween(start: string, end: string) {
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

function upcomingAbsences(absences: AbsenceItem[]) {
  const today = new Date().setHours(0, 0, 0, 0);
  return absences
    .filter((a) => new Date(a.end_date).getTime() >= today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
}

/* ─── Recommendations ────────────────────────────────────── */

interface Recommendation {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

function buildRecommendations(score: number, bus: number): Recommendation[] {
  const recs: Recommendation[] = [];

  if (bus > 0) {
    recs.push({
      icon: Users,
      iconBg: "bg-rose-50 border-rose-100",
      iconColor: "text-rose-600",
      title: `Mitigate bus-factor risk on ${bus} project${bus !== 1 ? "s" : ""}`,
      description: "Assign a secondary owner to each affected project to ensure continuity if this employee is absent.",
      priority: "high",
    });
  }

  if (score >= 70) {
    recs.unshift({
      icon: AlertTriangle,
      iconBg: "bg-rose-50 border-rose-100",
      iconColor: "text-rose-600",
      title: "Schedule a knowledge-transfer review this quarter",
      description: "Criticality score is high — convene a session with the team lead to plan redundancy.",
      priority: "high",
    });
  } else if (score >= 40 && recs.length === 0) {
    recs.push({
      icon: AlertTriangle,
      iconBg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      title: "Monitor criticality drift",
      description: "Score is in the medium band. Watch for new silos or project assignments that could escalate risk.",
      priority: "medium",
    });
  }

  if (recs.length === 0) {
    recs.push({
      icon: Lightbulb,
      iconBg: "bg-emerald-50 border-emerald-100",
      iconColor: "text-emerald-600",
      title: "No structural risk detected",
      description: "Knowledge is well distributed. Keep monitoring as the team and skill graph evolve.",
      priority: "low",
    });
  }

  return recs;
}

/* ─── Main component ─────────────────────────────────────── */

export default function UserOverviewTab({ userId, onViewAbsences }: UserOverviewTabProps) {
  const { data: stats, isLoading } = useGetUserStats(userId);
  const { data: allAbsencesList, isLoading: absencesLoading } = useGetAbsencesForUser(userId, { per_page: 100 });

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-5">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-20 rounded-xl" />
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
          <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-3">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 p-6 shadow-sm space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-20 rounded-xl" />
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
        </div>
      </div>
    );
  }

  const { criticality, bus_factor_in_org, skills, active_projects } = stats;
  const criticalityScore = criticality.value_raw ?? criticality.raw ?? 0;
  const busFactorCount = bus_factor_in_org.value_raw ?? bus_factor_in_org.raw ?? 0;
  const skillsCount = skills.value_raw ?? skills.raw ?? 0;
  const activeProjectsCount = active_projects.value_raw ?? active_projects.raw ?? 0;
  const crit = critLabel(criticalityScore);
  const recommendations = buildRecommendations(criticalityScore, busFactorCount);

  const allAbsences = allAbsencesList;
  const upcoming = upcomingAbsences(allAbsences);
  const ytd = daysThisYear(allAbsences);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      {/* ── Left column ──────────────────────────────────── */}
      <div className="space-y-4">
        {/* Risk Profile */}
        <ComposedCard title="Criticality Profile" headerClassName="mb-5">
          <div className="space-y-4">
            {/* Headline */}
            <div className={cn("rounded-xl border px-5 py-4", crit.bg, crit.border)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className={cn("size-4 shrink-0", crit.color)} />
                  <div>
                    <p className={cn("text-[13px] font-semibold", crit.color)}>{crit.label}</p>
                    <p className="text-[11px] text-muted-foreground">Composite criticality score</p>
                  </div>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-[32px] font-bold tabular-nums leading-none", crit.color)}>
                    {criticalityScore}
                  </span>
                  <span className="text-[11px] text-muted-foreground/70 font-medium">/100</span>
                </div>
              </div>

              {criticality.insight && (
                <p className={cn("mt-3 text-[11px] font-medium", crit.color)}>{criticality.insight}</p>
              )}
            </div>

            {/* Drivers */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
                <GitBranch className="size-3.5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">
                  Bus factor for {busFactorCount} project{busFactorCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {bus_factor_in_org.insight ??
                    (busFactorCount === 0
                      ? "Not a critical bottleneck anywhere"
                      : "Removal would critically impact these projects")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 border border-violet-100">
                <Layers className="size-3.5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">
                  {skillsCount} skill{skillsCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {skills.insight ?? "Skills currently held"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100">
                <Briefcase className="size-3.5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">
                  {activeProjectsCount} active project{activeProjectsCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {active_projects.insight ?? "Currently assigned"}
                </p>
              </div>
            </div>
          </div>
        </ComposedCard>

        {/* Recommendations */}
        <ComposedCard
          title="Recommendations"
          action={
            <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
              {recommendations.length}
            </span>
          }
          headerClassName="mb-4"
        >
          <div className="space-y-2.5">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <div key={i} className="flex gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", rec.iconBg)}>
                    <Icon className={cn("size-3.5", rec.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-semibold text-foreground leading-snug">{rec.title}</p>
                      {rec.priority === "high" && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 ring-1 ring-rose-200/60 rounded px-1.5 py-0.5 shrink-0">
                          High
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{rec.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ComposedCard>
      </div>

      {/* ── Right column ─────────────────────────────────── */}
      <ComposedCard
        title="Absences"
        action={
          <span className="text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full font-medium">
            {allAbsences.length}
          </span>
        }
        headerClassName="mb-5"
        className="flex flex-col"
      >
        <div className="flex flex-col justify-between h-full">
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <div className="rounded-xl border border-border/60 px-3.5 py-3 bg-card">
              <div className="flex items-center gap-2">
                <SunHorizonIcon className="size-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Days YTD</p>
              </div>
              {absencesLoading ? (
                <Skeleton className="h-6 w-10 mt-1.5" />
              ) : (
                <p className="text-[20px] font-bold text-foreground leading-tight mt-1 tabular-nums">{ytd}</p>
              )}
            </div>
            <div className="rounded-xl border border-border/60 px-3.5 py-3 bg-card">
              <div className="flex items-center gap-2">
                <ClockCountdownIcon className="size-3.5 text-muted-foreground" />
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Upcoming</p>
              </div>
              {absencesLoading ? (
                <Skeleton className="h-6 w-10 mt-1.5" />
              ) : (
                <p className="text-[20px] font-bold text-foreground leading-tight mt-1 tabular-nums">{upcoming.length}</p>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 mb-4">
            {absencesLoading ? (
              <div className="space-y-3 py-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-1.5">
                    <Skeleton className="size-8 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-12 rounded-full" />
                  </div>
                ))}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CalendarBlankIcon className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-[12px] text-muted-foreground">No upcoming absences</p>
              </div>
            ) : (
              <div className="space-y-4 p-0.5">
                {upcoming.slice(0, 4).map((a) => (
                  <SecondaryCard
                    key={a.id}
                    before={
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 border border-border/40">
                        <span className={cn("size-2 rounded-full", typeDot(a.type))} />
                      </div>
                    }
                    title={typeLabel(a.type)}
                    description={`${fmtShort(a.start_date)} → ${fmtShort(a.end_date)}`}
                    action={
                      <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                        {daysBetween(a.start_date, a.end_date)}d
                      </span>
                    }
                  />
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
