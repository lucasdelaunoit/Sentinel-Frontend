import { useState } from "react";

import { SecondaryButton } from "@/components/common/buttons/SecondaryButton.tsx";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import PercentDonut from "@/components/common/charts/PercentDonut.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";

import useGetUsers from "@/api/users/useGetUsers.ts";
import useGetUsersCapacity from "@/api/users/useGetUsersCapacity.ts";
import AllUsersSheet from "@/components/specified/models/users/sheets/AllUsersSheet.tsx";
import MediumUserRow from "@/components/specified/models/users/datas/items/MediumUserRow.tsx";

const PREVIEW_COUNT = 5;

export default function TeamStatusOfTodayCard() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    data: awayUsers,
    isLoading,
    isError,
  } = useGetUsers({
    page: 1,
    per_page: PREVIEW_COUNT,
    filters: [{ field: "status", value: "away" }],
    includes: ["department"],
  });

  const { data: capacityData, isLoading: isCapacityLoading } = useGetUsersCapacity();

  if (isLoading || isCapacityLoading) return <TeamStatusOfTodayCard.Skeleton />;
  const capacityPct = capacityData?.capacity_pct ?? 0;

  return (
    <>
      <ComposedCard
        title="Today's Team Status"
        action={
          <div className="flex items-center gap-2 text-secondary-foreground ml-auto">
            <span className="text-xs">
              <span className="font-semibold tabular-nums">{capacityPct}%</span> present
            </span>
            <PercentDonut percent={capacityPct} size="sm" />
          </div>
        }
        className="flex flex-col"
      >
        <div className="flex flex-col justify-between h-full">
          <div className="flex-1 flex flex-col justify-center mb-4">
            {isError ? (
              <Feedback variant="danger" title="Failed to load team" description="Check API connection." />
            ) : awayUsers.length === 0 ? (
              <Feedback variant="success" title="All hands on deck" description="Everyone is available today" />
            ) : (
              <div className="space-y-4 p-0.5">
                {awayUsers.map((u) => (
                  <MediumUserRow key={u.id} user={u} />
                ))}
              </div>
            )}
          </div>
          <SecondaryButton onClick={() => setSheetOpen(true)}>View full team →</SecondaryButton>
        </div>
      </ComposedCard>

      <AllUsersSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </>
  );
}

TeamStatusOfTodayCard.Skeleton = function TeamStatusOfTodayCardSkeleton() {
  return (
    <ComposedCard
      title="Today's Team Status"
      action={
        <div className="flex items-center gap-2 ml-auto">
          <Skeleton className="h-3.5 w-20" />
          <PercentDonut.Skeleton size="sm" />
        </div>
      }
      className="flex flex-col"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex-1 flex flex-col justify-center mb-4">
          <div className="space-y-4 p-0.5">
            {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
              <MediumUserRow.Skeleton key={i} />
            ))}
          </div>
        </div>
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </ComposedCard>
  );
};
