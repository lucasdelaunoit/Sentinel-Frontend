import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import SeverityBadge from "@/components/specified/others/badges/SeverityBadge.tsx";
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
        <Feedback variant="success" title="No project impact" description="All skills remain covered." />
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
