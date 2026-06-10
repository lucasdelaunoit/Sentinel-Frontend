import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import MediumProjectImpactRow from "@/components/specified/models/projects/datas/items/MediumProjectImpactRow.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";

interface ProjectsImpactCardProps {
  projects: ProjectImpact[];
}

export default function ProjectsImpactCard({ projects }: ProjectsImpactCardProps) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Projects</span>
          <CountDisplay count={projects.length} />
        </div>
      }
    >
      {projects.length === 0 ? (
        <Feedback variant="success" title="No project impact" description="All skills remain covered." />
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <MediumProjectImpactRow key={p.project_id} project={p} />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

ProjectsImpactCard.Skeleton = function ProjectsImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Impacted Projects</span>
          <CountDisplay isLoading count={0} />
        </div>
      }
    >
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <MediumProjectImpactRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
