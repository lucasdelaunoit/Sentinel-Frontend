import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import useGetProjectCompetencyRadar from "@/api/projects/useGetProjectCompetencyRadar.ts";

interface ProjectCompetencyRadarCardProps {
  projectId: string | undefined;
}

export default function ProjectCompetencyRadarCard({ projectId }: ProjectCompetencyRadarCardProps) {
  const { data: radar, isLoading: isRadarLoading } = useGetProjectCompetencyRadar(projectId);

  if (isRadarLoading || !radar) return <ProjectCompetencyRadarCard.Skeleton />;

  const data: CoverageRadarDatum[] = radar.map((r) => ({
    axis: r.category,
    value: r.value,
    target: r.target,
  }));

  return (
    <ComposedCard title="Team Competency Radar">
      <CoverageRadar data={data} valueLabel="Team level" targetLabel="Target" />
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
