import { useNavigate } from "react-router-dom";

import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

import useGetProjects from "@/api/projects/useGetProjects.ts";
import useGetProjectsStats from "@/api/projects/useGetProjectsStats.ts";
import MediumProjectRow from "@/components/specified/models/projects/datas/items/MediumProjectRow.tsx";

const PREVIEW_COUNT = 5;

export default function CriticalProjectsCard() {
  const navigate = useNavigate();

  const { data: projects, isLoading, isError } = useGetProjects({
    page: 1,
    per_page: PREVIEW_COUNT,
    sorts: [{ field: "risk_score", direction: "desc" }],
    filters: [{ field: "status", value: "active" }],
  });

  const { data: statsData, isLoading: isStatsLoading } = useGetProjectsStats();

  if (isLoading || isStatsLoading) return <CriticalProjectsCard.Skeleton />;
  const fragileCount = statsData?.fragile_count.value ?? "0";

  return (
    <ComposedCard
      title="Critical Projects"
      action={
        <span className="text-xs text-secondary-foreground ml-auto">
          <span className="font-semibold tabular-nums">{fragileCount}</span> fragile
        </span>
      }
      className="flex flex-col"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col justify-center mb-4">
          {isError ? (
            <Feedback variant="danger" title="Failed to load projects" description="Check API connection." />
          ) : projects.length === 0 ? (
            <Feedback variant="success" title="All projects healthy" description="No active projects at risk" />
          ) : (
            <div className="space-y-4 p-0.5">
              {projects.map((p) => (
                <MediumProjectRow key={p.id} project={p} onClick={() => navigate(`/projects/${p.id}`)} />
              ))}
            </div>
          )}
        </div>
        <SecondaryButton onClick={() => navigate("/projects")}>View all projects →</SecondaryButton>
      </div>
    </ComposedCard>
  );
}

CriticalProjectsCard.Skeleton = function CriticalProjectsCardSkeleton() {
  return (
    <ComposedCard
      title="Critical Projects"
      action={<Skeleton className="h-3.5 w-16 ml-auto" />}
      className="flex flex-col"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col justify-center mb-4">
          <div className="space-y-4 p-0.5">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <MediumProjectRow.Skeleton key={i} />
            ))}
          </div>
        </div>
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </ComposedCard>
  );
};
