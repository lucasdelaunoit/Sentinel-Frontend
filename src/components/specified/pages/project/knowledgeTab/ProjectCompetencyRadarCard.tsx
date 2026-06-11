import { useState } from "react";
import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import useGetProjectCompetencyRadar, {
  type CompetencyRadarScope,
} from "@/api/projects/useGetProjectCompetencyRadar.ts";
import { cn } from "@/lib/utils.ts";

const SCOPE_OPTIONS: { value: CompetencyRadarScope; label: string }[] = [
  { value: "required", label: "Required" },
  { value: "all", label: "All" },
];

function ScopeSwitch({
  value,
  onChange,
}: {
  value: CompetencyRadarScope;
  onChange: (scope: CompetencyRadarScope) => void;
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-muted p-0.5">
      {SCOPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors cursor-pointer",
            value === option.value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

interface ProjectCompetencyRadarCardProps {
  projectId: string | undefined;
}

export default function ProjectCompetencyRadarCard({ projectId }: ProjectCompetencyRadarCardProps) {
  const [scope, setScope] = useState<CompetencyRadarScope>("required");
  const { data: radar, isLoading: isRadarLoading } = useGetProjectCompetencyRadar(projectId, scope);

  if (isRadarLoading || !radar) return <ProjectCompetencyRadarCard.Skeleton />;

  const data: CoverageRadarDatum[] = radar.map((r) => ({
    axis: r.category,
    value: r.value,
    target: r.target,
  }));

  return (
    <ComposedCard title="Team Competency Radar" action={<ScopeSwitch value={scope} onChange={setScope} />}>
      {data.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-muted-foreground">
          No required skills yet — add skills to the project to see its radar.
        </p>
      ) : (
        <CoverageRadar data={data} valueLabel="Team level" targetLabel="Target" />
      )}
    </ComposedCard>
  );
}

ProjectCompetencyRadarCard.Skeleton = function ProjectCompetencyRadarCard() {
  return (
    <ComposedCard title="Team Competency Radar">
      <CoverageRadar.Skeleton />
    </ComposedCard>
  );
};
