import { useMemo } from "react";
import useGetProjectStats from "@/api/projects/useGetProjectStats";
import useGetProjectMetrics from "@/api/projects/useGetProjectMetrics";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage";
import { type Tone } from "@/lib/scoring";
import ProjectHealthCard from "@/components/specified/pages/project/overviewTab/ProjectHealthCard.tsx";
import ProjectTodaySnapshot from "@/components/specified/pages/project/overviewTab/ProjectTodaySnapshot.tsx";
import ProjectFragilityAlertsCard from "@/components/specified/pages/project/overviewTab/ProjectFragilityAlertsCard.tsx";
import ProjectAbsenceImpactCard from "@/components/specified/pages/project/overviewTab/ProjectAbsenceImpactCard.tsx";

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
        <ProjectAbsenceImpactCard projectId={projectId} />
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
