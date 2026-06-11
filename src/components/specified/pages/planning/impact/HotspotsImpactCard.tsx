import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { getInitials } from "@/utils/formatters/persons.ts";

export default function HotspotsImpactCard({
  hotspots,
  usersById,
}: {
  hotspots: Hotspot[];
  usersById: Map<string, PlanningUser>;
}) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Hotspots</span>
          <CountDisplay count={hotspots.length} />
        </div>
      }
    >
      {hotspots.length === 0 ? (
        <Feedback variant="success" title="No hotspots" description="No high-risk periods in this scenario." className="py-6" />
      ) : (
        <div className="space-y-2">
          {hotspots.map((h, i) => (
            <SecondaryCard
              key={i}
              before={<Flame className={cn("size-4" /*, SEVERITY_SURFACE[h.severity].text*/)} />}
              title={`${h.date_range[0]} → ${h.date_range[1]}`}
              description={h.reason}
              action={
                <div className="flex flex-col items-end gap-1.5">
                  <SeverityBadge severity={h.severity} />
                  <div className="flex flex-wrap gap-1 justify-end">
                    {h.absent_user_ids.slice(0, 6).map((uid) => {
                      const u = usersById.get(uid);
                      return (
                        <span
                          key={uid}
                          className="flex size-5 items-center justify-center rounded-md bg-muted-foreground text-[8px] font-bold text-white"
                        >
                          {u?.status}
                          {u ? getInitials(u.firstname, u.lastname) : "?"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              }
            />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

HotspotsImpactCard.Skeleton = function HotspotsImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Hotspots</span>
          <CountDisplay.Skeleton />
        </div>
      }
    >
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl bg-tertiary p-3">
            <Skeleton className="size-4 shrink-0 rounded" />
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </ComposedCard>
  );
};
