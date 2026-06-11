import { CalendarClock } from "lucide-react";
import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import useGetUpcomingRiskEvents from "@/api/dashboard/useGetUpcomingRiskEvents";
import MediumUpcomingRiskCard from "@/components/specified/others/datas/MediumUpcomingRiskCard.tsx";

const HORIZON_DAYS = 30;
const PREVIEW_COUNT = 4;

export default function UpcomingRiskEventsCard() {
  const { data, isLoading, isError } = useGetUpcomingRiskEvents(HORIZON_DAYS);

  if (isLoading) return <UpcomingRiskEventsCard.Skeleton />;

  const events = data?.events ?? [];

  return (
    <ComposedCard
      title="Upcoming Risk Events"
      action={<span className="ml-auto text-xs text-secondary-foreground">next {HORIZON_DAYS} days</span>}
    >
      {isError ? (
        <Feedback variant="danger" title="Failed to load risk events" description="Check API connection." />
      ) : events.length === 0 ? (
        <Feedback
          variant="success"
          title="No upcoming disruptions"
          description="No absences projected in the horizon."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {events.map((e) => (
            <MediumUpcomingRiskCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

UpcomingRiskEventsCard.Skeleton = function UpcomingRiskEventsCardSkeleton() {
  return (
    <ComposedCard
      title={
        <span className="flex items-center gap-2">
          <CalendarClock className="size-4 text-muted-foreground" /> Upcoming Risk Events
        </span>
      }
      action={<Skeleton className="ml-auto h-3.5 w-24" />}
    >
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: PREVIEW_COUNT }).map((_, i) => (
          <div key={i} className="flex gap-3 rounded-xl border border-border/50 bg-muted/10 p-3.5">
            <Skeleton className="size-14 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </ComposedCard>
  );
};
