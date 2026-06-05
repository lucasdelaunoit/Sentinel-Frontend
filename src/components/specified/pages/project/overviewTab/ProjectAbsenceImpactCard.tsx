import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import useGetProjectKnowledgeCoverage from "@/api/projects/useGetProjectKnowledgeCoverage.ts";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import MediumAbsenceImpactRow from "@/components/specified/models/absence/datas/MediumAbsenceImpactRow.tsx";

interface ProjectAbsenceImpactCardProps {
  projectId: string | undefined;
}

interface OnLeaveMember {
  id: string;
  firstname: string;
  lastname: string;
  status: UserStatus;
}

/** Unique team members currently on leave. */
function getOnLeaveMembers(coverage: ProjectKnowledgeCoverageItem[]): OnLeaveMember[] {
  const map = new Map<string, OnLeaveMember>();
  for (const row of coverage) {
    for (const holder of row.holders) {
      if (holder.on_leave_today && !map.has(holder.id)) {
        map.set(holder.id, {
          id: holder.id,
          firstname: holder.firstname,
          lastname: holder.lastname,
          status: holder.status,
        });
      }
    }
  }
  return [...map.values()];
}

/** Skills exposed *right now* because the member is already on leave. */
function currentAbsenceImpact(memberId: string, coverage: ProjectKnowledgeCoverageItem[]) {
  const lost: string[] = [];
  const weakened: string[] = [];
  for (const row of coverage) {
    if (!row.holders.some((h) => h.id === memberId)) continue;
    if (row.status === "uncovered") lost.push(row.skill.name);
    else if (row.status === "silo") weakened.push(row.skill.name);
  }
  return { lost, weakened };
}

export default function ProjectAbsenceImpactCard({ projectId }: ProjectAbsenceImpactCardProps) {
  const { data: coverage = [], isLoading } = useGetProjectKnowledgeCoverage(projectId);

  if (isLoading) return <ProjectAbsenceImpactCard.Skeleton />;

  const onLeaveMembers = getOnLeaveMembers(coverage);

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Current Absence Impact</span>
          <CountDisplay count={onLeaveMembers.length} />
        </div>
      }
    >
      {onLeaveMembers.length === 0 ? (
        <Feedback
          variant="success"
          title="Everyone is available today"
          description="No team member is currently on leave."
          className="py-10"
        />
      ) : (
        <div className="space-y-2.5">
          {onLeaveMembers.map((m) => {
            const { lost, weakened } = currentAbsenceImpact(m.id, coverage);
            return (
              <MediumAbsenceImpactRow
                key={m.id}
                firstname={m.firstname}
                lastname={m.lastname}
                status={m.status}
                lost={lost}
                weakened={weakened}
              />
            );
          })}
        </div>
      )}
    </ComposedCard>
  );
}

ProjectAbsenceImpactCard.Skeleton = function ProjectAbsenceImpactCardSkeleton() {
  return (
    <ComposedCard title="Current Absence Impact">
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <MediumAbsenceImpactRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
