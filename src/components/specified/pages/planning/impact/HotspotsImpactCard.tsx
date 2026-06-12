import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumHotspotRow from "@/components/specified/models/planning/datas/MediumHotspotRow.tsx";

interface HotspotsImpactCardProps {
  hotspots: Hotspot[];
  usersById: Map<string, PlanningUser>;
}

export default function HotspotsImpactCard({ hotspots, usersById }: HotspotsImpactCardProps) {
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
        <Feedback
          variant="success"
          title="No hotspots"
          description="No high-risk periods in this scenario."
          className="py-6"
        />
      ) : (
        <div className="space-y-2">
          {hotspots.map((hotspot, i) => (
            <MediumHotspotRow key={i} hotspot={hotspot} usersById={usersById} />
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
          <MediumHotspotRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
