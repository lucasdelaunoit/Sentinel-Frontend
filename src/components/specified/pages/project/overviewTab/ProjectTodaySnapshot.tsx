import MetricRow, { type MetricTone } from "@/components/common/displays/MetricRow.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

interface ProjectTodaySnapshotProps {
  teamSize: number;
  requiredSkills: number;
  onLeave: number;
  silos: number;
  uncovered: number;
  warnings: number;
  isLoading?: boolean;
}

export default function ProjectTodaySnapshot({
  teamSize,
  requiredSkills,
  onLeave,
  silos,
  uncovered,
  warnings,
  isLoading = false,
}: ProjectTodaySnapshotProps) {
  const rows: { label: string; value: number; tone: MetricTone }[] = [
    { label: "On leave today", value: onLeave, tone: onLeave > 0 ? "warning" : "neutral" },
    { label: "Knowledge silos", value: silos, tone: silos > 0 ? "warning" : "neutral" },
    { label: "Uncovered skills", value: uncovered, tone: uncovered > 0 ? "danger" : "neutral" },
    { label: "Active warnings", value: warnings, tone: warnings > 0 ? "warning" : "neutral" },
  ];

  if (isLoading) return <ProjectTodaySnapshot.Skeleton />;

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
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricRow.Skeleton key={i} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
};
