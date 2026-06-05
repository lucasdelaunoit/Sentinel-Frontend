import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ComposedCard from "@/components/common/cards/ComposedCard";
import Feedback from "@/components/common/feedbacks/Feedback";
import CountDisplay from "@/components/common/displays/CountDisplay";
import UserAvatar from "@/components/specified/models/employees/avatars/UserAvatar";
import useGetProjectStats from "@/api/projects/useGetProjectStats";
import useGetProjectMetrics from "@/api/projects/useGetProjectMetrics";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage";
import { cn } from "@/lib/utils";
import { TONE_TEXT, TONE_BG, type Tone } from "@/lib/scoring";
import ProjectHealthCard from "@/components/specified/pages/project/overviewTab/ProjectHealthCard.tsx";
import ProjectTodaySnapshot from "@/components/specified/pages/project/overviewTab/ProjectTodaySnapshot.tsx";
import ProjectFragilityAlertsCard from "@/components/specified/pages/project/overviewTab/ProjectFragilityAlertsCard.tsx";

/* ─── Derived member impact ───────────────────────────────── */

interface MemberImpact {
  id: string;
  firstname: string;
  lastname: string;
  status: UserStatus;
  onLeaveToday: boolean;
  lost: string[]; // sole active holder — skill goes uncovered if they leave
  weakened: string[]; // one of two active holders — skill drops to silo
  skillCount: number;
}

function isActiveHolder(holder: ProjectKnowledgeCoverageHolder, requiredLevel: number) {
  return !holder.on_leave_today && holder.level >= requiredLevel;
}

function buildMembers(coverage: ProjectKnowledgeCoverageItem[]): MemberImpact[] {
  const map = new Map<string, MemberImpact>();

  for (const row of coverage) {
    for (const holder of row.holders) {
      const member =
        map.get(holder.id) ??
        ({
          id: holder.id,
          firstname: holder.firstname,
          lastname: holder.lastname,
          status: holder.status,
          onLeaveToday: holder.on_leave_today,
          lost: [],
          weakened: [],
          skillCount: 0,
        } satisfies MemberImpact);

      member.skillCount += 1;
      if (isActiveHolder(holder, row.required_level)) {
        if (row.active_holders_count === 1) member.lost.push(row.skill.name);
        else if (row.active_holders_count === 2) member.weakened.push(row.skill.name);
      }
      map.set(holder.id, member);
    }
  }

  return [...map.values()];
}

/** Skills exposed *right now* because the member is already on leave. */
function currentAbsenceImpact(memberId: string, coverage: ProjectKnowledgeCoverageItem[]) {
  const uncovered: string[] = [];
  const weakened: string[] = [];
  for (const row of coverage) {
    if (!row.holders.some((h) => h.id === memberId)) continue;
    if (row.status === "uncovered") uncovered.push(row.skill.name);
    else if (row.status === "silo") weakened.push(row.skill.name);
  }
  return { uncovered, weakened };
}

/* ─── Health hero ─────────────────────────────────────────── */

const TONE_SOFT: Record<Tone, string> = {
  success: "bg-success/5 border-success/30",
  warning: "bg-warning/5 border-warning/30",
  danger: "bg-danger/5 border-danger/30",
};

/* ─── Impact pill ─────────────────────────────────────────── */

function ImpactPill({ lost, weakened }: { lost: number; weakened: number }) {
  if (lost > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.danger)} />
        <span className={cn("text-[11px] font-semibold", TONE_TEXT.danger)}>
          {lost} skill{lost !== 1 ? "s" : ""} lost
        </span>
      </div>
    );
  }
  if (weakened > 0) {
    return (
      <div className="flex items-center gap-1.5">
        <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.warning)} />
        <span className={cn("text-[11px] font-semibold", TONE_TEXT.warning)}>
          {weakened} skill{weakened !== 1 ? "s" : ""} → silo
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn("size-1.5 rounded-full shrink-0", TONE_BG.success)} />
      <span className={cn("text-[11px] font-medium", TONE_TEXT.success)}>No impact</span>
    </div>
  );
}

/* ─── Skill chips ─────────────────────────────────────────── */

function SkillChips({ skills, tone }: { skills: string[]; tone: Tone }) {
  return (
    <>
      {skills.map((s) => (
        <span
          key={s}
          className={cn(
            "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold",
            TONE_SOFT[tone],
            TONE_TEXT[tone],
          )}
        >
          {s}
        </span>
      ))}
    </>
  );
}

/* ─── Main tab ────────────────────────────────────────────── */

interface ProjectOverviewTabProps {
  projectId: string | undefined;
}

export default function ProjectOverviewTab({ projectId }: ProjectOverviewTabProps) {
  const { data: stats, isLoading: statsLoading } = useGetProjectStats(projectId);
  const { data: metrics, isLoading: metricsLoading } = useGetProjectMetrics(projectId);
  const { data: coverage, isLoading: coverageLoading } = useGetProjectKnowledgeCoverage(projectId);

  const heroLoading = statsLoading || metricsLoading;

  const members = useMemo(() => buildMembers(coverage ?? []), [coverage]);
  const onLeaveMembers = useMemo(() => members.filter((m) => m.onLeaveToday), [members]);

  const fragilityRaw = Number(stats?.fragility.value_raw ?? 0);
  const health = Math.max(0, Math.min(100, 100 - fragilityRaw));
  const coveragePct = Number(stats?.knowledge_coverage.value_raw ?? 0);

  const deadlineTone: Tone | "neutral" =
    stats?.deadline_countdown.severity === "critical"
      ? "danger"
      : stats?.deadline_countdown.severity === "warning"
        ? "warning"
        : "neutral";

  const silos = (coverage ?? []).filter((c) => c.status === "silo").length;
  const uncovered = (coverage ?? []).filter((c) => c.status === "uncovered").length;
  const teamSize = coverage?.[0]?.team_size ?? 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
      {/* ── Left: alerts + current absence impact ─────────── */}
      <div className="lg:col-span-3 space-y-4">
        <ProjectFragilityAlertsCard projectId={projectId} />

        <ComposedCard
          title={
            <div className="flex items-center gap-2">
              <span>Current Absence Impact</span>
              <CountDisplay isLoading={coverageLoading} count={onLeaveMembers.length} />
            </div>
          }
        >
          <div className="mt-2">
            {coverageLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2">
                    <UserAvatar.Skeleton />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-56" />
                    </div>
                  </div>
                ))}
              </div>
            ) : onLeaveMembers.length === 0 ? (
              <Feedback
                variant="success"
                title="Everyone is available today"
                description="No team member is currently on leave."
                className="py-10"
              />
            ) : (
              <div className="divide-y divide-border/40 -my-1">
                {onLeaveMembers.map((m) => {
                  const { uncovered: lost, weakened } = currentAbsenceImpact(m.id, coverage ?? []);
                  return (
                    <div key={m.id} className="flex items-start gap-3 py-3">
                      <UserAvatar firstname={m.firstname} lastname={m.lastname} variant={m.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground text-[13px]">
                            {m.firstname} {m.lastname}
                          </p>
                          <Badge className={cn("text-white border-transparent", TONE_BG.danger)}>On Leave</Badge>
                        </div>
                        {lost.length === 0 && weakened.length === 0 ? (
                          <p className={cn("text-[11px] mt-1 font-medium", TONE_TEXT.success)}>
                            All skills remain covered
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <SkillChips skills={lost} tone="danger" />
                            <SkillChips skills={weakened} tone="warning" />
                          </div>
                        )}
                      </div>
                      <ImpactPill lost={lost.length} weakened={weakened.length} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ComposedCard>
      </div>

      {/* ── Right: health + snapshot + key people ─────────── */}
      <div className="lg:col-span-2 space-y-4">
        <ProjectHealthCard
          isLoading={heroLoading}
          health={health}
          busFactor={metrics?.bus_factor ?? 0}
          coveragePct={coveragePct}
          deadlineLabel={stats?.deadline_countdown.value ?? "—"}
          deadlineTone={deadlineTone}
        />

        <ProjectTodaySnapshot
          isLoading={coverageLoading}
          teamSize={teamSize}
          requiredSkills={coverage?.length ?? 0}
          onLeave={onLeaveMembers.length}
          silos={silos}
          uncovered={uncovered}
        />
      </div>
    </div>
  );
}
