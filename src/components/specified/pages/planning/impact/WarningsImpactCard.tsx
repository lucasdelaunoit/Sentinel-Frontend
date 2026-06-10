import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import MediumRecommendationRow from "@/components/specified/models/recommendation/datas/MediumRecommendationRow.tsx";
import { WarningIcon } from "@phosphor-icons/react";

export default function WarningsImpactCard({ warnings }: { warnings: SimWarning[] }) {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Warnings</span>
          <CountDisplay count={warnings.length} />
        </div>
      }
    >
      {warnings.length === 0 ? (
        <Feedback variant="success" title="No warnings" description="No warnings for this scenario." />
      ) : (
        <div className="space-y-2">
          {warnings.map((w, i) => (
            <MediumRecommendationRow
              key={i}
              icon={WarningIcon}
              title={w.code.replace(/_/g, " ")}
              recommendation={w.message}
              severity={w.severity}
            />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}

WarningsImpactCard.Skeleton = function WarningsImpactCardSkeleton() {
  return (
    <ComposedCard
      title={
        <div className="flex items-center gap-2">
          <span>Warnings</span>
          <CountDisplay.Skeleton />
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
