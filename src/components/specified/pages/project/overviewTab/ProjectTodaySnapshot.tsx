import MetricRow, { type MetricTone } from "@/components/common/displays/MetricRow.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import useGetProjectKnowledgeMatrix from "@/api/projects/useGetProjectKnowledgeMatrix";

interface ProjectTodaySnapshotProps {
  projectId: string | undefined;
}

/** Count unique team members currently on leave. */
function countOnLeave(coverage: ProjectKnowledgeCoverageItem[]): number {
  const ids = new Set<string>();
  for (const row of coverage) {
    for (const holder of row.holders) {
      if (holder.on_leave_today) ids.add(holder.id);
    }
  }
  return ids.size;
}

export default function ProjectTodaySnapshot({ projectId }: ProjectTodaySnapshotProps) {
  const { data: coverage = [], isLoading } = useGetProjectKnowledgeMatrix(projectId);

  if (isLoading) return <ProjectTodaySnapshot.Skeleton />;

  const teamSize = coverage[0]?.team_size ?? 0;
  const requiredSkills = coverage.length;
  const onLeave = countOnLeave(coverage);
  const silos = coverage.filter((c) => c.status === "silo").length;
  const uncovered = coverage.filter((c) => c.status === "uncovered").length;

  const rows: { label: string; value: number; tone: MetricTone }[] = [
    { label: "On leave today", value: onLeave, tone: onLeave > 0 ? "warning" : "neutral" },
    { label: "Knowledge silos", value: silos, tone: silos > 0 ? "warning" : "neutral" },
    { label: "Uncovered skills", value: uncovered, tone: uncovered > 0 ? "danger" : "neutral" },
  ];

  return (
    <ComposedCard
      title="Today's Snapshot"
      action={
        <span className="text-[12px] text-muted-foreground font-normal whitespace-nowrap">
          {teamSize} members · {requiredSkills} required skills
        </span>
      }
    >
      <MetricRow.List>
        {rows.map((r) => (
          <MetricRow key={r.label} label={r.label} value={r.value} tone={r.tone} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
}

ProjectTodaySnapshot.Skeleton = function ProjectTodaySnapshotSkeleton() {
  return (
    <ComposedCard title="Today's Snapshot" action={<Skeleton className="h-3 w-32" />}>
      <MetricRow.List>
        {Array.from({ length: 3 }).map((_, i) => (
          <MetricRow.Skeleton key={i} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
};
