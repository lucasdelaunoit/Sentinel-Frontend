import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import MetricRow from "@/components/common/displays/MetricRow.tsx";
import type { Tone } from "@/lib/scoring.ts";
import { type Icon, ShieldCheckIcon, WarningIcon, WarningOctagonIcon } from "@phosphor-icons/react";
import useGetProjectCoverageSummary from "@/api/projects/useGetProjectCoverageSummary.ts";

interface CoverageSummaryProps {
  projectId: string | undefined;
}

const SUMMARY_ROWS: {
  label: string;
  key: keyof Pick<ProjectKnowledgeCoverageSummary, "covered" | "silo" | "uncovered">;
  tone: Tone;
  icon: Icon;
}[] = [
  { label: "Fully covered (2+ holders)", key: "covered", tone: "success", icon: ShieldCheckIcon },
  { label: "Knowledge silos (1 holder)", key: "silo", tone: "warning", icon: WarningIcon },
  { label: "Uncovered (0 holders)", key: "uncovered", tone: "danger", icon: WarningOctagonIcon },
];

export default function ProjectCoverageSummary({ projectId }: CoverageSummaryProps) {
  const { data: summary, isLoading: isSummaryLoading } = useGetProjectCoverageSummary(projectId);

  if (isSummaryLoading || !summary) return <ProjectCoverageSummary.Skeleton />;

  return (
    <ComposedCard title="Coverage Summary">
      <MetricRow.List>
        {SUMMARY_ROWS.map(({ label, key, tone, icon }) => (
          <MetricRow key={key} icon={icon} label={label} value={summary[key]} tone={tone} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
}

ProjectCoverageSummary.Skeleton = function CoverageSummarySkeleton() {
  return (
    <ComposedCard title="Coverage Summary">
      <MetricRow.List>
        {SUMMARY_ROWS.map(({ icon, key }) => (
          <MetricRow.Skeleton key={key} icon={icon} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
};
