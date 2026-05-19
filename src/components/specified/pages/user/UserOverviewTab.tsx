import { useNavigate } from "react-router-dom";
import { ShieldAlert, AlertTriangle, GitBranch, Layers, Lightbulb, GraduationCap, BookOpen, Users } from "lucide-react";
import { CalendarBlankIcon, SunHorizonIcon, ClockCountdownIcon } from "@phosphor-icons/react";
import useGetUserStats from "@/api/users/useGetUserStats.ts";
import useGetAbsencesForUser from "@/api/absences/useGetAbsencesForUser.ts";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import { cn } from "@/lib/utils.ts";
import type { AbsenceItem, AbsenceType } from "@/types/dashboard.ts";

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

const DRIVER_WEIGHTS = { silo: 3, bus: 2.5, unique: 1 } as const;

function computeContributions(silo: number, bus: number, unique: number) {
  const raw = {
    silo: silo * DRIVER_WEIGHTS.silo,
    bus: bus * DRIVER_WEIGHTS.bus,
    unique: unique * DRIVER_WEIGHTS.unique,
  };
  const total = raw.silo + raw.bus + raw.unique;
  if (total === 0) return { silo: 0, bus: 0, unique: 0 };
  return {
    silo: Math.round((raw.silo / total) * 100),
    bus: Math.round((raw.bus / total) * 100),
    unique: Math.round((raw.unique / total) * 100),
  };
}

const ABSENCE_TYPE_DOT: Record<AbsenceType, string> = {
  vacation: "bg-blue-500",
  sick: "bg-rose-500",
  conference: "bg-violet-500",
};
const ABSENCE_TYPE_LABEL: Record<AbsenceType, string> = {
  vacation: "Vacation",
  sick: "Sick leave",
  conference: "Conference",
};

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

function buildRecommendations(score: number, silo: number, bus: number, unique: number): Recommendation[] {
  const recs: Recommendation[] = [];

  if (silo > 0) {
    recs.push({
      icon: GraduationCap,
      iconBg: "bg-amber-50 border-amber-100",
      iconColor: "text-amber-600",
      title: `Cross-train teammates on ${silo} siloed area${silo !== 1 ? "s" : ""}`,
      description: "Identify candidates with adjacent skills and pair them with this employee for knowledge transfer.",
      priority: silo >= 2 ? "high" : "medium",
    });
  }

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

  if (unique > 0) {
    recs.push({
      icon: BookOpen,
      iconBg: "bg-violet-50 border-violet-100",
      iconColor: "text-violet-600",
      title: `Document ${unique} unique skill${unique !== 1 ? "s" : ""}`,
      description: "Capture runbooks, decision logs, and onboarding notes so the knowledge survives the person.",
      priority: unique >= 3 ? "high" : "medium",
    });
  }

  if (score >= 70 && recs.length > 0) {
    recs.unshift({
      icon: AlertTriangle,
      iconBg: "bg-rose-50 border-rose-100",
      iconColor: "text-rose-600",
      title: "Schedule a knowledge-transfer review this quarter",
      description: "Criticality score is high — convene a session with the team lead to plan redundancy.",
      priority: "high",
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
  const navigate = useNavigate();
  const { data: stats, isLoading } = useGetUserStats(userId);
  const { data: absencesData, isLoading: absencesLoading } = useGetAbsencesForUser(userId, { per_page: 100 });

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

  const { criticality, bus_factor_in_org, breakdown } = stats;
  const criticalityScore = criticality.raw ?? 0;
  const busFactorCount = bus_factor_in_org.raw ?? 0;
  const siloCount = breakdown.criticality_detail.silo_count;
  const uniqueSkills = breakdown.criticality_detail.unique_skills;
  const busFactorProjects = breakdown.bus_factor_projects;
  const crit = critLabel(criticalityScore);
  const contributions = computeContributions(siloCount, busFactorCount, uniqueSkills);
  const recommendations = buildRecommendations(criticalityScore, siloCount, busFactorCount, uniqueSkills);

  const allAbsences = absencesData?.data ?? [];
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

              {/* Stacked breakdown bar */}
              <div className="mt-4">
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted/50">
                  {contributions.silo > 0 && (
                    <div className="h-full bg-amber-500/80" style={{ width: `${contributions.silo}%` }} title={`Silos ${contributions.silo}%`} />
                  )}
                  {contributions.bus > 0 && (
                    <div className="h-full bg-rose-500/80" style={{ width: `${contributions.bus}%` }} title={`Bus factor ${contributions.bus}%`} />
                  )}
                  {contributions.unique > 0 && (
                    <div className="h-full bg-violet-500/80" style={{ width: `${contributions.unique}%` }} title={`Unique skills ${contributions.unique}%`} />
                  )}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500/80" />
                    Silos <span className="tabular-nums text-foreground/70 font-semibold">{contributions.silo}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-rose-500/80" />
                    Bus factor <span className="tabular-nums text-foreground/70 font-semibold">{contributions.bus}%</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-violet-500/80" />
                    Unique <span className="tabular-nums text-foreground/70 font-semibold">{contributions.unique}%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Drivers */}
            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-100">
                <AlertTriangle className="size-3.5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">
                  {siloCount} silo area{siloCount !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {siloCount === 0 ? "Knowledge is well distributed" : "Skill categories with low redundancy"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-border/60 px-4 py-3 bg-card">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 border border-violet-100">
                <Layers className="size-3.5 text-violet-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-foreground">
                  {uniqueSkills} unique skill{uniqueSkills !== 1 ? "s" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {uniqueSkills === 0
                    ? "No skill exclusively held by this employee"
                    : "Skills no other team member holds"}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border/60 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/60">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-100">
                  <GitBranch className="size-3.5 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-foreground">
                    Bus factor for {busFactorCount} project{busFactorCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {busFactorCount === 0
                      ? "Not a critical bottleneck anywhere"
                      : "Removal would critically impact these projects"}
                  </p>
                </div>
              </div>
              {busFactorProjects.length > 0 && (
                <div className="divide-y divide-border/40 bg-muted/20">
                  {busFactorProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => navigate(`/projects/${proj.id}`)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/40 transition-colors group"
                    >
                      <span className="text-[12px] font-medium text-foreground group-hover:text-primary transition-colors">
                        {proj.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 group-hover:text-primary/60 transition-colors">
                        View →
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
                        <span className={cn("size-2 rounded-full", ABSENCE_TYPE_DOT[a.type])} />
                      </div>
                    }
                    title={ABSENCE_TYPE_LABEL[a.type]}
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
