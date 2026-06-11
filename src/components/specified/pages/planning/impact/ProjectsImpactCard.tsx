import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import MediumProjectImpactRow from "@/components/specified/models/projects/datas/items/MediumProjectImpactRow.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { formatRange } from "@/utils/planning/calendar.ts";

interface ProjectsImpactCardProps {
  projects: ProjectImpact[];
  perUserImpact: Record<string, UserImpact>;
  simBlocks: SimBlock[];
  usersById: Map<string, PlanningUser>;
}

/**
 * The scenario context behind a project's impact: who (the absent people who staff it)
 * and when (the span of their absence blocks). Derived from the simulation input, so it
 * resolves even when the project shows no skill-level breakage.
 */
function scenarioContext(
  projectId: number,
  perUserImpact: Record<string, UserImpact>,
  simBlocks: SimBlock[],
  usersById: Map<string, PlanningUser>,
): { window: string | null; drivers: string | null } {
  const driverIds = Object.values(perUserImpact)
    .filter((impact) => impact.projects_affected.some((p) => p.project_id === projectId))
    .map((impact) => impact.user_id);

  const blocks = simBlocks.filter((b) => driverIds.includes(b.userId));
  if (blocks.length === 0) return { window: null, drivers: null };

  const start = blocks.map((b) => b.startDate).sort()[0];
  const end = blocks.map((b) => b.endDate).sort().at(-1)!;

  const names = driverIds.map((id) => {
    const u = usersById.get(id);
    return u ? `${u.firstname} ${u.lastname}` : "Unknown";
  });
  const drivers = names.length <= 2 ? names.join(", ") : `${names.slice(0, 2).join(", ")} +${names.length - 2}`;

  return { window: formatRange(start, end), drivers };
}

export default function ProjectsImpactCard({ projects, perUserImpact, simBlocks, usersById }: ProjectsImpactCardProps) {
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
        <Feedback variant="success" title="No project impact" description="No projects are affected by this scenario." className="py-6" />
      ) : (
        <div className="space-y-2">
          {projects.map((p) => {
            const { window, drivers } = scenarioContext(p.project_id, perUserImpact, simBlocks, usersById);
            return <MediumProjectImpactRow key={p.project_id} project={p} window={window} drivers={drivers} />;
          })}
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
          <CountDisplay.Skeleton />
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
