import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumRecommendationRow from "@/components/specified/models/recommendation/datas/MediumRecommendationRow.tsx";
import { Lightbulb } from "@phosphor-icons/react";

function priorityLevel(priority: number): "high" | "medium" | "low" {
  if (priority <= 1) return "high";
  if (priority === 2) return "medium";
  return "low";
}

function prioritySeverity(priority: number): Severity {
  if (priority <= 1) return "critical";
  if (priority === 2) return "warning";
  return "ok";
}

export default function RecommandationsImpactCard({ recs }: { recs: Recommendation[] }) {
  const sorted = [...recs].sort((a, b) => a.priority - b.priority);

  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Recommendations</span>
          <CountDisplay count={recs.length} />
        </div>
      }
    >
      {recs.length === 0 ? (
        <Feedback variant="success" title="No actions needed" description="No recommendations for this scenario." />
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <MediumRecommendationRow
              key={r.id}
              icon={Lightbulb}
              title={r.title}
              recommendation={r.detail}
              severity={prioritySeverity(r.priority)}
              priority={priorityLevel(r.priority)}
            />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

RecommandationsImpactCard.Skeleton = function RecommandationsImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Recommendations</span>
          <CountDisplay isLoading count={0} />
        </div>
      }
    >
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <MediumRecommendationRow.Skeleton key={i} />
        ))}
      </div>
    </ComposedCard>
  );
};
