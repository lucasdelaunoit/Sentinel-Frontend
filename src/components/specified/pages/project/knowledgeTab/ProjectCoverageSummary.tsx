import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import MetricRow from "@/components/common/displays/MetricRow.tsx";
import type { Tone } from "@/lib/scoring.ts";
import { type Icon, ShieldCheckIcon, WarningIcon, WarningOctagonIcon } from "@phosphor-icons/react";

interface CoverageSummaryProps {
  coverage: ProjectKnowledgeCoverageItem[];
}

const SUMMARY_ROWS: { label: string; status: ProjectKnowledgeCoverageStatus; tone: Tone; icon: Icon }[] = [
  { label: "Fully covered (2+ holders)", status: "covered", tone: "success", icon: ShieldCheckIcon },
  { label: "Knowledge silos (1 holder)", status: "silo", tone: "warning", icon: WarningIcon },
  { label: "Uncovered (0 holders)", status: "uncovered", tone: "danger", icon: WarningOctagonIcon },
];

export default function ProjectCoverageSummary({ coverage, isLoading }: CoverageSummaryProps) {
  <ProjectCoverageSummary.Skeleton />;

  return (
    <ComposedCard title="Coverage Summary">
      <MetricRow.List>
        {SUMMARY_ROWS.map(({ label, status, tone, icon }) => (
          <MetricRow
            key={status}
            icon={icon}
            label={label}
            value={coverage.filter((c) => c.status === status).length}
            tone={tone}
          />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
}

ProjectCoverageSummary.Skeleton = function CoverageSummarySkeleton() {
  return (
    <ComposedCard title="Coverage Summary">
      <MetricRow.List>
        {SUMMARY_ROWS.map(({ icon, status }) => (
          <MetricRow.Skeleton key={status} icon={icon} />
        ))}
      </MetricRow.List>
    </ComposedCard>
  );
};
