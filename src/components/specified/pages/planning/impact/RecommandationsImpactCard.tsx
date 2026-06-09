import ComposedCard from "@/components/common/cards/ComposedCard.tsx";
import CountDisplay from "@/components/common/displays/CountDisplay.tsx";
import Feedback from "@/components/common/feedbacks/Feedback.tsx";
import SecondaryCard from "@/components/common/cards/SecondaryCard.tsx";
import { Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge.tsx";

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
        <Feedback variant="success" title="No project impact" description="All skills remain covered." />
      ) : (
        <div className="space-y-2">
          {sorted.map((r) => (
            <SecondaryCard
              key={r.id}
              before={<Lightbulb className="size-4 text-primary" />}
              title={
                <span className="flex items-center gap-2">
                  <Badge variant="default" className="h-4 px-1.5 text-[9px] uppercase">
                    {r.type}
                  </Badge>
                  {r.title}
                </span>
              }
              description={<span>{r.detail}</span>}
            />
          ))}
        </div>
      )}
    </ComposedCard>
  );
}
