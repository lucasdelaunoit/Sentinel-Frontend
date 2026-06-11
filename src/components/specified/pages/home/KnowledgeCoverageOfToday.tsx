import { useMemo } from "react";

import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import CoverageRadar, { type CoverageRadarDatum } from "@/components/common/charts/CoverageRadar.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";

import useGetKnowledgeCoverageDetail from "@/api/dashboard/useGetKnowledgeCoverageDetail";

const TARGET_PCT = 70;

export default function KnowledgeCoverageOfToday() {
  const { data, isLoading, isError } = useGetKnowledgeCoverageDetail();

  const chartData = useMemo<CoverageRadarDatum[]>(
    () =>
      (data?.categories ?? []).map((cat) => ({
        axis: cat.category_name,
        value: cat.coverage_pct,
        target: TARGET_PCT,
      })),
    [data],
  );

  if (isLoading) return <KnowledgeCoverageOfToday.Skeleton />;

  return (
    <ComposedCard
      title="Today's Knowledge Coverage"
      action={
        data?.most_fragile ? (
          <span className="text-xs text-secondary-foreground ml-auto">
            Weakest: <span className="font-semibold">{data.most_fragile}</span>
          </span>
        ) : undefined
      }
      className="flex flex-col"
    >
      <div className="h-full flex flex-col">
        <div className="my-auto w-full">
          {isError ? (
            <Feedback variant="danger" title="Failed to load coverage" description="Check API connection." />
          ) : chartData.length === 0 ? (
            <Feedback variant="neutral" title="No coverage data" description="No skill categories to display." />
          ) : (
            <CoverageRadar data={chartData} />
          )}
        </div>
      </div>
    </ComposedCard>
  );
}

KnowledgeCoverageOfToday.Skeleton = function KnowledgeCoverageOfTodaySkeleton() {
  return (
    <ComposedCard
      title="Today's Knowledge Coverage"
      action={<Skeleton className="h-3.5 w-28 ml-auto" />}
      className="flex flex-col"
    >
      <div className="h-full flex flex-col">
        <div className="my-auto w-full">
          <CoverageRadar.Skeleton />
        </div>
      </div>
    </ComposedCard>
  );
};
